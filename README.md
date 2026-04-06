# ChatApp - Real-Time Chat Application

A modern, full-stack real-time chat application built with **React**, **Node.js**, **Express**, **Socket.io**, and **MongoDB**. Supports sending/receiving messages, deleting (for self or everyone), pinning messages, and real-time updates.

## 🎯 Features

- ✅ **Real-time messaging** with WebSocket (Socket.io)
- ✅ **Delete for Me** - Hide message for current user only
- ✅ **Delete for Everyone** - Remove message for all users
- ✅ **Pin Messages** - Highlight important messages in a dedicated strip
- ✅ **Message persistence** - All messages stored in MongoDB
- ✅ **Auto-scroll** - Automatically scroll to latest messages
- ✅ **Connection status** - Live connection indicator
- ✅ **Auto-reconnect** - Automatic reconnection on disconnect
- ✅ **Clean, modern UI** - Dark theme with intuitive controls

## 📋 Prerequisites

- **Node.js** 16+ (tested with 18+)
- **MongoDB** 4.4+ (local or Atlas)
- **npm** or **yarn**

## 🚀 Quick Start

### 1. Clone & Setup

```bash
git clone <your-repo-url> chat-app
cd chat-app
```

### 2. Backend Setup

```bash
cd backend

# Create environment file
cp .env.example .env
# Edit .env and add your MongoDB URI if using Atlas

# Install dependencies
npm install

# Start development server (with auto-reload via nodemon)
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
# App available at http://localhost:5173
```

### 4. Open in Browser

Open **http://localhost:5173** in your browser. Open multiple tabs to test real-time messaging.

---

## 📁 Project Structure

