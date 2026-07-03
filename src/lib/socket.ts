// src/lib/socket.ts — Socket.io v4 client for real-time GPS
import { io, Socket } from 'socket.io-client';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
const _extra = Constants.expoConfig?.extra ?? {};
const SOCKET_URL: string =
  _extra.SOCKET_URL ??
  (Platform.OS === 'web' ? 'http://localhost:3000' : 'http://10.0.2.2:3000');
let socket: Socket | null = null;
export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket;
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });
  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id);
  });
  socket.on('connect_error', (err) => {
    console.warn('[Socket] Connection error:', err.message);
  });
  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });
  return socket;
}
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
export function getSocket(): Socket | null {
  return socket;
}
/** Join the admin room to receive ALL location updates */
export function joinAdminRoom() {
  socket?.emit('join-admin');
}
/** Join personal user room to receive sejarah:updated events */
export function joinUserRoom(userId: string) {
  socket?.emit('join-user', userId);
}
/** Leave personal user room (call on logout) */
export function leaveUserRoom(userId: string) {
  socket?.emit('leave-user', userId);
}
/** Join a project-specific GPS room */
export function joinProjectRoom(projectId: string) {
  socket?.emit('join-project', projectId);
}
/** Leave a project-specific GPS room */
export function leaveProjectRoom(projectId: string) {
  socket?.emit('leave-project', projectId);
}