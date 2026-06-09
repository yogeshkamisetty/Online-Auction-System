const router = require('express').Router();
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');

// Statuses visible to any public request
const PUBLIC_STATUSES = ['ACTIVE', 'CLOSING', 'CLOSED', 'SETTLED'];

// GET /api/auctions — list with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, featured, search, status, sellerId } = req.query;

    // Validate status — default ACTIVE, reject non-public values
    const requestedStatus = status || 'ACTIVE';
    if (!PUBLIC_STATUSES.includes(requestedStatus)) {
      return res.status(400).json({ error: 'Invalid status filter' });
    }

    const where = { status: requestedStatus };
    if (featured === 'true') where.featured = true;
    if (sellerId) where.sellerId = sellerId;
    if (category) where.category = { equals: category, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const auctions = await prisma.auction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { seller: { select: { id: true, name: true } } },
    });

    res.json(auctions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch auctions' });
  }
});

// GET /api/auctions/:id
router.get('/:id', async (req, res) => {
  try {
    const auction = await prisma.auction.findUnique({
      where: { id: req.params.id },
      include: {
        seller: { select: { id: true, name: true } },
        bids: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });
    if (!auction) return res.status(404).json({ error: 'Auction not found' });
    res.json(auction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch auction' });
  }
});

// POST /api/auctions — create listing (auth required)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description, category, condition, imageUrl, startPrice, endTime } = req.body;
    if (!title || !description || !category || !startPrice || !endTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const auction = await prisma.auction.create({
      data: {
        title,
        description,
        category,
        condition: condition || null,
        imageUrl: imageUrl || '',
        startPrice: parseFloat(startPrice),
        currentBid: parseFloat(startPrice),
        endTime: new Date(endTime),
        status: 'ACTIVE',
        sellerId: req.user.userId,
      },
    });
    res.status(201).json(auction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create auction' });
  }
});

// PATCH /api/auctions/:id/settle — winner confirms purchase
router.patch('/:id/settle', requireAuth, async (req, res) => {
  try {
    const auction = await prisma.auction.findUnique({
      where: { id: req.params.id },
      include: {
        bids: { orderBy: { amount: 'desc' }, take: 1, include: { user: true } },
      },
    });

    if (!auction) return res.status(404).json({ error: 'Auction not found' });
    if (auction.status !== 'CLOSED') {
      return res.status(400).json({ error: 'Auction must be closed before settling' });
    }

    const winningBid = auction.bids[0];
    if (!winningBid) return res.status(400).json({ error: 'No bids found on this auction' });
    if (winningBid.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Only the winning bidder can settle this auction' });
    }

    const SELLER_COMMISSION_RATE = 0.10;
    const BUYER_PREMIUM_RATE    = 0.05;
    const hammer = parseFloat(winningBid.amount);

    const settled = await prisma.auction.update({
      where: { id: req.params.id },
      data: {
        status: 'SETTLED',
        platformFee:   hammer * SELLER_COMMISSION_RATE,
        buyerPremium:  hammer * BUYER_PREMIUM_RATE,
      },
    });

    res.json({
      message: 'Purchase confirmed. Thank you!',
      auction: settled,
      summary: {
        hammerPrice:    hammer,
        buyerPremium:   hammer * BUYER_PREMIUM_RATE,
        totalPaid:      hammer + hammer * BUYER_PREMIUM_RATE,
        sellerReceives: hammer - hammer * SELLER_COMMISSION_RATE,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to settle auction' });
  }
});

module.exports = router;
