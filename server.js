import express from 'express';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import path from 'path';

import applyMiddlewares from './utils/middleware.js';
import connectDB from './config/db.js';
import { socketConnect } from './routes/supplier.js';
import mountRoutes from './utils/routes.js';
import logoutInactiveUsers from './helper/logoutInactiveUsers.js';

dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

// Apply all middlewares
applyMiddlewares(app);

//sockets
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGINS,
  },
});

app.set('io', io);
io.on('connection', (socket) => {
  socketConnect(io);
  socket.on('disconnect', () => {});
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'yussman-client', 'dist')));

setInterval(() => logoutInactiveUsers(io), 5 * 60 * 1000);

//mount routes
mountRoutes(app);

// for all other routes, send the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'yussman-client', 'dist', 'index.html'));
});

server.listen(process.env.PORT, () => {});
