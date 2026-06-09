const router = require('express').Router();
const prisma = require('../lib/prisma');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Every route here requires a valid JWT AND role === 'ADMIN'.
router.use(requireAuth, requireAdmin);

const VALID_STATUSES = ['PENDING', 'ACTIVE', 'CLOSING', 'CLOSED', 'SETTLED'];
const VALID_VERIFICATION = ['UNVERIFIED', 'PENDING', 'VERIFIED'];

// ── GET /api/admin/stats — platform-wide KPIs ────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalAuctions,
      activeAuctions,
      closedAuctions,
      settledAgg,
      pendingVerification,
      totalBids,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.auction.count(),
      prisma.auction.count({ where: { status: 'ACTIVE' } }),
      prisma.auction.count({ where: { status: 'CLOSED' } }),
      prisma.auction.aggregate({
        where: { status: 'SETTLED' },
        _sum: { currentBid: true, platformFee: true, buyerPremium: true },
        _count: true,
      }),
      prisma.auction.count({ where: { verificationStatus: 'PENDING' } }),
      prisma.bid.count(),
    ]);

    const gmv = Number(settledAgg._sum.currentBid || 0);
    const platformRevenue =
      Number(settledAgg._sum.platformFee || 0) + Number(settledAgg._sum.buyerPremium || 0);

    res.json({
      users: totalUsers,
      auctions: {
        total: totalAuctions,
        active: activeAuctions,
        closed: closedAuctions,
        settled: settledAgg._count,
      },
      bids: totalBids,
      pendingVerification,
      gmv,
      platformRevenue,
      bidToListingRatio: totalAuctions ? Number((totalBids / totalAuctions).toFixed(2)) : 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

// ── GET /api/admin/auctions — all auctions, any status, with filters ─────────
router.get('/auctions', async (req, res) => {
  try {
    const { status, verificationStatus, search, take = '50', skip = '0' } = req.query;
    const where = {};
    if (status && VALID_STATUSES.includes(status)) where.status = status;
    if (verificationStatus && VALID_VERIFICATION.includes(verificationStatus)) {
      where.verificationStatus = verificationStatus;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.auction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Math.min(parseInt(take, 10) || 50, 100),
        skip: parseInt(skip, 10) || 0,
        include: {
          seller: { select: { id: true, name: true, email: true } },
          _count: { select: { bids: true } },
        },
      }),
      prisma.auction.count({ where }),
    ]);

    res.json({ items, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load auctions' });
  }
});

// ── PATCH /api/admin/auctions/:id — edit status / featured / fields ──────────
router.patch('/auctions/:id', async (req, res) => {
  try {
    const { status, featured, title, description } = req.body;
    const data = {};
    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });
      data.status = status;
    }
    if (featured !== undefined) data.featured = !!featured;
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;

    const auction = await prisma.auction.update({ where: { id: req.params.id }, data });
    res.json(auction);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Auction not found' });
    console.error(err);
    res.status(500).json({ error: 'Failed to update auction' });
  }
});

// ── DELETE /api/admin/auctions/:id — takedown (e.g. compliance) ──────────────
router.delete('/auctions/:id', async (req, res) => {
  try {
    // Remove dependent bids first to satisfy FK constraints
    await prisma.$transaction([
      prisma.bid.deleteMany({ where: { auctionId: req.params.id } }),
      prisma.auction.delete({ where: { id: req.params.id } }),
    ]);
    res.json({ message: 'Auction removed' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Auction not found' });
    console.error(err);
    res.status(500).json({ error: 'Failed to delete auction' });
  }
});

// ── PATCH /api/admin/auctions/:id/verify — expert verification ───────────────
router.patch('/auctions/:id/verify', async (req, res) => {
  try {
    const { verificationStatus, verificationNotes } = req.body;
    if (!VALID_VERIFICATION.includes(verificationStatus)) {
      return res.status(400).json({ error: 'Invalid verification status' });
    }
    const auction = await prisma.auction.update({
      where: { id: req.params.id },
      data: {
        verificationStatus,
        verificationNotes: verificationNotes || null,
        verifiedBy: verificationStatus === 'VERIFIED' ? req.user.email : null,
      },
    });
    res.json(auction);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Auction not found' });
    console.error(err);
    res.status(500).json({ error: 'Failed to update verification' });
  }
});

// ── GET /api/admin/users — list / search users ───────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { search, take = '50', skip = '0' } = req.query;
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Math.min(parseInt(take, 10) || 50, 100),
        skip: parseInt(skip, 10) || 0,
        select: {
          id: true, name: true, email: true, role: true, suspended: true, createdAt: true,
          _count: { select: { auctions: true, bids: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ items, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load users' });
  }
});

// ── PATCH /api/admin/users/:id — suspend / unsuspend / change role ───────────
router.patch('/users/:id', async (req, res) => {
  try {
    const { suspended, role } = req.body;
    const data = {};
    if (suspended !== undefined) data.suspended = !!suspended;
    if (role !== undefined) {
      if (!['USER', 'ADMIN'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
      data.role = role;
    }

    // Guard: an admin cannot suspend or demote themselves (avoids lockout)
    if (req.params.id === req.user.userId && (data.suspended || data.role === 'USER')) {
      return res.status(400).json({ error: 'You cannot suspend or demote your own account' });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: { id: true, name: true, email: true, role: true, suspended: true },
    });
    res.json(user);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'User not found' });
    console.error(err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// ── GET /api/admin/auctions/:id/bids — full bid audit log ────────────────────
router.get('/auctions/:id/bids', async (req, res) => {
  try {
    const bids = await prisma.bid.findMany({
      where: { auctionId: req.params.id },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    res.json(bids);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load bid log' });
  }
});

module.exports = router;
