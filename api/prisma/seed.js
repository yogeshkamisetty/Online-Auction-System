require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- Golden Hammer Auctions: Seeding Curated Luxury Dataset ---');

  // Common password for all demo accounts for easy QA testing
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Core Platform Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@goldenhammer.com' },
    update: { role: 'ADMIN', name: 'Julian Vance — Chief Curator', passwordHash, suspended: false },
    create: {
      email: 'admin@goldenhammer.com',
      passwordHash,
      name: 'Julian Vance — Chief Curator',
      role: 'ADMIN',
    },
  });

  const seller1 = await prisma.user.upsert({
    where: { email: 'seller1@goldenhammer.com' },
    update: { role: 'USER', name: 'Marcus Thorne — Heritage Fine Arts', passwordHash, suspended: false },
    create: {
      email: 'seller1@goldenhammer.com',
      passwordHash,
      name: 'Marcus Thorne — Heritage Fine Arts',
      role: 'USER',
    },
  });

  const seller2 = await prisma.user.upsert({
    where: { email: 'seller2@goldenhammer.com' },
    update: { role: 'USER', name: 'Genevieve Dubois — Geneva Horology', passwordHash, suspended: false },
    create: {
      email: 'seller2@goldenhammer.com',
      passwordHash,
      name: 'Genevieve Dubois — Geneva Horology',
      role: 'USER',
    },
  });

  const collector1 = await prisma.user.upsert({
    where: { email: 'collector1@goldenhammer.com' },
    update: { role: 'USER', name: 'Eleanor Vance — Private Collector', passwordHash, suspended: false },
    create: {
      email: 'collector1@goldenhammer.com',
      passwordHash,
      name: 'Eleanor Vance — Private Collector',
      role: 'USER',
    },
  });

  const collector2 = await prisma.user.upsert({
    where: { email: 'collector2@goldenhammer.com' },
    update: { role: 'USER', name: 'Hiroshi Tanaka — Antiquities Archive', passwordHash, suspended: false },
    create: {
      email: 'collector2@goldenhammer.com',
      passwordHash,
      name: 'Hiroshi Tanaka — Antiquities Archive',
      role: 'USER',
    },
  });

  const collector3 = await prisma.user.upsert({
    where: { email: 'collector3@goldenhammer.com' },
    update: { role: 'USER', name: 'Lord Arthur Sterling', passwordHash, suspended: false },
    create: {
      email: 'collector3@goldenhammer.com',
      passwordHash,
      name: 'Lord Arthur Sterling',
      role: 'USER',
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@goldenhammer.com' },
    update: { role: 'USER', name: 'Yogesh Kamisetty', passwordHash, suspended: false },
    create: {
      email: 'demo@goldenhammer.com',
      passwordHash,
      name: 'Yogesh Kamisetty',
      role: 'USER',
    },
  });

  const bidders = [collector1, collector2, collector3, demoUser];

  // 2. Clean up existing auction-related entities
  await prisma.watchlist.deleteMany({});
  await prisma.bid.deleteMany({});
  await prisma.auction.deleteMany({});

  const now = Date.now();
  const daysFromNow = (d) => new Date(now + d * 86400000);
  const hoursFromNow = (h) => new Date(now + h * 3600000);
  const pastDays = (d) => new Date(now - d * 86400000);

  // Reliable, high-resolution luxury imagery from curated Unsplash collections
  const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=85`;

  const catalog = [
    // --- ACTIVE & LIVE BIDDING ---
    {
      title: 'Patek Philippe Perpetual Calendar Ref. 5320G',
      description: 'Grand complication in 18k white gold featuring a cream lacquered dial with luminous Breguet numerals. Complete with original winding presentation box, certificate of origin, and provenance documentation from Patek Philippe Geneva.',
      category: 'Luxury Watches',
      condition: 'Mint / Flawless',
      imageUrl: img('1523275335684-37898b6baf30'),
      startPrice: 145000,
      featured: true,
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      verifiedBy: 'appraisals@goldenhammer.com',
      verificationNotes: 'Physical examination verified movement calibre 324 S Q. All hallmarks authentic. Timegrapher amplitude 295° @ 0.1ms error.',
      endTime: daysFromNow(4),
      seller: seller2,
      bidCount: 8,
    },
    {
      title: '1967 Shelby GT500 Super Snake "One of One"',
      description: 'The pinnacle of American motorsport heritage. Factory-equipped with a lightweight aluminum 427 Shelby racing block delivering over 650 horsepower. Documented in the official Shelby World Registry with continuous single-family California ownership.',
      category: 'Classic Vehicles',
      condition: 'Concours Restored',
      imageUrl: img('1568605114967-8130f3a36994'),
      startPrice: 1850000,
      featured: true,
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      verifiedBy: 'automotive@goldenhammer.com',
      verificationNotes: 'Chassis VIN and engine stamps matching factory build sheets. Dyno tested and safety certified.',
      endTime: daysFromNow(6),
      seller: seller1,
      bidCount: 12,
    },
    {
      title: 'Original Chola Dynasty Bronze Shiva Nataraja (11th Century)',
      description: 'Monumental South Indian lost-wax cast bronze depicting Shiva in the cosmic dance of destruction and creation. Preserves exceptional natural malachite patina. Accompanied by archaeological thermoluminescence analysis and historical export clearance.',
      category: 'Ancient Antiquities',
      condition: 'Museum Grade',
      imageUrl: img('1609137144820-21a4fa65b056'),
      startPrice: 320000,
      featured: true,
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      verifiedBy: 'antiquities@goldenhammer.com',
      verificationNotes: 'Thermoluminescence dating confirms medieval alloy composition. Provenance traced to 1968 Paris private collection.',
      endTime: daysFromNow(5),
      seller: seller1,
      bidCount: 9,
    },
    {
      title: 'Claude Monet — "Nymphéas au Crépuscule" (1914 Oil Study)',
      description: 'Luminous oil on canvas study exploring water reflections at Giverny. Signed lower right. Featured in the Wildenstein Catalogue Raisonné Volume IV. Previously exhibited at the Kunsthalle Basel.',
      category: 'Fine Art',
      condition: 'Archival Conservation',
      imageUrl: img('1579783902614-a3fb3927b675'),
      startPrice: 2400000,
      featured: true,
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      verifiedBy: 'art-curator@goldenhammer.com',
      verificationNotes: 'Pigment analysis confirmed synthetic ultramarine and viridian consistent with Monet’s late palette. Stable stretcher and lining.',
      endTime: daysFromNow(7),
      seller: seller1,
      bidCount: 14,
    },
    {
      title: 'Roman Imperial Gold Aureus of Marcus Aurelius (AD 161–180)',
      description: 'Extremely rare high-relief aureus struck in Rome. Obverse features detailed portrait of philosopher-emperor Marcus Aurelius with laureate wreath. Reverse shows Providentia holding wand and sceptre. NGC certified Choice AU 5/5 strike.',
      category: 'Rare Coins',
      condition: 'Mint State / AU',
      imageUrl: img('1633265486064-086b219458ec'),
      startPrice: 42000,
      featured: false,
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      verifiedBy: 'numismatics@goldenhammer.com',
      verificationNotes: 'NGC slabbed and authenticated. Flawless weight of 7.28g consistent with RIC III 170.',
      endTime: hoursFromNow(18),
      seller: seller1,
      bidCount: 11,
    },
    {
      title: 'Rolex Cosmograph Daytona "Paul Newman" Ref. 6239',
      description: 'Iconic stainless steel chronograph with exotic tricolor dial, art-deco font subdials, and stepped outer seconds track. Valjoux 722 mechanical movement in immaculate running condition. One of the most coveted watches in horological history.',
      category: 'Luxury Watches',
      condition: 'Excellent',
      imageUrl: img('1587836374828-4dbafa94cf0e'),
      startPrice: 285000,
      featured: true,
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      verifiedBy: 'appraisals@goldenhammer.com',
      verificationNotes: 'Authentic Singer dial with clean step. Serial 2.00M dates case to 1969. All pusher facets crisp.',
      endTime: daysFromNow(3),
      seller: seller2,
      bidCount: 15,
    },
    {
      title: 'The "Kashmir Twilight" 8.45ct Royal Blue Sapphire Ring',
      description: 'Unheated natural Kashmir sapphire exhibiting the legendary velvety cornflower blue hue. Flanked by tapered baguette diamond shoulders in platinum. Accompanied by SSEF and Gübelin Gemmological reports certifying origin.',
      category: 'Jewelry & Gems',
      condition: 'Mint',
      imageUrl: img('1605100804763-247f67b3557e'),
      startPrice: 650000,
      featured: true,
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      verifiedBy: 'gemology@goldenhammer.com',
      verificationNotes: 'SSEF Report No. 118429 confirms absence of thermal treatment. Exceptional transparency and microscopic rutile silk.',
      endTime: daysFromNow(5),
      seller: seller2,
      bidCount: 7,
    },
    {
      title: '1957 Mercedes-Benz 300 SL Roadster',
      description: 'Factory finished in DB 180 Silver Grey over dark blue leather. Retains original numbers-matching M198 direct fuel injection straight-six engine. Fitted with rare Rudge knock-off wheels and Becker Mexico radio.',
      category: 'Classic Vehicles',
      condition: 'Original / Restored',
      imageUrl: img('1503376780353-7e6692767b70'),
      startPrice: 1250000,
      featured: false,
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      verifiedBy: 'automotive@goldenhammer.com',
      verificationNotes: 'Mercedes-Benz Classic Zertifikat verified. Chassis, engine, and gearbox numbers match factory delivery record.',
      endTime: daysFromNow(8),
      seller: seller1,
      bidCount: 6,
    },
    {
      title: 'Original Hans Wegner "Papa Bear" Lounge Chair (1954)',
      description: 'First production run manufactured by A.P. Stolen, Copenhagen. Solid Danish teak legs and arm caps with original hand-stitched Gabriel wool upholstery. Structural joint inspection completed by certified mid-century specialists.',
      category: 'Vintage Furniture',
      condition: 'Excellent',
      imageUrl: img('1586023492125-27b2c045efd7'),
      startPrice: 18500,
      featured: false,
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      verifiedBy: 'furniture@goldenhammer.com',
      verificationNotes: 'Authentic A.P. Stolen stamp on seat frame. Original horsehair and coil spring internal construction.',
      endTime: daysFromNow(2),
      seller: seller1,
      bidCount: 5,
    },
    {
      title: 'Basquiat — "Crown & Warrior" Original Oilstick Study',
      description: 'Dynamic 1982 oilstick and charcoal composition on Arches paper. Bearing the iconic three-pointed crown motif. Authentication stamp by the Estate of Jean-Michel Basquiat, New York.',
      category: 'Fine Art',
      condition: 'Excellent',
      imageUrl: img('1578321272176-b7bbc0679853'),
      startPrice: 480000,
      featured: false,
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      verifiedBy: 'art-curator@goldenhammer.com',
      verificationNotes: 'Authenticated by Basquiat Authentication Committee. Archival museum glass framing.',
      endTime: hoursFromNow(14),
      seller: seller1,
      bidCount: 10,
    },
    {
      title: 'First Edition 2011 Casascius 1 BTC Physical Bitcoin',
      description: 'Original brass 1 Bitcoin physical token with intact security hologram concealing the private cryptographic key. Series 1 error coin ("Casascius" typo on hologram border), making it among the rarest specimens in crypto-numismatics.',
      category: 'Rare Coins',
      condition: 'Mint Condition',
      imageUrl: img('1621761191319-c6fb62004040'),
      startPrice: 92000,
      featured: false,
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      verifiedBy: 'numismatics@goldenhammer.com',
      verificationNotes: 'Hologram intact with zero peel or honeycomb pattern showing. Public address verified on the Bitcoin blockchain.',
      endTime: daysFromNow(4),
      seller: seller2,
      bidCount: 8,
    },
    {
      title: 'Hermès Birkin 25 Faubourg "Minuit" Alligator & Calfskin',
      description: 'One of the rarest limited-edition collector Birkins ever produced, styled as the architectural facade of 24 Rue du Faubourg Saint-Honoré in Paris. Matte Black alligator with Box calf and palladium hardware.',
      category: 'Jewelry & Gems',
      condition: 'Store Fresh / New in Box',
      imageUrl: img('1584917865442-de89df76afd3'),
      startPrice: 220000,
      featured: true,
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      verifiedBy: 'appraisals@goldenhammer.com',
      verificationNotes: 'Full set: box, ribbons, clochette, lock, keys, felt, rain hat, and original store receipt.',
      endTime: daysFromNow(5),
      seller: seller2,
      bidCount: 6,
    },

    // --- PENDING VERIFICATION (IN ADMIN QUEUE TO DEMONSTRATE VERIFY FLOW) ---
    {
      title: 'Audemars Piguet Royal Oak "Jumbo" Extra-Thin Openworked',
      description: 'Reference 16204BC in 18k white gold. Hand-finished skeletonized Calibre 7124 movement with bidirectional 22k gold rotor. Consigned by private Zurich collector awaiting appraisal verification.',
      category: 'Luxury Watches',
      condition: 'Mint / Flawless',
      imageUrl: img('1548036328-c9fa89d128fa'),
      startPrice: 165000,
      featured: false,
      status: 'ACTIVE',
      verificationStatus: 'PENDING',
      verifiedBy: null,
      verificationNotes: null,
      endTime: daysFromNow(9),
      seller: seller2,
      bidCount: 2,
    },
    {
      title: 'Greek Hellenistic Terracotta Lekythos (4th Century BC)',
      description: 'Attic red-figure funerary oil vessel depicting Nike presenting a wreath to a triumphant athlete. Intact mouth and foot with minor ancient surface encrustation.',
      category: 'Ancient Antiquities',
      condition: 'Good (Ancient Wear)',
      imageUrl: img('1582555172866-f73bb12a2ab3'),
      startPrice: 24000,
      featured: false,
      status: 'ACTIVE',
      verificationStatus: 'PENDING',
      verifiedBy: null,
      verificationNotes: null,
      endTime: daysFromNow(7),
      seller: seller1,
      bidCount: 1,
    },

    // --- CLOSED AUCTIONS (WON BY DEMO COLLECTORS — READY FOR SETTLEMENT TEST) ---
    {
      title: 'Cartier Art Deco "Comet" Mystery Clock (circa 1928)',
      description: 'Exceptional desk timepiece with platinum, rock crystal, lapis lazuli, and rose-cut diamonds. Floating hands appear detached from the mechanical movement. Acquired from the estate of a Gilded Age European dynasty.',
      category: 'Luxury Watches',
      condition: 'Museum Restored',
      imageUrl: img('1509042239860-f550ce710b93'),
      startPrice: 195000,
      featured: true,
      status: 'CLOSED',
      verificationStatus: 'VERIFIED',
      verifiedBy: 'appraisals@goldenhammer.com',
      verificationNotes: 'Internal Maurice Coüet mechanism serviced and certified functional. Provenance verified by Cartier Heritage.',
      endTime: pastDays(1),
      seller: seller1,
      bidCount: 9,
      winner: collector1, // Eleanor Vance won this — ready to test /checkout!
    },
    {
      title: '1973 Porsche 911 Carrera RS 2.7 Lightweight (M471)',
      description: 'One of just 200 factory Lightweight specification examples produced. Grand Prix White with blue Carrera script. Numbers-matching 2.7-litre mechanically fuel-injected engine and factory bucket seats.',
      category: 'Classic Vehicles',
      condition: 'Concours Condition',
      imageUrl: img('1614162692292-7ac56d7f7f1e'),
      startPrice: 850000,
      featured: true,
      status: 'CLOSED',
      verificationStatus: 'VERIFIED',
      verifiedBy: 'automotive@goldenhammer.com',
      verificationNotes: 'Porsche Certificate of Authenticity confirming factory M471 lightweight option code.',
      endTime: pastDays(2),
      seller: seller2,
      bidCount: 11,
      winner: demoUser, // Yogesh Kamisetty won this — ready to test /checkout!
    },

    // --- SETTLED AUCTIONS (DEMONSTRATING COMPLETED ACQUISITIONS & INVOICES) ---
    {
      title: 'Ancient Hellenistic Greek Gold Diadem (circa 320 BC)',
      description: 'Exquisite olive-leaf wreath crafted in pure 24-carat sheet gold with central garnet cabochon Herakles knot. Documented acquisition with legal antiquities clearance certificate.',
      category: 'Ancient Antiquities',
      condition: 'Excellent Archeological',
      imageUrl: img('1610375461246-83df859d849d'),
      startPrice: 180000,
      featured: false,
      status: 'SETTLED',
      verificationStatus: 'VERIFIED',
      verifiedBy: 'antiquities@goldenhammer.com',
      verificationNotes: 'Metallurgical microscopy matches late Macedonian gold purity. Provenance verified.',
      endTime: pastDays(5),
      seller: seller1,
      bidCount: 7,
      winner: collector2,
      platformFee: 21500.00,
      buyerPremium: 10750.00,
    },
    {
      title: 'Original Le Corbusier LC4 Chaise Longue Prototype',
      description: 'Manufactured by Thonet in 1930 with chromed tubular steel frame and natural pony skin upholstery. Stamped serial number 044 on the underside frame crossbar.',
      category: 'Vintage Furniture',
      condition: 'Collector Vintage',
      imageUrl: img('1555041469-a586c61ea9bc'),
      startPrice: 38000,
      featured: false,
      status: 'SETTLED',
      verificationStatus: 'VERIFIED',
      verifiedBy: 'furniture@goldenhammer.com',
      verificationNotes: 'Thonet Paris production confirmed by design museum archive registrar.',
      endTime: pastDays(8),
      seller: seller1,
      bidCount: 4,
      winner: collector3,
      platformFee: 4600.00,
      buyerPremium: 2300.00,
    },
  ];

  let createdCount = 0;

  for (const item of catalog) {
    const { bidCount, winner, seller, ...data } = item;

    // Generate ascending bid amounts
    const increments = [];
    let price = Number(data.startPrice);
    for (let i = 0; i < bidCount; i++) {
      const step = Math.round(price * (0.03 + Math.random() * 0.05));
      price += step;
      increments.push(price);
    }

    const currentBid = bidCount > 0 ? increments[increments.length - 1] : data.startPrice;

    const auction = await prisma.auction.create({
      data: {
        ...data,
        currentBid,
        bidCount,
        sellerId: seller.id,
      },
    });

    // Create realistic bid history
    for (let i = 0; i < increments.length; i++) {
      let bidderForStep;
      // If auction has a designated winner and this is the final bid:
      if (i === increments.length - 1 && winner) {
        bidderForStep = winner;
      } else {
        // Rotate among collectors, ensuring seller does NOT bid on own auction!
        const validBidders = bidders.filter((b) => b.id !== seller.id);
        bidderForStep = validBidders[i % validBidders.length];
      }

      await prisma.bid.create({
        data: {
          auctionId: auction.id,
          userId: bidderForStep.id,
          amount: increments[i],
          createdAt: new Date(now - (increments.length - i) * 7200000), // Staggered hours
        },
      });
    }

    createdCount++;
  }

  // 3. Create rich Watchlists for demo collectors
  const allActiveAuctions = await prisma.auction.findMany({ where: { status: 'ACTIVE' }, take: 6 });
  for (const auc of allActiveAuctions.slice(0, 4)) {
    await prisma.watchlist.create({
      data: { userId: collector1.id, auctionId: auc.id },
    }).catch(() => {});
    await prisma.watchlist.create({
      data: { userId: demoUser.id, auctionId: auc.id },
    }).catch(() => {});
  }

  console.log(`\n========================================================`);
  console.log(`✅ Database successfully seeded with ${createdCount} Curated Luxury Lots!`);
  console.log(`--------------------------------------------------------`);
  console.log(`Demo Credentials for QA Verification:`);
  console.log(`  1. Chief Curator (ADMIN):   admin@goldenhammer.com   / password123`);
  console.log(`  2. Fine Art Seller:         seller1@goldenhammer.com / password123`);
  console.log(`  3. Horology Seller:         seller2@goldenhammer.com / password123`);
  console.log(`  4. Private Collector (Won): collector1@goldenhammer.com / password123`);
  console.log(`  5. Standard User (Won Car): demo@goldenhammer.com    / password123`);
  console.log(`========================================================\n`);
}

main()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
