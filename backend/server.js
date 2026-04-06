const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const messageRoutes = require("./routes/messages");
const userRoutes = require("./routes/users");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production" 
      ? process.env.FRONTEND_URL || "*"
      : "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

app.use(cors());
app.use(express.json());

// Make io accessible in route handlers
app.set("io", io);

app.use("/messages", messageRoutes);
app.use("/users", userRoutes);

// Health check
app.get("/", (req, res) => res.json({ status: "ok", message: "ChatApp Backend" }));

// Socket.io connection handler
io.on("connection", (socket) => {
  console.log(`✓ Client connected: ${socket.id}`);
  
  socket.on("disconnect", () => {
    console.log(`✗ Client disconnected: ${socket.id}`);
  });

  socket.on("error", (error) => {
    console.error(`Socket error [${socket.id}]:`, error);
  });
});

// MongoDB connection and server startup
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/chatapp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✓ MongoDB connected");
    server.listen(process.env.PORT || 5000, () => {
      console.log(`✓ Server running on port ${process.env.PORT || 5000}`);
      console.log(`  Environment: ${process.env.NODE_ENV || "development"}`);
    });
  })
  .catch((err) => {
    console.error("✗ MongoDB connection error:", err.message);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    mongoose.connection.close();
    process.exit(0);
  });
});
