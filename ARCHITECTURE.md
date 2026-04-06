# Architecture & Design Notes

## System Overview

```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   React/Vite    │◄────────┤  Socket.io + WS  │────────►│   Express Server │
│   (Frontend)    │         │   (Real-time)    │         │   (Backend)      │
└─────────────────┘         └──────────────────┘         └──────────────────┘
       │                                                         │
       │                    REST API                            │
       └─────────────────────────────────────────────────────────┘
                                                                │
                                                         ┌──────▼──────┐
                                                         │   MongoDB   │
                                                         │  (Messages) │
                                                         └─────────────┘
```

## Core Design Decisions

### 1. Real-Time Communication: Socket.io
- **Why**: Low latency, automatic reconnection, fallback to polling
- **Alternative Considered**: WebSockets directly (too verbose)
- **Trade-off**: Extra dependency, but much simpler to implement

### 2. Message Model
```javascript
{
  _id: ObjectId,
  content: String,
  sender: String,
  createdAt: Date,
  updatedAt: Date,
  
  // Deletion flags
  deletedForEveryone: Boolean,  // Marks as deleted for all
  deletedFor: [String],         // Array of userIds who hid it
  
  // Pin flag
  isPinned: Boolean
}
```

**Design Rationale:**
- **deletedForEveryone**: Keeps message in DB (audit trail), marks as deleted
- **deletedFor**: Client-side filtering per user. Scalable to ~100s of users per message
- **isPinned**: Simple boolean, no limit on pinned messages

### 3. "Delete for Me" Implementation
- **Server**: Stores userId in `deletedFor` array
- **Client**: Filters messages before rendering using `USER_ID`
- **Limitation**: Only works on the same device (no auth). In production, would persist server-side per authenticated user

### 4. Real-Time Flow

```
User A sends message
    │
    ▼
REST API POST /messages
    │
    ▼
(DB Insert) → Socket.io broadcast "new_message"
    │
    ▼
All connected clients receive event
    ▼
React state updates → Re-render
```

### 5. No Optimistic Updates
- Decided against optimistic updates (why?)
- Socket.io broadcast is fast enough (<100ms typically)
- Simpler mental model: Single source of truth is server
- Could add later if needed

## Component Hierarchy

```
App
├── Header
│   ├── Avatar
│   └── Status
├── PinnedMessages (conditional)
│   └── Message items
├── MessageArea
│   ├── Loading state
│   ├── Error state
│   └── Message[] (mapped)
│       └── Message
│           ├── Bubble content
│           ├── Timestamp
│           └── ActionMenu
│               ├── Pin/Unpin
│               ├── Delete for Me
│               └── Delete for Everyone
└── MessageInput
    ├── Textarea
    └── SendButton
```

## State Management

No Redux/Zustand needed because:
- Single data source: `messages` array in `useMessages`
- Simple operations: Add, Update, Filter
- Only 2-3 components need state

If it grows, consider:
- Zustand (lightweight)
- Jotai (atoms)
- Redux (if much more complex)

## Styling Approach

- **CSS Modules**: Scoped styles, prevents global conflicts
- **CSS Variables**: Theme colors in `:root`
- **Dark theme**: Professional look, easier on eyes
- **Responsive**: Single column layout, works on mobile

### Color Palette
```css
--bg: #0f0f10;           /* Main background */
--surface: #1a1a1d;      /* Component background */
--surface-2: #242428;    /* Raised component */
--text: #e8e8ec;         /* Primary text */
--text-muted: #666672;   /* Secondary text */
--accent: #5b8af5;       /* Primary action */
--pin-color: #f0a500;    /* Pin highlight */
--danger: #e05252;       /* Delete action */
```

## Error Handling Strategy

### Frontend
- Network errors → Show toast/banner
- Validation errors → Prevent submit
- Socket disconnect → Show "Connecting..." status

### Backend
- Invalid input → 400 Bad Request
- Not found → 404 Not Found
- Server error → 500 Internal Server Error + log

