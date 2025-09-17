import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect = async (token: string) => {
    try {
      if (!token) {
        console.warn('No auth token found, cannot connect to socket');
        return;
      }

      // Disconnect existing connection if any
      if (this.socket) {
        this.socket.disconnect();
      }

      // Use correct base URL depending on platform
      const socketURL = Platform.OS === 'android' 
        ? 'http://10.0.2.2:5000'  // Android emulator
        : 'http://localhost:5000'; // iOS simulator

      // Connect to WebSocket server
      this.socket = io(socketURL, {
        auth: { token },
        transports: ['websocket'],   // force websocket only
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Error connecting to socket:', error);
    }
  };

  disconnect = () => {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('🔌 Socket disconnected');
    }
  };

  private setupEventListeners = () => {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected with ID:', this.socket?.id);
      this.emitEvent('connection', { socketId: this.socket?.id });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('⚠️ Socket disconnected:', reason);
      this.emitEvent('disconnect', { reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message || error);
      this.emitEvent('connect_error', { error });
    });

    // Listen for new messages
    this.socket.on('new_message', (message) => {
      console.log('📩 New message received:', message);
      this.emitEvent('new_message', message);
    });

    // Listen for message read status updates
    this.socket.on('message_read', (data) => {
      console.log('👀 Message read status updated:', data);
      this.emitEvent('message_read', data);
    });
  };

  // Send a message
  sendMessage = (roomId: string, content: string, senderId: string) => {
    if (!this.socket) {
      console.warn('⚠️ Socket not connected');
      return;
    }

    const messageData = {
      roomId,
      content,
      senderId,
      timestamp: new Date().toISOString()
    };

    this.socket.emit('send_message', messageData);
    console.log('📤 Message sent:', messageData);
  };

  // Mark messages as read
  markMessageAsRead = (messageId: string, userId: string) => {
    if (!this.socket) {
      console.warn('⚠️ Socket not connected');
      return;
    }

    this.socket.emit('mark_message_read', { messageId, userId });
  };

  // Join a chat room
  joinRoom = (roomId: string) => {
    if (!this.socket) {
      console.warn('⚠️ Socket not connected');
      return;
    }

    this.socket.emit('join_room', roomId);
    console.log('🚪 Joined room:', roomId);
  };

  // Leave a chat room
  leaveRoom = (roomId: string) => {
    if (!this.socket) {
      console.warn('⚠️ Socket not connected');
      return;
    }

    this.socket.emit('leave_room', roomId);
    console.log('🚪 Left room:', roomId);
  };

  // Event listener management
  addListener = (event: string, callback: Function) => {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  };

  removeListener = (event: string, callback: Function) => {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  };

  private emitEvent = (event: string, data: any) => {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      if (event === 'new_message') {
        console.log('SocketService: Emitting new_message to internal listeners:', data); // Debug log
      }
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  };

  // Check if socket is connected
  isConnected = (): boolean => {
    return this.socket?.connected || false;
  };

  // Get socket ID
  getSocketId = (): string | undefined => {
    return this.socket?.id;
  };
}

// Export singleton instance
export const socketService = new SocketService();
