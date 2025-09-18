/// <reference types="node" />
import { io, Socket } from "socket.io-client";
import { Platform } from "react-native";

console.log("⚡ socketService.ts file imported"); // <- log when file loads

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  connect = async (token: string) => {
    console.log("🔌 socketService.connect() called with token:", !!token);

    if (!token) {
      console.warn("No auth token found, cannot connect to socket");
      return;
    }

    // Clean up existing connection first
    this.disconnect();

    const socketURL =
      Platform.OS === "android"
        ? "http://10.0.2.2:5000"
        : "http://localhost:5000";

    console.log("🌐 Connecting to socket server at:", socketURL);

    this.socket = io(socketURL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 3000,
      timeout: 10000,
    });

    this.setupEventListeners();
  };

  disconnect = () => {
    console.log("🔌 socketService.disconnect() called");
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      console.log("✅ Socket instance cleared");
    }
    this.stopHeartbeat();
    this.listeners.clear();
  };

  private setupEventListeners = () => {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("✅ Socket connected with ID:", this.socket?.id);
      this.emitEvent("connection", { socketId: this.socket?.id });
      this.startHeartbeat();
    });

    this.socket.on("disconnect", (reason) => {
      console.log("⚠️ Socket disconnected:", reason);
      this.emitEvent("disconnect", { reason });
      this.stopHeartbeat();
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message || error);
      this.emitEvent("connect_error", { error });
    });

    this.socket.on("new_message", (message) => {
      console.log("📩 New message received:", message);
      this.emitEvent("new_message", message);
    });

    this.socket.on("message_read", (data) => {
      console.log("👀 Message read status updated:", data);
      this.emitEvent("message_read", data);
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
      this.emitEvent("error", { error });
    });
  };

  // --- Messaging methods ---
  sendMessage = (roomId: string, content: string, senderId: string) => {
    if (!this.socket) {
      console.warn("⚠️ Socket not connected");
      return;
    }
    const messageData = {
      roomId,
      content,
      senderId,
      timestamp: new Date().toISOString(),
    };
    console.log("📤 Sending message:", messageData);
    this.socket.emit("send_message", messageData);
  };

  markMessageAsRead = (messageId: string, userId: string) => {
    console.log("👀 Marking message as read:", { messageId, userId });
    this.socket?.emit("mark_message_read", { messageId, userId });
  };

  joinRoom = (roomId: string) => {
    console.log("🚪 Joining room:", roomId);
    this.socket?.emit("join_room", roomId);
  };

  leaveRoom = (roomId: string) => {
    console.log("🚪 Leaving room:", roomId);
    this.socket?.emit("leave_room", roomId);
  };

  // --- Event listeners ---
  addListener = (event: string, callback: Function) => {
    console.log("➕ Listener added for:", event);
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  };

  removeListener = (event: string, callback?: Function) => {
    console.log("➖ Listener removed for:", event);
    if (!callback) {
      this.listeners.delete(event);
    } else {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        this.listeners.set(
          event,
          callbacks.filter((cb) => cb !== callback)
        );
      }
    }
  };

  private emitEvent = (event: string, data: any) => {
    console.log(`📢 Emitting event '${event}' to ${this.listeners.get(event)?.length || 0} listeners`);
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach((cb) => {
      try {
        cb(data);
      } catch (err) {
        console.error(`Error in ${event} listener:`, err);
      }
    });
  };

  isConnected = (): boolean => {
    return this.socket?.connected || false;
  };

  getSocketId = (): string | undefined => {
    return this.socket?.id;
  };

  private startHeartbeat = () => {
    console.log("❤️ Starting heartbeat");
    this.stopHeartbeat(); 
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        console.log("❤️ Sending heartbeat");
        this.socket.emit("heartbeat");
      }
    }, 60000);
  };

  private stopHeartbeat = () => {
    console.log("💔 Stopping heartbeat");
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  };
}

export const socketService = new SocketService();
