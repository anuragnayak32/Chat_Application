import { io } from "socket.io-client";

const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

// Single socket instance shared across the app
const socket = io(socketUrl, {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  transports: ["websocket", "polling"],
});

// Socket event listeners for debugging
socket.on("connect", () => {
  console.log("✓ Connected to server");
});

socket.on("disconnect", (reason) => {
  console.log("✗ Disconnected from server:", reason);
});

socket.on("reconnect_attempt", () => {
  console.log("⟳ Attempting to reconnect...");
});

socket.on("error", (error) => {
  console.error("Socket error:", error);
});

export default socket;
