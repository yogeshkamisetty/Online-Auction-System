const router = require('express').Router();
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');

// GET /api/bids/my — all bids by the logged-in user (for dashboard)
router.get('/my', requireAuth, async (req, res) => {
  try {
    const bids = await prisma.bid.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        auction: {
          select: {
            id: true,
            title: true,
            currentBid: true,
            status: true,
            endTime: true,
            imageUrl: true,
          },
        },
      },
    });

    // For each bid, determine if the user is currently winning
    const enriched = bids.map((bid) => ({
      ...bid,
      isWinning:
        parseFloat(bid.amount) >= parseFloat(bid.auction.currentBid),
    }));

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bids' });
  }
});

// POST /api/bids — place a bid (auth required)
router.post('/', requireAuth, async (req, res) => {
  const { auctionId, amount } = req.body;
  if (!auctionId || !amount) {
    return res.status(400).json({ error: 'auctionId and amount are required' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // SELECT FOR UPDATE — row-level lock prevents concurrent bid collisions
      const rows = await tx.$queryRaw`
        SELECT id, current_bid AS "currentBid", status, end_time AS "endTime"
        FROM "Auction"
        WHERE id = ${auctionId}
        FOR UPDATE
      `;

      if (!rows || rows.length === 0) {
        throw Object.assign(new Error('Auction not found'), { status: 404 });
      }

      const auction = rows[0];

      if (auction.status !== 'ACTIVE') {
        throw Object.assign(new Error('Auction is not active'), { status: 400 });
      }
      if (new Date() > new Date(auction.endTime)) {
        throw Object.assign(new Error('Auction has ended'), { status: 400 });
      }
      if (parseFloat(amount) <= parseFloat(auction.currentBid)) {
        throw Object.assign(
          new Error(`Bid must be higher than current bid of $${parseFloat(auction.currentBid).toLocaleString()}`),
          { status: 400 }
        );
      }

      const bid = await tx.bid.create({
        data: {
          auctionId,
          userId: req.user.userId,
          amount: parseFloat(amount),
        },
        include: { user: { select: { id: true, name: true } } },
      });

      const updated = await tx.auction.update({
        where: { id: auctionId },
        data: {
          currentBid: parseFloat(amount),
          bidCount: { increment: 1 },
        },
      });

      return { bid, auction: updated };
    });

    // Emit real-time event to all viewers of this auction room
    const io = req.app.get('io');
    if (io) {
      io.to(auctionId).emit('bid:new', {
        auctionId,
        currentBid: result.auction.currentBid,
        bidCount: result.auction.bidCount,
        bidder: result.bid.user.name,
        amount: result.bid.amount,
        createdAt: result.bid.createdAt,
      });
    }

    res.status(201).json(result);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Failed to place bid' });
  }
});

module.exports = router;
