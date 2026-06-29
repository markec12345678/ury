'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_PORT = 3003;

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

export function useURYSocket() {
  const [connected, setConnected] = useState(false);
  const kotNewRef = useRef<((kot: KOTNewEvent) => void) | null>(null);
  const kotStatusRef = useRef<((event: KOTStatusChangeEvent) => void) | null>(null);
  const tableStatusRef = useRef<((event: TableStatusChangeEvent) => void) | null>(null);

  useEffect(() => {
    connectionCount++;

    if (!globalSocket) {
      globalSocket = io('/?XTransformPort=' + SOCKET_PORT, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
        timeout: 10000,
      });
    }

    const socket = globalSocket;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onConnectError = () => setConnected(false);

    const onKotNew = (kot: KOTNewEvent) => {
      kotNewRef.current?.(kot);
    };

    const onKotStatus = (event: KOTStatusChangeEvent) => {
      kotStatusRef.current?.(event);
    };

    const onTableStatus = (event: TableStatusChangeEvent) => {
      tableStatusRef.current?.(event);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('kot_new', onKotNew);
    socket.on('kot_status_change', onKotStatus);
    socket.on('table_status_change', onTableStatus);

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

      connectionCount--;
      if (connectionCount <= 0) {
        socket.disconnect();
        globalSocket = null;
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

  return { onKOTNew, onKOTStatusChange, onTableStatusChange, connected };
}
