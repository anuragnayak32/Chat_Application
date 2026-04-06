const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

const messageRoutes = require("./routes/messages");
const userRoutes = require("./routes/users");

const app = express();
const server = http.createServer(app);

// ✅ Safe CORS origin
const allowedOrigin =
  process.env.NODE_ENV === "production"
    ? process.env.FRONTEND_URL
    : "http://localhost:5173";

// ✅ Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Express CORS
app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));

app.use(express.json());

// Make io accessible in routes
app.set("io", io);

// Routes
app.use("/messages", messageRoutes);
app.use("/users", userRoutes);

// ✅ SIMPLE health check (important for Railway)
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Socket connection
io.on("connection", (socket) => {
  console.log(`✓ Client connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`✗ Client disconnected: ${socket.id}`);
  });
});

// MongoDB + Server start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✓ MongoDB connected");

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  })
  .catch((err) => {
    console.error("✗ MongoDB connection error:", err.message);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down...");
  server.close(() => {
    mongoose.connection.close(false, () => {
      process.exit(0);
    });
  });
});