const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const users = {};         // ✅ declare user store
let messages = [];        // store messages in memory

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // serve static files like login.html

// Signup route
app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.json({ success: false, message: 'Missing credentials' });
  if (users[username]) return res.json({ success: false, message: 'User already exists' });
  users[username] = { password };
  res.json({ success: true, username });
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', req.body);  // 🔍 debug
  if (!username || !password || !users[username] || users[username].password !== password) {
    return res.json({ success: false, message: 'Invalid username or password' });
  }
  res.json({ success: true, username });
});

// Socket.IO chat
io.on('connection', (socket) => {
  socket.emit('initial messages', messages);

  socket.on('chat message', (msg) => {
    const username = msg.user?.trim() || 'Unknown';
    const text = msg.text?.trim();
    if (!text) return;

    const message = {
      user: username,
      text,
      timestamp: new Date()
    };

    messages.push(message);
    io.emit('chat message', message);
  });
});

// Start server
server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