```
chat-app/
├── backend/
│   ├── models/
│   │   └── Message.js              # Mongoose schema for messages
│   ├── routes/
│   │   └── messages.js             # API route definitions
│   ├── controllers/
│   │   └── messageController.js    # Business logic
│   ├── .env.example                # Environment template
│   ├── .env                        # Local config (not committed)
│   ├── server.js                   # Express + Socket.io server
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Message.jsx         # Individual message component
│   │   │   ├── Message.module.css
│   │   │   ├── MessageInput.jsx    # Input form component
│   │   │   ├── MessageInput.module.css
│   │   │   ├── PinnedMessages.jsx  # Pinned messages strip
│   │   │   └── PinnedMessages.module.css
│   │   ├── hooks/
│   │   │   └── useMessages.js      # Custom hook for message state
│   │   ├── api.js                  # API client functions
│   │   ├── socket.js               # Socket.io client instance
│   │   ├── App.jsx                 # Main app component
│   │   ├── App.module.css
│   │   ├── index.css               # Global styles
│   │   ├── main.jsx                # React entry point
│   │   └── vite.config.js
│   ├── index.html
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🔧 API Documentation

### Endpoints

#### `GET /messages`
Fetch all messages.

**Response:**
```json
[
  {
    "_id": "...",
    "content": "Hello world",
    "sender": "You",
    "deletedForEveryone": false,
    "deletedFor": [],
    "isPinned": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

#### `POST /messages`
Send a new message.

**Request:**
```json
{
  "content": "Hello",
  "sender": "You"
}
```

**Response:** Returns created message object

#### `DELETE /messages/:id`
Delete a message.

**Request Body:**
```json
{
  "type": "me" | "everyone",
  "userId": "user_abc123"
}
```

- `type: "me"` - Hide only for current user (added to `deletedFor` array)
- `type: "everyone"` - Mark deleted for all (sets `deletedForEveryone: true`)

#### `PUT /messages/:id/pin`
Toggle pin status on a message.

**Response:** Returns updated message object

### Socket.io Events

**Emitted by server:**
- `new_message` - New message sent
- `message_updated` - Message deleted/pinned

**Listened by client:**
- Connects to updates in real-time

---

## 🎨 Design Decisions & Tradeoffs

### Architecture
- **Socket.io for sockets** - Reliable real-time updates, better than polling
- **Express.js** - Lightweight, well-suited for simple APIs
- **MongoDB** - Schema-flexible, easy to add fields later
- **React with Hooks** - Simple component model, minimal boilerplate

### Data Model
- **No Authentication** - Simplified for time constraints; identified by random user ID
- **"Delete for Me"** - Stored as array in DB for client-side filtering (scalable up to moderate load)
- **"Delete for Everyone"** - Tombstone approach (keeps message, marks deleted)
- **Pinned messages** - Simple boolean flag, fetched with all messages

### Frontend
- **No state management library** - Hooks + Socket.io listeners sufficient for app complexity
- **CSS Modules** - Scoped styles, avoids conflicts
- **Auto-scroll** - Uses ref; smooth behavior for better UX

### Real-time
- **Socket.io auto-reconnect** - 5 retry attempts with exponential backoff
- **Optimistic updates skipped** - Server socket broadcast is fast enough

### Tradeoffs Made
- No message editing (time constraint)
- No user presence (typing indicators, online status)
- No message search
- No message groups/threads
- Client-side "delete for me" (limits to single device; production would need auth + server-side filtering)

---

## 🚢 Deployment

### Backend Deployment (Render, Railway, etc.)

1. Push to GitHub
2. Create account on [Render.com](https://render.com) or [Railway.app](https://railway.app)
3. Connect GitHub repo
4. Set environment variables:
   - `MONGO_URI` - Your MongoDB Atlas URI
   - `NODE_ENV` - Set to `production`
   - `PORT` - 5000 or auto-assigned
5. Deploy and get backend URL (e.g., `https://chat-app-backend.onrender.com`)

### Frontend Deployment (Vercel, Netlify, etc.)

1. Update `api.js` to use deployed backend URL:
   ```javascript
   const BASE = "https://chat-app-backend.onrender.com"; // Your deployed URL
   ```

2. Update `socket.js` similarly

3. Deploy to **Vercel**:
   ```bash
   npm install -g vercel
   cd frontend
   vercel
   ```

4. Or deploy to **Netlify**:
   - Connect GitHub repo
   - Build command: `npm run build`
   - Publish directory: `dist`

---

## 🛠️ Development

### Backend Development

```bash
cd backend
npm run dev
```

Nodemon watches file changes and auto-restarts the server.

### Frontend Development

```bash
cd frontend
npm run dev
```

Vite provides fast HMR (Hot Module Reload).

### Building for Production

```bash
# Frontend
cd frontend
npm run build
# Creates optimized build in dist/

# Backend
# Just deploy the source; platform handles Node.js
```

---

## 🐛 Troubleshooting

### "Cannot connect to server"
- Ensure backend is running on `http://localhost:5000`
- Check MongoDB is running: `mongod`
- Check CORS origin in `server.js` matches frontend URL

### Messages not persisting
- Verify MongoDB connection in console output
- Check `MONGO_URI` in `.env`; for Atlas, ensure IP whitelist includes your IP

### Socket.io not connecting
- Check browser DevTools Console for connection errors
- Ensure backend is serving Socket.io (check `/socket.io/*`)

### Real-time updates delayed
- Check network latency in DevTools
- Verify socket event names match between client and server

---

## 📝 Git Commit History

Example commit flow:
```
✍️  Initial project setup with Express + Vite
✍️  Add MongoDB models and message routes
✍️  Implement message CRUD controllers
✍️  Add Socket.io real-time updates
✍️  Build React components (Message, MessageInput)
✍️  Implement delete for me / delete for everyone
✍️  Add pin message functionality
✍️  Fix CSS and test real-time flow
✍️  Update README and final polish
```

---

## 📦 Dependencies Summary

**Backend:**
- `express` - Web framework
- `socket.io` - Real-time communication
- `mongoose` - MongoDB ODM
- `cors` - CORS support
- `dotenv` - Environment variables
- `nodemon` - Dev auto-reload

**Frontend:**
- `react` - UI library
- `vite` - Build tool
- `socket.io-client` - WebSocket client

---

## ✅ Checklist for Assessment

- [x] Sending and receiving messages
- [x] Delete for Me / Delete for Everyone
- [x] Pin / Unpin messages
- [x] Pinned messages displayed separately
- [x] Real-time updates (WebSocket)
- [x] Messages persist in MongoDB
- [x] Input validation
- [x] Clean, modern UI
- [x] Responsive layout
- [x] Error handling
- [x] Auto-reconnect logic
- [x] Proper README with deployment instructions

---

## 📄 License

Personal project. No license specified.
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Message.jsx           # Single message bubble + actions menu
        │   ├── Message.module.css
        │   ├── MessageInput.jsx      # Bottom input bar
        │   ├── MessageInput.module.css
        │   ├── PinnedMessages.jsx    # Pinned strip
        │   └── PinnedMessages.module.css
        ├── hooks/
        │   └── useMessages.js       # All message state + socket listeners
        ├── App.jsx
        ├── App.module.css
        ├── api.js                   # Fetch wrappers
        ├── socket.js                # Socket.io singleton
        └── index.css                # Global styles + CSS vars
```

## API Reference

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| GET | /messages | — | Fetch all messages |
| POST | /messages | `{ content, sender }` | Send a message |
| DELETE | /messages/:id | `{ type: "me"\|"everyone", userId }` | Delete message |
| PUT | /messages/:id/pin | — | Toggle pin |

## Notes
- No auth — a random `userId` is generated per session for "delete for me" logic
- Socket events: `new_message`, `message_updated`
