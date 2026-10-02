const router = require('express').Router();
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');
const { listingRateLimiter } = require('../middleware/rateLimit');

// Valid statuses for listing auctions
const VALID_STATUSES = ['ACTIVE', 'CLOSING', 'CLOSED', 'SETTLED', 'PENDING', 'CANCELLED', 'ALL'];
const SELLER_COMMISSION_RATE = 0.10;
const BUYER_PREMIUM_RATE = 0.05;

// GET /api/auctions — list with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, featured, search, status, sellerId } = req.query;

    // Validate status — default ACTIVE
    const requestedStatus = status || 'ACTIVE';
    if (!VALID_STATUSES.includes(requestedStatus)) {
      return res.status(400).json({ error: 'Invalid status filter' });
    }

    const where = { deletedAt: null };
    if (requestedStatus !== 'ALL') {
      where.status = requestedStatus;
    }
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
      return res.status(400).json({ error: 'Missing required fields: title, description, category, startPrice, endTime' });
    }

    // Starting price validation
    const parsedPrice = parseFloat(startPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ error: 'Starting valuation must be a positive number' });
    }

    // End time validation
    const parsedEndTime = new Date(endTime);
    if (isNaN(parsedEndTime.getTime()) || parsedEndTime <= new Date(Date.now() + 60 * 1000)) {
      return res.status(400).json({ error: 'Bidding end time must be in the future' });
    }

    // Image URL validation with flexible fallback
    let finalImageUrl = (imageUrl || '').trim();
    if (finalImageUrl) {
      try {
        const parsedUrl = new URL(finalImageUrl);
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
          return res.status(400).json({ error: 'Image URL must use http or https' });
        }
      } catch {
        return res.status(400).json({ error: 'Provided image URL is invalid' });
      }
    } else {
      finalImageUrl = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85';
    }

    const isAdmin = req.user.role === 'ADMIN';
    const status = isAdmin ? 'ACTIVE' : 'PENDING';
    const verificationStatus = isAdmin ? 'VERIFIED' : 'PENDING';
    const verifiedBy = isAdmin ? req.user.email : null;
    const verificationNotes = isAdmin ? 'Direct listing verified by Chief Curator.' : null;

    const auction = await prisma.auction.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        condition: condition ? condition.trim() : 'Excellent',
        imageUrl: finalImageUrl,
        startPrice: parsedPrice,
        currentBid: parsedPrice,
        endTime: parsedEndTime,
        status,
        featured: isAdmin,
        verificationStatus,
        verifiedBy,
        verificationNotes,
        sellerId: req.user.userId,
      },
    });
    res.status(201).json(auction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create auction listing' });
  }
});

// PATCH /api/auctions/:id/settle — winner confirms purchase with transactional integrity
router.patch('/:id/settle', requireAuth, async (req, res) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const auction = await tx.auction.findUnique({
        where: { id: req.params.id },
        include: {
          bids: { orderBy: { amount: 'desc' }, take: 1, include: { user: true } },
        },
      });

      if (!auction || auction.deletedAt) {
        throw Object.assign(new Error('Auction not found'), { status: 404 });
      }
      if (auction.status === 'SETTLED') {
        throw Object.assign(new Error('This auction has already been settled and paid'), { status: 400 });
      }
      if (auction.status !== 'CLOSED') {
        throw Object.assign(new Error('Auction must be closed before settling payment'), { status: 400 });
      }

      const winningBid = auction.bids[0];
      if (!winningBid) {
        throw Object.assign(new Error('No bids found on this auction to settle'), { status: 400 });
      }
      if (winningBid.userId !== req.user.userId) {
        throw Object.assign(new Error('Only the winning bidder can settle this auction'), { status: 403 });
      }

      const hammer = parseFloat(winningBid.amount);
      const platformFee = hammer * SELLER_COMMISSION_RATE;
      const buyerPremium = hammer * BUYER_PREMIUM_RATE;

      const settled = await tx.auction.update({
        where: { id: req.params.id },
        data: {
          status: 'SETTLED',
          platformFee,
          buyerPremium,
        },
      });

      return {
        message: 'Purchase confirmed. Settlement completed successfully!',
        auction: settled,
        summary: {
          hammerPrice: hammer,
          buyerPremium,
          totalPaid: hammer + buyerPremium,
          sellerReceives: hammer - platformFee,
        },
      };
    });

    res.json(result);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Failed to settle auction' });
  }
});

// DELETE /api/auctions/:id — seller or admin deletes a listing with safeguards
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const auction = await prisma.auction.findUnique({
      where: { id: req.params.id },
    });
    if (!auction) return res.status(404).json({ error: 'Auction not found' });

    // Check ownership or admin status
    if (auction.sellerId !== req.user.userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You are not authorized to delete this listing' });
    }

    // Safety guard: active auctions with real bids cannot be silently deleted by seller
    if (auction.status === 'ACTIVE' && auction.bidCount > 0 && req.user.role !== 'ADMIN') {
      return res.status(400).json({
        error: 'Active auctions with existing bids cannot be deleted. Contact administration to withdraw lots.',
      });
    }

    await prisma.auction.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    res.json({ message: 'Listing successfully placed in retention.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

module.exports = router;
