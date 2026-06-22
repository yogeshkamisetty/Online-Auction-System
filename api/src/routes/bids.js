const router = require('express').Router();
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');
const { bidRateLimiter } = require('../middleware/rateLimit');
const { sendEmail } = require('../lib/email');

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
router.post('/', requireAuth, bidRateLimiter, async (req, res) => {
  const { auctionId, amount } = req.body;
  if (!auctionId || !amount) {
    return res.status(400).json({ error: 'auctionId and amount are required' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // SELECT FOR UPDATE — row-level lock prevents concurrent bid collisions
      const rows = await tx.$queryRaw`
        SELECT id, "currentBid", status, "endTime"
        FROM "Auction"
        WHERE id = ${auctionId} AND "deletedAt" IS NULL
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

      // Query the previous highest bid and bidder before creating the new one
      const previousHighestBid = await tx.bid.findFirst({
        where: { auctionId },
        orderBy: { amount: 'desc' },
        include: { user: { select: { id: true, email: true, name: true } } },
      });

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

      return { bid, auction: updated, previousHighestBid };
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

    // Async outbid email notification
    if (result.previousHighestBid && result.previousHighestBid.userId !== req.user.userId) {
      const { user: prevUser } = result.previousHighestBid;
      sendEmail({
        to: prevUser.email,
        subject: `⚠️ Outbid Warning: ${result.auction.title}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #b91c1c;">You have been outbid!</h2>
            <p>Hello <strong>${prevUser.name}</strong>,</p>
            <p>Another bidder placed a higher bid on <strong>${result.auction.title}</strong>.</p>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #f3f4f6;">
              <p style="margin: 0;">New Highest Bid: <strong style="font-size: 1.2rem; color: #111827;">$${result.auction.currentBid.toLocaleString()}</strong></p>
            </div>
            <p>Don't lose this treasure! Reclaim your lead by placing a higher bid.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/product/${auctionId}" 
                 style="background-color: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Place a Higher Bid &rarr;
              </a>
            </div>
            <p style="color: #6b7280; font-size: 0.85rem;">Golden Hammer Auctions. Keep winning.</p>
          </div>
        `,
      }).catch(console.error);
    }

    res.status(201).json(result);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Failed to place bid' });
  }
});

module.exports = router;
