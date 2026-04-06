# Testing Guide

This guide covers manual testing of the Chat App. For a time-constrained project, manual testing is sufficient.

## Prerequisites

1. Backend running on http://localhost:5000
2. Frontend running on http://localhost:5173
3. MongoDB connected (check console for "MongoDB connected")

## Manual Testing Checklist

### 1. Basic Messaging ✅

**Test: Send and receive messages**
1. Open http://localhost:5173
2. Wait for \"Loading messages...\" to disappear
3. Type \"Hello World\" in input
4. Press Enter or click Send button
5. **Expected**: Message appears immediately in chat

**Test: Multiple messages**
1. Send 3-4 messages in sequence
2. **Expected**: All appear in order, timestamps are different

**Test: Real-time with multiple windows**
1. Open frontend in two browser windows side-by-side
2. Send message from Window A
3. **Expected**: Message instantly appears in Window B

---

### 2. Delete Functionality ✅

**Test: Delete for Me**
1. Send a message
2. Hover over the message (reveals menu button ···)
3. Click menu → \"Delete for Me\"
4. **Expected**: 
   - Message disappears from current window
   - Message still visible in other window (if open)
   - Check browser console for no errors

**Test: Delete for Everyone**
1. Send a message
2. Click menu → \"Delete for Everyone\"
3. **Expected**:
   - Message shows \"This message was deleted\" (italicized)
   - Message still takes up space (not removed)
   - Disappears in other windows too
   - Menu hidden for deleted message

**Test: Delete invalid message**
1. Try deleting a message that's already deleted
2. **Expected**: No error, graceful handling

---

### 3. Pin Messages ✅

**Test: Pin a message**
1. Send a message
2. Click menu → \"Pin\"
3. **Expected**:
   - Message appears in \"Pinned\" strip at top
   - 📌 indicator appears on message
   - Background color changes slightly

**Test: Multiple pinned messages**
1. Pin 3 messages
2. Scroll to top
3. **Expected**:
   - All 3 appear in pinned strip
   - Scrollable if many pinned

**Test: Unpin from message**
1. Click menu on pinned message → \"Unpin\"
2. **Expected**:
   - Message disappears from pinned strip
   - 📌 indicator gone
   - Message still in chat

**Test: Unpin from strip**
1. Click X button on pinned message in strip
2. **Expected**: Same as above

**Test: Pin deleted message**
1. Delete \"For Everyone\"
2. Try to pin it
3. **Expected**: Can still pin, shows in strip as \"This message was deleted\"

---

### 4. UI/UX ✅

**Test: Auto-scroll**
1. Send many messages
2. Scroll to middle of chat
3. Send another message
4. **Expected**: Scrolls to bottom smoothly

**Test: Message input**
1. Type a very long message (>100 chars)
2. **Expected**: Text wraps, input grows to max height (120px)

**Test: Shift+Enter for newline**
1. Type message, press Shift+Enter
2. **Expected**: Creates newline, cursor moves down

**Test: Enter sends (no shift)**
1. Type message, press Enter
2. **Expected**: Sends immediately, input clears

**Test: Empty message prevention**
1. Click Send with empty input
2. **Expected**: Nothing happens, button disabled

**Test: Loading state**
1. Stop backend server
2. Refresh frontend
3. **Expected**: Shows \"Could not connect to server...\" error

**Test: Header info**
1. Send messages
2. Check header
3. **Expected**: 
   - Shows \"general\" channel
   - Green dot (connected status)
   - Message count updates

---

### 5. Real-Time Updates ✅

**Test: Socket connection**
1. Open browser DevTools → Network → WS (WebSocket)
2. Refresh page
3. **Expected**: See socket.io connection

**Test: Reconnection**
1. Open DevTools Console
2. Stop backend server
3. **Expected**: Console shows \"Attempting to reconnect...\" messages
4. Restart backend
5. **Expected**: \"Connected to server\" appears, messages load

**Test: Event timing**
1. Open Network tab in DevTools
2. Send message
3. **Expected**: 
   - POST request to /messages
   - Socket event \"new_message\" received nearly instantly

