const router = require('express').Router();
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');

// GET /api/watchlist — list all watchlisted auctions of the user
router.get('/', requireAuth, async (req, res) => {
    try {
        const watchlisted = await prisma.watchlist.findMany({
            where: { userId: req.user.userId },
            orderBy: { createdAt: 'desc' },
            include: {
                auction: {
                    include: {
                        seller: { select: { id: true, name: true } }
                    }
                }
            }
        });
        
        // Return array of auctions directly to make rendering simple
        const auctions = watchlisted.map(w => w.auction);
        res.json(auctions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to retrieve watchlist' });
    }
});

// POST /api/watchlist — add an auction to user's watchlist
router.post('/', requireAuth, async (req, res) => {
    const { auctionId } = req.body;
    if (!auctionId) {
        return res.status(400).json({ error: 'auctionId is required' });
    }

    try {
        // Double-check if the item is already watched
        const existing = await prisma.watchlist.findUnique({
            where: {
                userId_auctionId: {
                    userId: req.user.userId,
                    auctionId
                }
            }
        });

        if (existing) {
            return res.status(409).json({ error: 'Auction is already in your watchlist' });
        }

        const watch = await prisma.watchlist.create({
            data: {
                userId: req.user.userId,
                auctionId
            }
        });

        res.status(201).json(watch);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to watch auction' });
    }
});

// DELETE /api/watchlist/:auctionId — remove an auction from user's watchlist
router.delete('/:auctionId', requireAuth, async (req, res) => {
    const { auctionId } = req.params;

    try {
        await prisma.watchlist.delete({
            where: {
                userId_auctionId: {
                    userId: req.user.userId,
                    auctionId
                }
            }
        });
        res.json({ message: 'Removed from watchlist' });
    } catch (err) {
        // If not found, prisma will return error P2025
        if (err.code === 'P2025') {
            return res.status(404).json({ error: 'Item not in watchlist' });
        }
        console.error(err);
        res.status(500).json({ error: 'Failed to unwatch auction' });
    }
});

module.exports = router;
