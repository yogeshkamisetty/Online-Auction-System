const { Server } = require('socket.io');

let io = null;

function init(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    
    // Allow users to join a room for a specific auction to listen to bids
    socket.on('join_auction', (auctionId) => {
      socket.join(auctionId);
      console.log(`Socket ${socket.id} joined room ${auctionId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}

module.exports = { init, getIO };
