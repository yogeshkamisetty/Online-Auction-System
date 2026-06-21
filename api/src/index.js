require('dotenv/config');
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Server } = require('socket.io');

const authRoutes    = require('./routes/auth');
const auctionRoutes = require('./routes/auctions');
const bidRoutes     = require('./routes/bids');
const adminRoutes   = require('./routes/admin');
const watchlistRoutes = require('./routes/watchlist');
const { startAuctionCloser } = require('./jobs/auctionCloser');

const app        = express();
const httpServer = http.createServer(app);
const io         = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  transports: ['websocket', 'polling'],
});

// Make io accessible in route handlers via req.app.get('io')
app.set('io', io);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false })); // CSP off — static HTML served separately
app.use(cors({ origin: '*' }));                    // Tighten to Vercel URL after deploy
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.use('/api/auth',      authRoutes);
app.use('/api/auctions',  auctionRoutes);
app.use('/api/bids',      bidRoutes);
app.use('/api/admin',     adminRoutes);
app.use('/api/watchlist', watchlistRoutes);

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[error]', err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ── Socket.io ────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  // Buyer joins the room for a specific auction to receive live bid updates
  socket.on('join:auction', (auctionId) => {
    socket.join(auctionId);
  });

  socket.on('leave:auction', (auctionId) => {
    socket.leave(auctionId);
  });

  socket.on('disconnect', () => {
    // Rooms are automatically cleaned up by Socket.io
  });
});

// ── Cron jobs ────────────────────────────────────────────────────────────────
startAuctionCloser(io);

// ── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
