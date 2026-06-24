const router = require('express').Router();
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');
const { listingRateLimiter } = require('../middleware/rateLimit');

// Statuses visible to any public request
const PUBLIC_STATUSES = ['ACTIVE', 'CLOSING', 'CLOSED', 'SETTLED'];
const SELLER_COMMISSION_RATE = 0.10;
const BUYER_PREMIUM_RATE = 0.05;

// GET /api/auctions — list with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, featured, search, status, sellerId } = req.query;

    // Validate status — default ACTIVE, reject non-public values
    const requestedStatus = status || 'ACTIVE';
    if (!PUBLIC_STATUSES.includes(requestedStatus)) {
      return res.status(400).json({ error: 'Invalid status filter' });
    }

    const where = { status: requestedStatus, deletedAt: null };
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
    if (!auction || auction.deletedAt) return res.status(404).json({ error: 'Auction not found' });
    const hammerPrice = Number(auction.currentBid || 0);
    const buyerPremium = Number(auction.buyerPremium ?? hammerPrice * BUYER_PREMIUM_RATE);
    const settlementSummary = ['CLOSED', 'SETTLED'].includes(auction.status)
      ? { hammerPrice, buyerPremium, totalPaid: hammerPrice + buyerPremium }
      : null;

    res.json({ ...auction, settlementSummary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch auction' });
  }
});

// POST /api/auctions — create listing (auth required)
router.post('/', requireAuth, listingRateLimiter, async (req, res) => {
  try {
    const { title, description, category, condition, imageUrl, startPrice, endTime } = req.body;
    if (!title || !description || !category || !startPrice || !endTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Starting price validation
    const parsedPrice = parseFloat(startPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ error: 'Starting price must be a positive number' });
    }

    // End time validation
    const parsedEndTime = new Date(endTime);
    if (isNaN(parsedEndTime.getTime()) || parsedEndTime <= new Date(Date.now() + 5 * 60 * 1000)) {
      return res.status(400).json({ error: 'Bidding end time must be at least 5 minutes in the future' });
    }

    // Image URL safety validation
    if (imageUrl) {
      try {
        const parsedUrl = new URL(imageUrl);
        if (parsedUrl.hostname !== 'res.cloudinary.com') {
          return res.status(400).json({ error: 'Image must be uploaded to the trusted platform storage (Cloudinary)' });
        }
        const secureExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
        const pathname = parsedUrl.pathname.toLowerCase();
        const hasSecureExtension = secureExtensions.some(ext => pathname.endsWith(ext));
        if (!hasSecureExtension) {
          return res.status(400).json({ error: 'Image file type is not supported. Use JPG, JPEG, PNG, WEBP, or AVIF' });
        }
      } catch (urlErr) {
        return res.status(400).json({ error: 'Provided image URL is invalid' });
      }
    }

    const auction = await prisma.auction.create({
      data: {
        title,
        description,
        category,
        condition: condition || null,
        imageUrl: imageUrl || '',
        startPrice: parsedPrice,
        currentBid: parsedPrice,
        endTime: parsedEndTime,
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

// DELETE /api/auctions/:id — seller or admin deletes a listing
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const auction = await prisma.auction.findUnique({
      where: { id: req.params.id }
    });
    if (!auction) return res.status(404).json({ error: 'Auction not found' });
    
    // Check ownership or admin status
    if (auction.sellerId !== req.user.userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You are not authorized to delete this listing' });
    }
    
    await prisma.auction.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() }
    });
    
    res.json({ message: 'Listing successfully placed in retention.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

module.exports = router;
