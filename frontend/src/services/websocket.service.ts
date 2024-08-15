import { io } from 'socket.io-client';

const websocketService = () => {
  const socket = io(`ws://34.87.117.40:3000`);

  socket.on('disconnect', () => {
    console.log(socket.id);
  });

  return socket;
};

export default websocketService;
