import { io, Socket } from 'socket.io-client';

// 1. Define the URL
const SOCKET_URL = 'http://localhost:3000'; // Make sure this matches your backend port

class SocketServiceClass {
    public socket: Socket | null = null;

    connect() {
        // Only connect if not already connected
        if (this.socket) return this.socket;

        // Get token from localStorage (adjust key if you use 'token' or 'user_data')
        const storedData = localStorage.getItem('user_data');
        let token = null;
        if (storedData) {
            try { 
                token = JSON.parse(storedData).token; 
            } catch (e) { 
                console.error("Error parsing token for socket", e);
            }
        }

        if (!token) {
            console.warn("⚠️ No token found, socket might be rejected by backend.");
        }

        // Initialize the connection
        this.socket = io(SOCKET_URL, {
            auth: { token: token },
            transports: ['websocket'], // Force websocket for better performance
            autoConnect: true
        });

        this.socket.on('connect', () => {
            console.log("✅ Socket Connected Globally:", this.socket?.id);
        });

        this.socket.on('connect_error', (err) => {
            console.error("❌ Socket Connection Error:", err.message);
        });

        return this.socket;
    }

    getSocket() {
        if (!this.socket) {
            return this.connect();
        }
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            console.log("🔌 Socket Disconnected");
        }
    }
}

// Export a single instance (Singleton)
export const SocketService = new SocketServiceClass();