---

### 6. Edge Cases ✅

**Test: Very long message**
1. Send 5000 character message
2. **Expected**: Appears fine, no truncation

**Test: Message with special characters**
1. Send: `<script>alert('xss')</script>`
2. **Expected**: Displays as text (escaped), no alert

**Test: Rapid message sending**
1. Send 10 messages quickly
2. **Expected**: All appear in order

**Test: Delete then send**
1. Delete a message
2. Send new message
3. **Expected**: New message appears, old one still deleted

**Test: Pin then delete**
1. Pin message
2. Delete for everyone
3. **Expected**: Pinned message shows as deleted

**Test: Empty database recovery**
1. Stop backend
2. Delete all messages from MongoDB
3. Start backend
4. Refresh frontend
5. **Expected**: Shows \"No messages yet. Say something.\"

---

## Testing with Network Throttling

Simulate slow network:

1. DevTools → Network tab
2. Set throttle to \"Slow 3G\"
3. Send message
4. **Expected**: Takes a few seconds, then appears (graceful)

---

## Load Testing (Manual)

**Test: 100 messages**
1. Send 100 messages (or import)
2. Check memory in DevTools → Performance
3. Scroll smoothly
4. **Expected**: No lag, performance acceptable

---

## API Testing (curl)

Test backend endpoints directly:

```bash
# Get all messages
curl http://localhost:5000/messages

# Send message
curl -X POST http://localhost:5000/messages \
  -H "Content-Type: application/json" \
  -d '{"content":"hello","sender":"You"}'

# Get ID from above, then delete for me
curl -X DELETE http://localhost:5000/messages/{id} \
  -H "Content-Type: application/json" \
  -d '{"type":"me","userId":"user_123"}'

# Pin message
curl -X PUT http://localhost:5000/messages/{id}/pin

# Health check
curl http://localhost:5000/
```

---

## Debugging Tips

### Frontend Issues

**Check Console**
```javascript
// View all messages
JSON.stringify(messages, null, 2)

// Test socket connection
socket.connected  // true/false
socket.id  // socket connection ID

// View socket listeners
socket.eventNames()
```

**Network Issues**
- DevTools → Network → filter by XHR/Fetch
- Check response headers (CORS, Content-Type)
- Check request body

**UI Issues**
- React DevTools: Check component state
- CSS: Inspect element, toggle CSS in DevTools
- Zoom: Check responsiveness at different zoom levels

### Backend Issues

**Server logs**
- Should show: \"✓ MongoDB connected\", connection info
- Should show: ✓ Client connected logs
- Check for ✗ errors

**Database**
```bash
# Check MongoDB
mongosh
use chatapp
db.messages.find()
```

**API Testing**
- Use Postman or curl
- Check request headers, body, response
- Verify status codes (201 for create, 200 for success, etc.)

**Socket Issues**
- Enable socket.io client debugging:
```javascript
import { io } from "socket.io-client";
io.debug = true;
```

---

## Performance Profiling

### Frontend
1. DevTools → Performance tab
2. Click Record
3. Send message, scroll, delete
4. Stop recording
5. Check Frame rate, Long tasks

### Backend
1. Add timing logs:
```javascript
const start = Date.now();
// ... operation
console.log(`Operation took ${Date.now() - start}ms`);
```

---

## Regression Testing

After changes, re-test:
- ✅ Send message (basic feature)
- ✅ Delete for me (multiple variations)
- ✅ Delete for everyone (multiple variations)
- ✅ Pin/unpin (multiple variations)
- ✅ Real-time updates (multiple windows)
- ✅ Error states (network down)

---

## Sign-Off Checklist

Before marking as \"ready for deployment\":
- [ ] All 6 test categories pass
- [ ] No console errors
- [ ] No network errors
- [ ] Real-time works smoothly
- [ ] Load test passes (100+ messages)
- [ ] Works on mobile (if applicable)
- [ ] Cursor positioning after send
- [ ] Message ordering is correct
- [ ] Timestamps accurate

---

Good luck! 🚀
