require('dotenv/config');
const { httpServer, app } = require('../src/index');
const prisma = require('../src/lib/prisma');

let baseUrl = '';
let serverInstance = null;

// Test state
let adminToken = '';
let sellerToken = '';
let buyerToken = '';
let testSellerId = '';
let testBuyerId = '';
let testAuctionId = '';
let pendingAuctionId = '';

let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    failedCount++;
    throw new Error(message);
  } else {
    console.log(`  ✅ PASS: ${message}`);
    passedCount++;
  }
}

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  const fetchOptions = {
    ...options,
    headers
  };
  if (options.body && typeof options.body === 'object') {
    fetchOptions.body = JSON.stringify(options.body);
  }
  const res = await fetch(url, fetchOptions);
  let json = null;
  try {
    json = await res.json();
  } catch {
    // Non-JSON response
  }
  return { status: res.status, data: json, headers: res.headers };
}

async function runTests() {
  console.log('================================================================');
  console.log('      GOLDEN HAMMER AUCTIONS — COMPREHENSIVE TEST SUITE         ');
  console.log('================================================================\n');

  // Start server on free port
  await new Promise((resolve) => {
    serverInstance = httpServer.listen(0, () => {
      const port = serverInstance.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`Ephemeral test server listening on ${baseUrl}\n`);
      resolve();
    });
  });

  try {
    // -------------------------------------------------------------
    // SUITE 1: Health & Infrastructure
    // -------------------------------------------------------------
    console.log('📌 SUITE 1: Infrastructure & Health Endpoints');
    {
      const res = await request('/health');
      assert(res.status === 200, 'GET /health responds with 200');
      assert(res.data.status === 'ok', 'Health status is ok');
    }
    {
      const res = await request('/api/newsletter', {
        method: 'POST',
        body: { email: 'vip_collector@genevavault.ch' }
      });
      assert(res.status === 200, 'POST /api/newsletter accepts valid email');
      assert(res.data.message.includes('Thank you'), 'Returns gratitude message');
    }
    {
      const res = await request('/api/newsletter', {
        method: 'POST',
        body: { email: 'not-an-email' }
      });
      assert(res.status === 400, 'POST /api/newsletter rejects invalid email with 400');
    }

    // -------------------------------------------------------------
    // SUITE 2: Authentication & Account Management
    // -------------------------------------------------------------
    console.log('\n📌 SUITE 2: Authentication & Account Lifecycle');
    // Admin login
    {
      const res = await request('/api/auth/login', {
        method: 'POST',
        body: { email: 'admin@goldenhammer.com', password: 'password123' }
      });
      assert(res.status === 200, 'Admin login succeeds with 200');
      assert(res.data.user.role === 'ADMIN', 'Admin user has ADMIN role');
      assert(!!res.data.token, 'Admin receives JWT token');
      adminToken = res.data.token;
    }
    // Seller login
    {
      const res = await request('/api/auth/login', {
        method: 'POST',
        body: { email: 'seller1@goldenhammer.com', password: 'password123' }
      });
      assert(res.status === 200, 'Seller login succeeds with 200');
      assert(!!res.data.token, 'Seller receives JWT token');
      sellerToken = res.data.token;
      testSellerId = res.data.user.id;
    }
    // Buyer login
    {
      const res = await request('/api/auth/login', {
        method: 'POST',
        body: { email: 'collector1@goldenhammer.com', password: 'password123' }
      });
      assert(res.status === 200, 'Buyer login succeeds with 200');
      assert(!!res.data.token, 'Buyer receives JWT token');
      buyerToken = res.data.token;
      testBuyerId = res.data.user.id;
    }
    // Bad credentials
    {
      const res = await request('/api/auth/login', {
        method: 'POST',
        body: { email: 'collector1@goldenhammer.com', password: 'wrongPassword999' }
      });
      assert(res.status === 401, 'Login with wrong password rejected with 401');
    }
    // Profile verification (GET /api/auth/me)
    {
      const res = await request('/api/auth/me', {
        headers: { Authorization: `Bearer ${buyerToken}` }
      });
      assert(res.status === 200, 'GET /api/auth/me returns current user profile');
      assert(res.data.user.email === 'collector1@goldenhammer.com', 'Profile email matches');
    }
    // Unauthenticated GET /api/auth/me
    {
      const res = await request('/api/auth/me');
      assert(res.status === 401, 'Unauthenticated GET /api/auth/me returns 401');
    }
    // New Registration
    const tempEmail = `test_user_${Date.now()}@goldenhammer.test`;
    {
      const res = await request('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Test Connoisseur',
          email: tempEmail,
          password: 'securePassword123'
        }
      });
      assert(res.status === 201, 'POST /api/auth/register creates new account with 201');
      assert(res.data.user.email === tempEmail.toLowerCase(), 'Registered email normalized to lowercase');
    }
    // Duplicate registration rejection
    {
      const res = await request('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Duplicate Connoisseur',
          email: tempEmail,
          password: 'securePassword123'
        }
      });
      assert(res.status === 409, 'Duplicate email registration rejected with 409 Conflict');
    }

    // -------------------------------------------------------------
    // SUITE 3: RBAC & Security Boundaries
    // -------------------------------------------------------------
    console.log('\n📌 SUITE 3: Role-Based Access Control (RBAC) & Security');
    {
      // Normal buyer trying to access admin stats
      const res = await request('/api/admin/stats', {
        headers: { Authorization: `Bearer ${buyerToken}` }
      });
      assert(res.status === 403, 'Normal user blocked from /api/admin/stats with 403');
    }
    {
      // Unauthenticated access to admin
      const res = await request('/api/admin/stats');
      assert(res.status === 401, 'Unauthenticated request to admin blocked with 401');
    }
    {
      // Admin access to stats
      const res = await request('/api/admin/stats', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert(res.status === 200, 'Admin can access /api/admin/stats');
      assert(typeof res.data.gmv === 'number', 'Stats returns gross merchandise value');
      assert(typeof res.data.platformRevenue === 'number', 'Stats returns platform revenue');
    }

    // -------------------------------------------------------------
    // SUITE 4: Marketplace Catalog, Filters & Search
    // -------------------------------------------------------------
    console.log('\n📌 SUITE 4: Catalog Discovery, Search & Filters');
    {
      const res = await request('/api/auctions');
      assert(res.status === 200, 'GET /api/auctions returns 200');
      assert(Array.isArray(res.data), 'Returns an array of auctions');
      assert(res.data.every(a => a.status === 'ACTIVE'), 'Default catalog returns only ACTIVE items');
    }
    {
      const res = await request('/api/auctions?category=Luxury%20Watches');
      assert(res.status === 200, 'Category filter responds with 200');
      assert(res.data.every(a => a.category.toLowerCase() === 'luxury watches'), 'Filtered items all belong to Luxury Watches');
    }
    {
      const res = await request('/api/auctions?status=INVALID_STATUS');
      assert(res.status === 400, 'Invalid status filter rejected with 400');
    }

    // -------------------------------------------------------------
    // SUITE 5: Consignment & Verification Lifecycle
    // -------------------------------------------------------------
    console.log('\n📌 SUITE 5: Consignment & Publishing Lifecycle');
    // Seller creates lot -> starts as PENDING
    {
      const endTime = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
      const res = await request('/api/auctions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${sellerToken}` },
        body: {
          title: 'Imperial Jadeite Pendant',
          category: 'Jewelry & Gems',
          condition: 'Mint',
          description: 'Finest Burma emerald jadeite mounted in 18k platinum.',
          startPrice: 75000,
          endTime,
          imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1200'
        }
      });
      assert(res.status === 201, 'Seller consignment created with 201');
      assert(res.data.status === 'PENDING', 'Seller consignment starts as PENDING');
      assert(res.data.verificationStatus === 'PENDING', 'Seller consignment verificationStatus starts as PENDING for admin queue');
      pendingAuctionId = res.data.id;
    }
    // Verify pending lot does NOT appear in public catalog
    {
      const res = await request('/api/auctions');
      const found = res.data.some(a => a.id === pendingAuctionId);
      assert(!found, 'Pending unverified lot is NOT visible in public active catalog');
    }
    // Admin verifies the pending lot
    {
      const res = await request(`/api/admin/auctions/${pendingAuctionId}/verify`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          verificationStatus: 'VERIFIED',
          verificationNotes: 'Gemmological certification verified by SSEF Zurich.'
        }
      });
      assert(res.status === 200, 'Admin approves lot with 200');
      assert(res.data.status === 'ACTIVE', 'Lot automatically transitioned to ACTIVE on verification');
      assert(res.data.verificationStatus === 'VERIFIED', 'Verification status set to VERIFIED');
    }
    // Verify lot is now ONLINE in public catalog
    {
      const res = await request('/api/auctions');
      const found = res.data.some(a => a.id === pendingAuctionId);
      assert(found, 'Newly verified lot is now immediately online and visible in public catalog');
    }
    // Admin creates lot directly -> should be ACTIVE immediately
    {
      const endTime = new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString();
      const res = await request('/api/auctions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          title: 'Direct Curator Royal Pocket Watch',
          category: 'Luxury Watches',
          condition: 'Mint',
          description: 'Direct consignment from royal estate.',
          startPrice: 120000,
          endTime,
          imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200'
        }
      });
      assert(res.status === 201, 'Admin consignment created with 201');
      assert(res.data.status === 'ACTIVE', 'Admin consignment is immediately ACTIVE (auto-published)');
      assert(res.data.verificationStatus === 'VERIFIED', 'Admin consignment is immediately VERIFIED');
      testAuctionId = res.data.id;
    }

    // -------------------------------------------------------------
    // SUITE 6: Live Bidding & Shill Bidding Guard
    // -------------------------------------------------------------
    console.log('\n📌 SUITE 6: Live Bidding & Shill Protection');
    // Seller bidding on own lot (shill bidding guard)
    {
      const res = await request('/api/bids', {
        method: 'POST',
        headers: { Authorization: `Bearer ${sellerToken}` },
        body: {
          auctionId: pendingAuctionId,
          amount: 80000
        }
      });
      assert(res.status === 403, 'Shill bid by seller rejected with 403 Forbidden');
      assert(res.data.error.toLowerCase().includes('own'), 'Error message cites self-bidding restriction');
    }
    // Underbid or equal bid rejection
    {
      const res = await request('/api/bids', {
        method: 'POST',
        headers: { Authorization: `Bearer ${buyerToken}` },
        body: {
          auctionId: pendingAuctionId,
          amount: 70000 // startPrice is 75000
        }
      });
      assert(res.status === 400, 'Bid lower than start price rejected with 400');
    }
    // Valid ascending bid by collector
    {
      const res = await request('/api/bids', {
        method: 'POST',
        headers: { Authorization: `Bearer ${buyerToken}` },
        body: {
          auctionId: pendingAuctionId,
          amount: 85000
        }
      });
      assert(res.status === 201, 'Valid ascending bid accepted with 201');
      assert(Number(res.data.bid.amount) === 85000, 'Bid recorded with correct amount');
    }
    // Verify auction high bid updated
    {
      const res = await request(`/api/auctions/${pendingAuctionId}`);
      assert(Number(res.data.currentBid) === 85000, 'Auction currentBid updated to 85000');
      assert(res.data.bidCount >= 1, 'Auction bidCount incremented');
      assert(res.data.bids[0].amount == 85000, 'Bid appears at top of ledger');
    }

    // -------------------------------------------------------------
    // SUITE 7: Watchlist Integration
    // -------------------------------------------------------------
    console.log('\n📌 SUITE 7: Collector Watchlist');
    {
      const res = await request('/api/watchlist', {
        method: 'POST',
        headers: { Authorization: `Bearer ${buyerToken}` },
        body: { auctionId: pendingAuctionId }
      });
      assert(res.status === 201, 'Added lot to watchlist with 201');
    }
    {
      const res = await request('/api/watchlist', {
        headers: { Authorization: `Bearer ${buyerToken}` }
      });
      assert(res.status === 200, 'GET /api/watchlist returns 200');
      const isWatched = res.data.some(w => w.id === pendingAuctionId);
      assert(isWatched, 'Watched lot is present in watchlist response');
    }
    {
      // Watch non-existent auction -> 404
      const res = await request('/api/watchlist', {
        method: 'POST',
        headers: { Authorization: `Bearer ${buyerToken}` },
        body: { auctionId: '00000000-0000-0000-0000-000000000000' }
      });
      assert(res.status === 404, 'Watching non-existent auction returns 404 (safe)');
    }
    {
      const res = await request(`/api/watchlist/${pendingAuctionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${buyerToken}` }
      });
      assert(res.status === 200, 'Removed lot from watchlist with 200');
    }

    // -------------------------------------------------------------
    // SUITE 8: Settlement & Escrow Calculations
    // -------------------------------------------------------------
    console.log('\n📌 SUITE 8: Checkout & Settlement');
    // Cannot settle ACTIVE auction
    {
      const res = await request(`/api/auctions/${pendingAuctionId}/settle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${buyerToken}` }
      });
      assert(res.status === 400, 'Settling an ACTIVE auction rejected with 400');
    }
    // Transition auction to CLOSED directly in DB to simulate countdown conclusion
    await prisma.auction.update({
      where: { id: pendingAuctionId },
      data: { status: 'CLOSED', endTime: new Date(Date.now() - 1000) }
    });
    // Non-winner cannot settle
    {
      const res = await request(`/api/auctions/${pendingAuctionId}/settle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${sellerToken}` }
      });
      assert(res.status === 403, 'Non-winning user blocked from settlement with 403');
    }
    // Winning buyer settles closed auction
    {
      const res = await request(`/api/auctions/${pendingAuctionId}/settle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${buyerToken}` }
      });
      assert(res.status === 200, 'Winning buyer settles auction with 200');
      assert(res.data.auction.status === 'SETTLED', 'Auction status transitions to SETTLED');
      assert(res.data.summary.hammerPrice === 85000, 'Summary reflects $85,000 hammer price');
      assert(res.data.summary.buyerPremium === 85000 * 0.05, '5% Buyer Premium computed accurately ($4,250)');
      assert(res.data.summary.totalPaid === 85000 * 1.05, 'Total paid matches hammer + premium ($89,250)');
      assert(res.data.summary.sellerReceives === 85000 * 0.90, 'Seller payout reflects 10% commission deduction ($76,500)');
    }
    // Double settlement prevention
    {
      const res = await request(`/api/auctions/${pendingAuctionId}/settle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${buyerToken}` }
      });
      assert(res.status === 400, 'Re-settling already settled auction rejected with 400');
    }

    // -------------------------------------------------------------
    // SUITE 9: Soft Delete & Safeguards
    // -------------------------------------------------------------
    console.log('\n📌 SUITE 9: Lot Deletion Safeguards & Retention');
    {
      // Seller cannot delete auction with bids
      // First reactivate an auction with bids
      await prisma.auction.update({
        where: { id: pendingAuctionId },
        data: { status: 'ACTIVE', deletedAt: null }
      });
      const res = await request(`/api/auctions/${pendingAuctionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${sellerToken}` }
      });
      assert(res.status === 400, 'Seller cannot delete active auction with bids (anti-fraud guard)');
    }
    {
      // Admin soft-deletes the lot
      const res = await request(`/api/auctions/${pendingAuctionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert(res.status === 200, 'Admin can place auction in retention with 200');
    }
    {
      // Check that soft-deleted lot is excluded from public search
      const res = await request(`/api/auctions/${pendingAuctionId}`);
      assert(res.status === 404, 'Soft-deleted auction returns 404 on public route');
    }
    {
      // Soft-deleted lot visible in admin retention tab
      const res = await request('/api/admin/auctions/deleted', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert(res.status === 200, 'Admin can view deleted retention archive');
      const inDeleted = res.data.some(a => a.id === pendingAuctionId);
      assert(inDeleted, 'Soft-deleted lot appears in Admin Deleted Lots archive');
    }

    // Clean up test lots
    await prisma.bid.deleteMany({ where: { auctionId: { in: [pendingAuctionId, testAuctionId] } } });
    await prisma.watchlist.deleteMany({ where: { auctionId: { in: [pendingAuctionId, testAuctionId] } } });
    await prisma.auction.deleteMany({ where: { id: { in: [pendingAuctionId, testAuctionId] } } });
    await prisma.user.deleteMany({ where: { email: tempEmail } });

  } catch (err) {
    console.error('\n💥 Test run encountered unhandled error:', err);
  } finally {
    if (serverInstance) {
      serverInstance.close();
    }
    await prisma.$disconnect();

    console.log('\n================================================================');
    console.log(`TOTAL TESTS: ${passedCount + failedCount} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
    console.log('================================================================\n');

    if (failedCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

runTests();