### Database
- Connection errors → Exit process (fail loudly)
- Invalid schema → Mongoose validation

## Performance Considerations

### Current Limitations
- Loads all messages at once (fine up to ~1000 messages)
- No pagination
- No message indexing

### How to Scale
1. **Pagination**
   - Add `limit` and `skip` query params
   - Load 50 messages at a time

2. **Database Indexing**
   - Index `createdAt` for faster sorting
   - Index `isPinned` if many messages

3. **Message Virtual Scrolling**
   - Only render visible messages
   - Use react-window library

4. **Caching**
   - Cache messages in memory (Redis)
   - Invalidate on updates

## Testing Strategy

### Unit Tests (Recommended)
```
backend/
  └── controllers/
      └── messageController.test.js

frontend/
  └── components/
      └── Message.test.jsx
  └── hooks/
      └── useMessages.test.js
```

### Integration Tests
- API routes + DB
- Socket.io events

### E2E Tests
- Cypress: Open two windows, send message, verify real-time

### Current State
- No automated tests (time constraint)
- Manual testing only

## Security Considerations

### Implemented
- Input validation (non-empty, length limit)
- CORS enabled for frontend

### Not Implemented (Would Add)
- Authentication/authorization
- Rate limiting
- Input sanitization (XSS prevention)
- HTTPS only
- Message encryption

### Future Improvements
1. Add user authentication
2. Rate limit API endpoints
3. Escape HTML in messages
4. Add password reset flow
5. Implement JWT tokens

## Code Organization

### Backend
```
controllers/     # Business logic
models/          # Database schemas
routes/          # API endpoint definitions
server.js        # Express + Socket.io setup
```

**Principles:**
- Thin controllers (pass to models)
- Models handle validation
- Routes are configuration

### Frontend
```
components/  # Presentational components
hooks/       # Custom React hooks
api.js       # Network clients
socket.js    # Socket.io setup
App.jsx      # Container component
```

**Principles:**
- Components: Pure, reusable, stateless when possible
- Hooks: Encapsulate logic (fetch, real-time, local state)
- API layer: Separate concerns (network vs. UI)

## Monitoring & Debugging

### Development
- React DevTools: Component state/props
- DevTools Network: API calls
- DevTools Console: Socket.io logs
- Browser Application tab: LocalStorage, Cookies

### Server
- Nodemon auto-restart on file changes
- Console.log for debugging (upgrade to winston in prod)
- curl for manual API testing

Example:
```bash
# Test API
curl -X POST http://localhost:5000/messages \
  -H "Content-Type: application/json" \
  -d '{"content":"hello","sender":"test"}'

# View logs
journalctl -u chat-app -f  # if systemd service
```

## Database Backup Strategy

### MongoDB Atlas
- Automatic daily backups (free tier)
- Point-in-time restore available
- Consider: Manual exports for critical data

### Production Checklist
- [ ] Enable automated backups
- [ ] Test restore process
- [ ] Document backup schedule
- [ ] Monitor disk usage

## Deployment Architecture

### Development
```
Localhost:5000 (Backend)
        ↑
        └── Localhost:5173 (Frontend)
        
MongoDB local instance
```

### Production
```
Render (Backend)
    ↓
Vercel (Frontend)
    ↓
MongoDB Atlas
```

## Future Enhancements Priority

### P0 (Critical)
- User authentication
- Message search
- Typing indicators

### P1 (Important)
- User profiles
- Message reactions
- Threads/replies
- Read receipts

### P2 (Nice-to-have)
- Message editing
- File uploads
- Voice messages
- Dark/Light theme toggle

### P3 (Polish)
- Keyboard shortcuts
- Drag-drop file upload
- Message formatting (bold, italic)
- Mentions (@username)

---

This document should evolve as the project grows. Update it when:
- Making architectural decisions
- Changing database schema
- Refactoring major components
- Learning from production issues
