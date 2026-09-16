import { io, Socket } from 'socket.io-client';

const WS_URL = (import.meta as any).env?.VITE_WS_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(token?: string) {
    if (this.socket?.connected) return;

    this.socket = io(WS_URL, {
      auth: token ? { token } : {},
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });

    // Re-register all stored listeners
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(cb => this.socket?.on(event, cb as any));
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  on<T = any>(event: string, callback: (data: T) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    this.socket?.on(event, callback as any);

    // Return cleanup function
    return () => this.off(event, callback);
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
    this.socket?.off(event, callback as any);
  }

  emit(event: string, data?: any) {
    this.socket?.emit(event, data);
  }

  joinRoom(room: string) {
    this.socket?.emit('join_room', room);
  }

  isConnected() {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
