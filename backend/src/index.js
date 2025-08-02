import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import app from './app.js';
import connectDB from './db/db1.js';
import { db_name } from './constants.js';
// import gameSocket from './socket/gameSocket.js'; // ✅ Import gameSocket

dotenv.config({ path: './.env' });

const PORT = process.env.PORT || 8000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*', // Adjust as needed (e.g., "http://localhost:5173")
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  gameSocket(io, socket); // ✅ Attach game socket event handlers

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`✅ Server + Socket.io running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error);
  });
