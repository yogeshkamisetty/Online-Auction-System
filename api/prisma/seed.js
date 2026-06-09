require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create a demo seller account
  const passwordHash = await bcrypt.hash('demo1234', 10);
  const seller = await prisma.user.upsert({
    where: { email: 'demo@goldenhammer.com' },
    update: {},
    create: { email: 'demo@goldenhammer.com', passwordHash, name: 'Yogesh Kamisetty' },
  });

  const now = new Date();
  const days = (n) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);

  const auctions = [
    {
      title: 'Vintage 1970s Film Camera',
      description: 'A beautifully preserved 35mm film camera from the 1970s. Works perfectly, original leather case included.',
      category: 'Electronics',
      imageUrl: '/images/camera-1.avif',
      startPrice: 150,
      currentBid: 150,
      bidCount: 0,
      featured: true,
      endTime: days(2),
    },
    {
      title: 'Mid-Century Modern Chair',
      description: 'Iconic mid-century design with original upholstery. Solid walnut legs, no repairs.',
      category: 'Furniture',
      imageUrl: '/images/furniture-1.avif',
      startPrice: 420,
      currentBid: 420,
      bidCount: 2,
      featured: false,
      endTime: days(3),
    },
    {
      title: 'Limited Edition Antique Gold Watch',
      description: 'Swiss-made pocket watch circa 1920. 18k gold case, hand-engraved dial.',
      category: 'Accessories',
      imageUrl: '/images/watch-1.avif',
      startPrice: 830,
      currentBid: 830,
      bidCount: 1,
      featured: false,
      endTime: days(5),
    },
    {
      title: 'Classic 1965 Mustang Fastback',
      description: 'Numbers-matching 289 V8, Wimbledon White, fully restored to factory spec.',
      category: 'Vehicles',
      imageUrl: '/images/vehicle-1.avif',
      startPrice: 25000,
      currentBid: 25000,
      bidCount: 3,
      featured: true,
      endTime: days(7),
    },
    {
      title: 'Dancing Shiva and Parvati Statue',
      description: 'Bronze statue of Shiva and Parvati in the Nataraja pose. 12th-century style, South Indian origin.',
      category: 'Collections',
      imageUrl: '/images/shiva-parvati.avif',
      startPrice: 2500,
      currentBid: 2500,
      bidCount: 3,
      featured: true,
      endTime: days(4),
    },
    {
      title: 'Goddess Durga Statue',
      description: 'Hand-carved stone Durga with all eight arms intact. Museum-quality provenance documentation included.',
      category: 'Collections',
      imageUrl: '/images/durga-1.avif',
      startPrice: 1200,
      currentBid: 1200,
      bidCount: 1,
      featured: false,
      endTime: days(6),
    },
    {
      title: 'Ancient Egyptian Canopic Jars (Set of 4)',
      description: 'Late Period limestone canopic jars with original hieroglyphic inscriptions. Exported under valid license.',
      category: 'Collections',
      imageUrl: '/images/egypt-1.avif',
      startPrice: 3000,
      currentBid: 3000,
      bidCount: 6,
      featured: false,
      endTime: days(3),
    },
    {
      title: 'Egyptian-Inspired Decorative Vases (Pair)',
      description: 'Pair of hand-painted terracotta vases with gold-leaf Egyptian motifs. 1920s Art Deco period.',
      category: 'Collections',
      imageUrl: '/images/egypt-2.avif',
      startPrice: 1200,
      currentBid: 1200,
      bidCount: 2,
      featured: false,
      endTime: days(5),
    },
  ];

  for (const data of auctions) {
    await prisma.auction.create({ data: { ...data, status: 'ACTIVE', sellerId: seller.id } });
  }

  console.log(`Seeded ${auctions.length} auctions and 1 demo seller.`);
  console.log('Demo login: demo@goldenhammer.com / demo1234');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
