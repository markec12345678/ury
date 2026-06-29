'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const DEFAULT_SOCKET_PORT = 3003;

export interface KOTNewEvent {
  id: string;
  orderNo: string;
  table: string;
  items: Array<{ name: string; qty: number; course?: string; comments?: string }>;
  timePlaced: string;
  elapsed: number;
  status: 'new' | 'modified' | 'cancelled' | 'ready' | 'preparing' | 'served';
  production: string;
  kotType: "New Order" | "Order Modified" | "Partially cancelled";
  customer: string;
}

export interface KOTStatusChangeEvent {
  kotId: string;
  newStatus: 'new' | 'modified' | 'cancelled' | 'ready' | 'preparing' | 'served';
}

export interface TableStatusChangeEvent {
  tableId: number;
  status: 'free' | 'occupied' | 'attention';
  pax: number;
  customer?: string;
  occupiedSince?: string;
}

// Global singleton socket - prevents multiple connections
let globalSocket: Socket | null = null;
let connectionCount = 0;
let currentSocketUrl: string | null = null;

/**
 * Get the Socket.io URL based on connection state.
 * When connected to Frappe, use the Frappe server URL.
 * Otherwise, fall back to localhost for demo/simulation.
 */
function getSocketUrl(): string {
  if (typeof window === 'undefined') return `http://localhost:${DEFAULT_SOCKET_PORT}`;

  try {
    const configRaw = localStorage.getItem('ury_frappe_config');
    if (configRaw) {
      const config = JSON.parse(configRaw);
      if (config.baseUrl) {
        // Frappe uses Socket.io on the same host
        // e.g. https://erp.myrestaurant.com
        return config.baseUrl.replace(/\/+$/, '');
      }
    }
  } catch {
    // ignore parse errors
  }

  return `http://localhost:${DEFAULT_SOCKET_PORT}`;
}

export function useURYSocket() {
  const [connected, setConnected] = useState(false);
  const kotNewRef = useRef<((kot: KOTNewEvent) => void) | null>(null);
  const kotStatusRef = useRef<((event: KOTStatusChangeEvent) => void) | null>(null);
  const tableStatusRef = useRef<((event: TableStatusChangeEvent) => void) | null>(null);

  useEffect(() => {
    connectionCount++;

    const socketUrl = getSocketUrl();

    // Only create new socket if URL changed or no socket exists
    if (!globalSocket || currentSocketUrl !== socketUrl) {
      // Disconnect old socket if URL changed
      if (globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
      }

      currentSocketUrl = socketUrl;

      // Frappe Socket.io connects to the root URL with specific path
      const isFrappe = !socketUrl.includes('localhost');

      globalSocket = io(socketUrl, {
        path: isFrappe ? '/socket.io' : '/socket.io',
        transports: isFrappe ? ['websocket', 'polling'] : ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: isFrappe ? 10 : 5,
        reconnectionDelay: 3000,
        timeout: 10000,
        // For Frappe, we need to send the session cookie
        withCredentials: isFrappe,
      });
    }

    const socket = globalSocket;

    const onConnect = () => {
      setConnected(true);
      console.log('[URY Socket] Connected to', socketUrl);
    };
    const onDisconnect = () => {
      setConnected(false);
      console.log('[URY Socket] Disconnected');
    };
    const onConnectError = (err: Error) => {
      setConnected(false);
      console.warn('[URY Socket] Connection error:', err.message);
    };

    const onKotNew = (kot: KOTNewEvent) => {
      kotNewRef.current?.(kot);
    };

    const onKotStatus = (event: KOTStatusChangeEvent) => {
      kotStatusRef.current?.(event);
    };

    const onTableStatus = (event: TableStatusChangeEvent) => {
      tableStatusRef.current?.(event);
    };

    // Frappe realtime events
    // Frappe uses doc events: {doctype}:{event}
    // e.g. "URY KOT":after_insert, "URY KOT":on_update
    const onFrappeDocUpdate = (data: { doctype: string; name: string; event: string; data?: unknown }) => {
      if (data.doctype === 'URY KOT') {
        if (data.event === 'after_insert') {
          // New KOT created - could trigger a full refresh
          kotNewRef.current?.({
            id: data.name,
            orderNo: '',
            table: '',
            items: [],
            timePlaced: new Date().toLocaleTimeString('sl-SI', { hour: '2-digit', minute: '2-digit' }),
            elapsed: 0,
            status: 'new',
            production: 'Kuhinja 1',
            kotType: 'New Order',
            customer: '',
          });
        } else if (data.event === 'on_update') {
          // KOT status changed
          kotStatusRef.current?.({
            kotId: data.name,
            newStatus: 'preparing', // Status would come from data
          });
        }
      }
      if (data.doctype === 'URY Table') {
        tableStatusRef.current?.({
          tableId: parseInt(data.name?.replace(/\D/g, '') || '0'),
          status: 'occupied',
        });
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    // Custom URY events (for demo/local mode)
    socket.on('kot_new', onKotNew);
    socket.on('kot_status_change', onKotStatus);
    socket.on('table_status_change', onTableStatus);
    // Frappe standard realtime events
    socket.on('doc_update', onFrappeDocUpdate);
    socket.on('list_update', onFrappeDocUpdate);

    // If already connected
    if (socket.connected) {
      setConnected(true);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('kot_new', onKotNew);
      socket.off('kot_status_change', onKotStatus);
      socket.off('table_status_change', onTableStatus);
      socket.off('doc_update', onFrappeDocUpdate);
      socket.off('list_update', onFrappeDocUpdate);

      connectionCount--;
      if (connectionCount <= 0) {
        socket.disconnect();
        globalSocket = null;
        currentSocketUrl = null;
        connectionCount = 0;
      }
    };
  }, []);

  const onKOTNew = useCallback((cb: (kot: KOTNewEvent) => void) => {
    kotNewRef.current = cb;
  }, []);

  const onKOTStatusChange = useCallback((cb: (event: KOTStatusChangeEvent) => void) => {
    kotStatusRef.current = cb;
  }, []);

  const onTableStatusChange = useCallback((cb: (event: TableStatusChangeEvent) => void) => {
    tableStatusRef.current = cb;
  }, []);

  /**
   * Force reconnect with new URL (e.g. after Frappe config change)
   */
  const reconnect = useCallback(() => {
    if (globalSocket) {
      globalSocket.disconnect();
      globalSocket = null;
      currentSocketUrl = null;
    }
    // Next render cycle will create new connection
  }, []);

  return { onKOTNew, onKOTStatusChange, onTableStatusChange, connected, reconnect };
}

/**
 * Force socket reconnection after config change.
 * Call this after updating Frappe config in settings.
 */
export function reconnectSocket(): void {
  if (globalSocket) {
    globalSocket.disconnect();
    globalSocket = null;
    currentSocketUrl = null;
  }
}
