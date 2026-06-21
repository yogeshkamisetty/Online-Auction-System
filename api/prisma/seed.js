require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── Demo accounts ────────────────────────────────────────────────────────
  const sellerHash = await bcrypt.hash('demo1234', 10);
  const seller = await prisma.user.upsert({
    where: { email: 'demo@goldenhammer.com' },
    update: {},
    create: { email: 'demo@goldenhammer.com', passwordHash: sellerHash, name: 'Yogesh Kamisetty' },
  });

  // A handful of demo bidders so bid history looks real
  const bidderNames = ['Alexandra Vance', 'Marcus Chen', 'Priya Nair', 'Sofia Romano', 'James Whitfield'];
  const bidders = [];
  for (let i = 0; i < bidderNames.length; i++) {
    const hash = await bcrypt.hash('demo1234', 10);
    const u = await prisma.user.upsert({
      where: { email: `bidder${i + 1}@goldenhammer.com` },
      update: {},
      create: { email: `bidder${i + 1}@goldenhammer.com`, passwordHash: hash, name: bidderNames[i] },
    });
    bidders.push(u);
  }

  // ── Reset demo catalog (idempotent re-seed) ──────────────────────────────
  await prisma.bid.deleteMany({});
  await prisma.auction.deleteMany({});

  const now = Date.now();
  const days = (n) => new Date(now + n * 86400000);
  const hours = (n) => new Date(now + n * 3600000);

  // High-quality, realistic studio imagery (Unsplash, auto-formatted)
  const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1000&q=80`;

  const catalog = [
    {
      title: 'Patek Philippe Perpetual Calendar 5320G',
      description: 'White gold perpetual calendar with luminous Breguet numerals. Box, papers, and service history included. A grail-tier complication from the modern Patek canon.',
      category: 'Luxury', condition: 'Mint', imageUrl: img('1523275335684-37898b6baf30'),
      startPrice: 142000, featured: true, endTime: days(3), bids: 7,
    },
    {
      title: 'Chola Dynasty Bronze Nataraja',
      description: '12th-century South Indian bronze of Shiva as Lord of the Dance. Provenance documented to a 1960s private European collection. Export-cleared.',
      category: 'Ancient', condition: 'Excellent', imageUrl: img('1610375461246-83df859d849d'),
      startPrice: 86000, featured: true, endTime: days(5), bids: 5,
    },
    {
      title: 'Roman Aureus of Marcus Aurelius',
      description: 'Gold aureus, struck Rome AD 161–180. NGC graded Choice AU, strike 5/5. Exceptional portrait with full legend.',
      category: 'Ancient', condition: 'Excellent', imageUrl: img('1633265486064-086b219458ec'),
      startPrice: 18500, featured: true, endTime: hours(20), bids: 9,
    },
    {
      title: '1965 Ford Mustang Fastback — Concours',
      description: 'Numbers-matching 289 V8, Wimbledon White, frame-off restoration to factory spec. Marti Report included.',
      category: 'Vehicles', condition: 'Excellent', imageUrl: img('1494976388531-d1058494cdd8'),
      startPrice: 64000, featured: true, endTime: days(6), bids: 4,
    },
    {
      title: 'Hermès Birkin 30 — Niloticus Crocodile',
      description: 'Diamond hardware, 18k white gold. Store-fresh condition with full set. One of the most sought-after handbags in the world.',
      category: 'Luxury', condition: 'Mint', imageUrl: img('1584917865442-de89df76afd3'),
      startPrice: 98000, featured: false, endTime: days(4), bids: 6,
    },
    {
      title: 'Goddess Durga — Hand-Carved Basalt',
      description: 'Museum-quality stone Durga with all eight arms intact. Pala period style, full provenance documentation.',
      category: 'Ancient', condition: 'Good', imageUrl: img('1582555172866-f73bb12a2ab3'),
      startPrice: 12000, featured: false, endTime: days(2), bids: 3,
    },
    {
      title: 'Basquiat Untitled Study on Paper',
      description: 'Oilstick and graphite, authenticated by the estate. Provenance from a New York gallery, 1985.',
      category: 'Modern', condition: 'Excellent', imageUrl: img('1578321272176-b7bbc0679853'),
      startPrice: 210000, featured: true, endTime: days(7), bids: 8,
    },
    {
      title: 'Egyptian Late Period Canopic Jar Set',
      description: 'Set of four limestone canopic jars with original hieroglyphic inscriptions. Exported under valid license.',
      category: 'Ancient', condition: 'Good', imageUrl: img('1608376630927-31d5d6b2e1a9'),
      startPrice: 28000, featured: false, endTime: days(3), bids: 5,
    },
    {
      title: 'Mid-Century Hans Wegner Lounge Chair',
      description: 'Original 1955 production, restored oak frame and aniline leather. A cornerstone of Danish modern design.',
      category: 'Furniture', condition: 'Excellent', imageUrl: img('1586023492125-27b2c045efd7'),
      startPrice: 4200, featured: false, endTime: days(5), bids: 2,
    },
    {
      title: 'Leica M3 Double-Stroke — 1954',
      description: 'First-year Leica M3 with original Summicron 50mm. Fully serviced, collector-grade brassing.',
      category: 'Electronics', condition: 'Good', imageUrl: img('1452780212940-6f5c0d14d848'),
      startPrice: 3800, featured: false, endTime: hours(12), bids: 4,
    },
    {
      title: 'Rolex Daytona "Paul Newman" 6239',
      description: 'Exotic dial, tropical patina, unpolished case. Among the most collectible chronographs ever made.',
      category: 'Luxury', condition: 'Excellent', imageUrl: img('1587836374828-4dbafa94cf0e'),
      startPrice: 215000, featured: true, endTime: days(4), bids: 11,
    },
    {
      title: 'Warhol "Marilyn" Screenprint — Signed',
      description: 'From the 1967 portfolio, stamped and numbered. Vivid pigment, excellent conservation.',
      category: 'Modern', condition: 'Mint', imageUrl: img('1577083552431-6e5fd01aa342'),
      startPrice: 175000, featured: false, endTime: days(6), bids: 6,
    },
  ];

  let created = 0;
  for (const item of catalog) {
    const { bids: bidCount, ...data } = item;

    // Build a realistic ascending bid ladder
    const increments = [];
    let price = Number(data.startPrice);
    for (let i = 0; i < bidCount; i++) {
      const step = Math.round(price * (0.02 + Math.random() * 0.05));
      price += step;
      increments.push(price);
    }
    const currentBid = bidCount > 0 ? increments[increments.length - 1] : data.startPrice;

    const auction = await prisma.auction.create({
      data: {
        ...data,
        currentBid,
        bidCount,
        status: 'ACTIVE',
        verificationStatus: data.featured ? 'VERIFIED' : 'UNVERIFIED',
        verifiedBy: data.featured ? 'appraisals@goldenhammer.com' : null,
        sellerId: seller.id,
      },
    });

    // Seed the bid ladder with rotating demo bidders
    for (let i = 0; i < increments.length; i++) {
      await prisma.bid.create({
        data: {
          auctionId: auction.id,
          userId: bidders[i % bidders.length].id,
          amount: increments[i],
          createdAt: new Date(now - (increments.length - i) * 3600000),
        },
      });
    }
    created++;
  }

  console.log(`\n  Seeded ${created} active auctions, 1 demo seller, ${bidders.length} demo bidders.`);
  console.log('  Demo seller login : demo@goldenhammer.com / demo1234');
  console.log('  Demo bidder login : bidder1@goldenhammer.com / demo1234\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
