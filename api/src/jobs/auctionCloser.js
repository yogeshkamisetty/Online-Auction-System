const cron = require('node-cron');
const prisma = require('../lib/prisma');

function startAuctionCloser(io) {
  // Runs every minute — finds ACTIVE auctions past their endTime and closes them
  cron.schedule('* * * * *', async () => {
    try {
      const expired = await prisma.auction.findMany({
        where: { status: 'ACTIVE', endTime: { lt: new Date() } },
        select: { id: true, title: true },
      });

      if (expired.length === 0) return;

      for (const auction of expired) {
        await prisma.auction.update({
          where: { id: auction.id },
          data: { status: 'CLOSED' },
        });

        // Notify all viewers of this auction room that it has closed
        if (io) {
          io.to(auction.id).emit('auction:closed', { auctionId: auction.id });
        }

        console.log(`[cron] Closed auction: ${auction.title} (${auction.id})`);
      }
    } catch (err) {
      console.error('[cron] auctionCloser error:', err.message);
    }
  });

  console.log('[cron] Auction closer started — checking every minute');
}

module.exports = { startAuctionCloser };
