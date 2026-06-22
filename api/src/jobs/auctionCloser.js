const cron = require('node-cron');
const prisma = require('../lib/prisma');
const { sendEmail } = require('../lib/email');

function startAuctionCloser(io) {
  // Runs every minute — finds ACTIVE auctions past their endTime and closes them
  cron.schedule('* * * * *', async () => {
    try {
      const expired = await prisma.auction.findMany({
        where: { status: 'ACTIVE', endTime: { lt: new Date() }, deletedAt: null },
        include: {
          seller: { select: { id: true, name: true, email: true } },
          bids: {
            orderBy: { amount: 'desc' },
            take: 1,
            include: { user: { select: { id: true, name: true, email: true } } }
          }
        }
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

        const winningBid = auction.bids[0];
        const { seller } = auction;

        if (winningBid) {
          const { user: winner } = winningBid;

          // 1. Email to winner
          sendEmail({
            to: winner.email,
            subject: `🏆 Congratulations! You won: ${auction.title}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h2 style="color: #166534; margin-top: 0;">You Won the Auction!</h2>
                <p>Hello <strong>${winner.name}</strong>,</p>
                <p>Congratulations! You are the highest bidder for <strong>${auction.title}</strong>.</p>
                <div style="background-color: #f0fdf4; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #dcfce7;">
                  <p style="margin: 0; color: #166534; font-size: 1.1rem;">Your Winning Bid: <strong style="font-size: 1.3rem; color: #14532d;">$${winningBid.amount.toLocaleString()}</strong></p>
                </div>
                <p>Please log in to confirm your purchase, check your invoice summary, and settle the payment.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/product/${auction.id}" 
                     style="background-color: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Settle Payment &rarr;
                  </a>
                </div>
                <p style="color: #6b7280; font-size: 0.85rem; border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 25px;">Golden Hammer Auctions. Thank you for your business!</p>
              </div>
            `
          }).catch(console.error);

          // 2. Email to seller
          sendEmail({
            to: seller.email,
            subject: `💰 Your item has sold: ${auction.title}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h2 style="color: #1e3a8a; margin-top: 0;">Item Sold!</h2>
                <p>Hello <strong>${seller.name}</strong>,</p>
                <p>Your listing <strong>${auction.title}</strong> has closed with a winning bid.</p>
                <div style="background-color: #eff6ff; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #dbeafe;">
                  <p style="margin: 0; color: #1e40af; font-size: 1.1rem;">Final Hammer Price: <strong style="font-size: 1.3rem; color: #1e3a8a;">$${winningBid.amount.toLocaleString()}</strong></p>
                </div>
                <p>We have notified the buyer to settle their payment. Once completed, your funds will be released (less platform fees).</p>
                <p style="color: #6b7280; font-size: 0.85rem; border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 25px;">Golden Hammer Auctions. Sell with confidence.</p>
              </div>
            `
          }).catch(console.error);

        } else {
          // No bids - notify seller of unsold item
          sendEmail({
            to: seller.email,
            subject: `⌛ Auction ended (No Bids): ${auction.title}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h2 style="color: #4b5563; margin-top: 0;">Auction Ended (Unsold)</h2>
                <p>Hello <strong>${seller.name}</strong>,</p>
                <p>Your listing <strong>${auction.title}</strong> has ended, but did not receive any bids.</p>
                <p>You can re-list the item at any time with a lower starting price or longer duration to attract buyers.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/sell" 
                     style="background-color: #1f2937; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Re-List Item &rarr;
                  </a>
                </div>
                <p style="color: #6b7280; font-size: 0.85rem; border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 25px;">Golden Hammer Auctions.</p>
              </div>
            `
          }).catch(console.error);
        }
      }
    } catch (err) {
      console.error('[cron] auctionCloser error:', err.message);
    }
  });

  console.log('[cron] Auction closer started — checking every minute');
}

module.exports = { startAuctionCloser };
