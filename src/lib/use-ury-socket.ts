'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const DEFAULT_SOCKET_PORT = 3003;

// ── Event Types ──────────────────────────────────────────

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

export interface InvoiceEvent {
  invoiceName: string;
  status: 'Draft' | 'Paid' | 'Cancelled';
  amount: number;
  customer: string;
}

// ── Frappe Realtime Doc Event ────────────────────────────
// Frappe sends doc_update and list_update events with this shape

interface FrappeDocEvent {
  doctype: string;
  name: string;
  action?: string; // 'insert' | 'update' | 'delete' | 'submit' | 'cancel'
  doc?: Record<string, unknown>;
  keys?: Record<string, unknown>;
}

// ── Global Socket Singleton ──────────────────────────────

let globalSocket: Socket | null = null;
let connectionCount = 0;
let currentSocketUrl: string | null = null;
let subscribedRooms: Set<string> = new Set();

// Frappe doctypes we want realtime updates for
const FRAPPE_ROOMS = [
  'URY KOT',
  'URY Table',
  'POS Invoice',
  'URY Room',
  'POS Opening Entry',
  'POS Closing Entry',
  'URY Daily P&L',
];

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
        return config.baseUrl.replace(/\/+$/, '');
      }
    }
  } catch {
    // ignore parse errors
  }

  return `http://localhost:${DEFAULT_SOCKET_PORT}`;
}

/**
 * Subscribe to Frappe realtime rooms for specific doctypes.
 * Frappe uses the 'task_subscribe' event with room names like:
 * - "doc:URY KOT" for document updates
 * - "list:URY KOT" for list updates
 */
function subscribeToFrappeRooms(socket: Socket) {
  if (!socket.connected) return;

  FRAPPE_ROOMS.forEach((doctype) => {
    const docRoom = `doc:${doctype}`;
    const listRoom = `list:${doctype}`;

    if (!subscribedRooms.has(docRoom)) {
      socket.emit('task_subscribe', docRoom);
      subscribedRooms.add(docRoom);
    }
    if (!subscribedRooms.has(listRoom)) {
      socket.emit('task_subscribe', listRoom);
      subscribedRooms.add(listRoom);
    }
  });

  console.log('[URY Socket] Subscribed to Frappe rooms:', Array.from(subscribedRooms));
}

/**
 * Unsubscribe from all Frappe rooms.
 */
function unsubscribeFromFrappeRooms(socket: Socket) {
  subscribedRooms.forEach((room) => {
    socket.emit('task_unsubscribe', room);
  });
  subscribedRooms.clear();
}

/**
 * Map Frappe doc action to KOT status.
 */
function mapFrappeKOTStatus(doc: Record<string, unknown> | undefined): KOTStatusChangeEvent['newStatus'] {
  if (!doc) return 'new';
  const status = String(doc.status || doc.kot_status || '').toLowerCase();
  if (status.includes('prepar') || status.includes('in_progress') || status.includes('cooking')) return 'preparing';
  if (status.includes('ready') || status.includes('complete') || status.includes('done')) return 'ready';
  if (status.includes('serv') || status.includes('deliver')) return 'served';
  if (status.includes('cancel')) return 'cancelled';
  if (status.includes('modif')) return 'modified';
  return 'new';
}

/**
 * Map Frappe table status to our status type.
 */
function mapFrappeTableStatus(doc: Record<string, unknown> | undefined): TableStatusChangeEvent['status'] {
  if (!doc) return 'free';
  const status = String(doc.status || doc.occupancy_status || '').toLowerCase();
  if (status.includes('occup') || status.includes('in_use') || status.includes('active')) return 'occupied';
  if (status.includes('attention') || status.includes('alert') || status.includes('wait')) return 'attention';
  return 'free';
}

// ── Hook ─────────────────────────────────────────────────

