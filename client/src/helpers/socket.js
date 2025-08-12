import { io } from 'socket.io-client';
import { BASE_URL } from '../helpers/variables';

const socket = io(BASE_URL, {
  // Add configuration options if needed
  autoConnect: false, // Prevent auto-connection
});

export default socket;
