// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'room.html'));
});

app.get('/room/:roomId', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('join', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', socket.id);
  });

  socket.on('offer', (data) => {
    socket.to(data.roomId).emit('offer', data);
  });

  socket.on('answer', (data) => {
    socket.to(data.roomId).emit('answer', data);
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.roomId).emit('ice-candidate', data);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