export function useURYSocket() {
  const [connected, setConnected] = useState(false);
  const kotNewRef = useRef<((kot: KOTNewEvent) => void) | null>(null);
  const kotStatusRef = useRef<((event: KOTStatusChangeEvent) => void) | null>(null);
  const tableStatusRef = useRef<((event: TableStatusChangeEvent) => void) | null>(null);
  const invoiceRef = useRef<((event: InvoiceEvent) => void) | null>(null);

  useEffect(() => {
    connectionCount++;

    const socketUrl = getSocketUrl();
    const isFrappe = !socketUrl.includes('localhost');

    // Only create new socket if URL changed or no socket exists
    if (!globalSocket || currentSocketUrl !== socketUrl) {
      if (globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
        subscribedRooms.clear();
      }

      currentSocketUrl = socketUrl;

      globalSocket = io(socketUrl, {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: isFrappe ? 15 : 5,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        timeout: 15000,
        withCredentials: isFrappe,
        // Frappe requires a specific namespace sometimes
        // forceNew: true,
      });
    }

    const socket = globalSocket;

    // ── Connection Handlers ──────────────────────────────

    const onConnect = () => {
      setConnected(true);
      console.log('[URY Socket] Connected to', socketUrl);

      // Subscribe to Frappe realtime rooms when connected to Frappe
      if (isFrappe) {
        subscribeToFrappeRooms(socket);
      }
    };

    const onDisconnect = (reason: string) => {
      setConnected(false);
      console.log('[URY Socket] Disconnected:', reason);
    };

    const onConnectError = (err: Error) => {
      setConnected(false);
      console.warn('[URY Socket] Connection error:', err.message);
    };

    // ── Custom URY Events (demo/local mode) ──────────────

    const onKotNew = (kot: KOTNewEvent) => {
      kotNewRef.current?.(kot);
    };

    const onKotStatus = (event: KOTStatusChangeEvent) => {
      kotStatusRef.current?.(event);
    };

    const onTableStatus = (event: TableStatusChangeEvent) => {
      tableStatusRef.current?.(event);
    };

    // ── Frappe Realtime Doc Events ───────────────────────

    const onDocUpdate = (data: FrappeDocEvent) => {
      console.log('[URY Socket] doc_update:', data.doctype, data.name, data.action);

      if (data.doctype === 'URY KOT') {
        if (data.action === 'insert') {
          // New KOT created — construct event from doc data
          const doc = data.doc || {};
          kotNewRef.current?.({
            id: String(data.name || doc.name || ''),
            orderNo: String(doc.order_no || doc.orderNo || ''),
            table: String(doc.restaurant_table || doc.table || ''),
            items: Array.isArray(doc.items)
              ? doc.items.map((item: Record<string, unknown>) => ({
                  name: String(item.item_name || item.name || ''),
                  qty: Number(item.qty || 1),
                  course: item.course ? String(item.course) : undefined,
                  comments: item.comments ? String(item.comments) : undefined,
                }))
              : [],
            timePlaced: doc.time_placed
              ? String(doc.time_placed).slice(0, 5)
              : new Date().toLocaleTimeString('sl-SI', { hour: '2-digit', minute: '2-digit' }),
            elapsed: Number(doc.elapsed || 0),
            status: mapFrappeKOTStatus(doc as Record<string, unknown>),
            production: String(doc.production_unit || doc.production || 'Kuhinja 1'),
            kotType: (doc.kot_type || 'New Order') as KOTNewEvent['kotType'],
            customer: String(doc.customer || ''),
          });
        } else if (data.action === 'update' || data.action === 'submit') {
          // KOT status changed
          const doc = data.doc || {};
          kotStatusRef.current?.({
            kotId: String(data.name || ''),
            newStatus: mapFrappeKOTStatus(doc as Record<string, unknown>),
          });
        } else if (data.action === 'cancel') {
          kotStatusRef.current?.({
            kotId: String(data.name || ''),
            newStatus: 'cancelled',
          });
        }
      }

      if (data.doctype === 'URY Table') {
        const doc = data.doc || {};
        tableStatusRef.current?.({
          tableId: parseInt(String(data.name || doc.name || '0').replace(/\D/g, '') || '0'),
          status: mapFrappeTableStatus(doc as Record<string, unknown>),
          pax: Number(doc.no_of_seats || doc.pax || 0),
          customer: doc.customer ? String(doc.customer) : undefined,
          occupiedSince: doc.occupied_since ? String(doc.occupied_since) : undefined,
        });
      }

      if (data.doctype === 'POS Invoice') {
        const doc = data.doc || {};
        invoiceRef.current?.({
          invoiceName: String(data.name || ''),
          status: (doc.status as InvoiceEvent['status']) || 'Draft',
          amount: Number(doc.grand_total || 0),
          customer: String(doc.customer || ''),
        });
      }
    };

    const onListUpdate = (data: FrappeDocEvent) => {
      // List updates mean a document in a list changed — trigger targeted refresh
      console.log('[URY Socket] list_update:', data.doctype);
      // The store's auto-refresh will handle the data update
    };

    // ── Register all event handlers ──────────────────────

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    // Custom URY events (demo/local mode)
    socket.on('kot_new', onKotNew);
    socket.on('kot_status_change', onKotStatus);
    socket.on('table_status_change', onTableStatus);
    // Frappe standard realtime events
    socket.on('doc_update', onDocUpdate);
    socket.on('list_update', onListUpdate);

    // If already connected, set state and subscribe
    if (socket.connected) {
      setConnected(true);
      if (isFrappe) {
        subscribeToFrappeRooms(socket);
      }
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('kot_new', onKotNew);
      socket.off('kot_status_change', onKotStatus);
      socket.off('table_status_change', onTableStatus);
      socket.off('doc_update', onDocUpdate);
      socket.off('list_update', onListUpdate);

      connectionCount--;
      if (connectionCount <= 0) {
        unsubscribeFromFrappeRooms(socket);
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

  const onInvoiceEvent = useCallback((cb: (event: InvoiceEvent) => void) => {
    invoiceRef.current = cb;
  }, []);

  /**
   * Force reconnect with new URL (e.g. after Frappe config change)
   */
  const reconnect = useCallback(() => {
    if (globalSocket) {
      unsubscribeFromFrappeRooms(globalSocket);
      globalSocket.disconnect();
      globalSocket = null;
      currentSocketUrl = null;
    }
    // Next render cycle will create new connection
  }, []);

  return {
    onKOTNew,
    onKOTStatusChange,
    onTableStatusChange,
    onInvoiceEvent,
    connected,
    reconnect,
  };
}

/**
 * Force socket reconnection after config change.
 * Call this after updating Frappe config in settings.
 */
export function reconnectSocket(): void {
  if (globalSocket) {
    unsubscribeFromFrappeRooms(globalSocket);
    globalSocket.disconnect();
    globalSocket = null;
    currentSocketUrl = null;
  }
}

/**
 * Get the current socket connection status.
 * Useful for non-hook contexts.
 */
export function isSocketConnected(): boolean {
  return globalSocket?.connected ?? false;
}
