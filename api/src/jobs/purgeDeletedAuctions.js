const cron = require('node-cron');
const prisma = require('../lib/prisma');
const cloudinary = require('cloudinary').v2;

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

function startPurgeJob() {
  // Runs daily at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);

      const expired = await prisma.auction.findMany({
        where: { deletedAt: { lte: cutoff } }
      });

      if (expired.length === 0) return;

      console.log(`[cron] Found ${expired.length} auctions to permanently purge.`);

      for (const auction of expired) {
        // 1. Delete image from Cloudinary
        const publicId = getCloudinaryPublicId(auction.imageUrl);
        if (publicId && process.env.CLOUDINARY_CLOUD_NAME) {
          try {
            await cloudinary.uploader.destroy(publicId);
            console.log(`[cron] Cloudinary asset deleted for auction ${auction.id}: ${publicId}`);
          } catch (cloudErr) {
            console.error(`[cron] Failed to delete Cloudinary asset ${publicId}:`, cloudErr.message);
          }
        } else {
          console.log(`[cron] Cloudinary credentials missing or non-Cloudinary image url for auction ${auction.id}. Skipping asset deletion.`);
        }

        // 2. Delete bids and auction from database
        await prisma.$transaction([
          prisma.bid.deleteMany({ where: { auctionId: auction.id } }),
          prisma.auction.delete({ where: { id: auction.id } })
        ]);
        console.log(`[cron] Permanently purged database auction: ${auction.title} (${auction.id})`);
      }
    } catch (err) {
      console.error('[cron] purgeJob error:', err.message);
    }
  });

  console.log('[cron] Purge job scheduled — checking daily at midnight');
}

function getCloudinaryPublicId(url) {
  if (!url || !url.includes('res.cloudinary.com')) return null;
  const parts = url.split('/image/upload/');
  if (parts.length < 2) return null;
  let path = parts[1];
  path = path.replace(/^v\d+\//, '');
  const lastDotIndex = path.lastIndexOf('.');
  if (lastDotIndex !== -1) {
    path = path.substring(0, lastDotIndex);
  }
  return path;
}

module.exports = { startPurgeJob };
