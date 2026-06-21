const memoryLimit = new Map();

/**
 * Middleware to restrict users from spamming bids.
 * Limits users to 5 bids per 60 seconds.
 * Connects to Upstash Redis if available, falls back to in-memory sliding window.
 */
async function bidRateLimiter(req, res, next) {
    const userId = req.user?.userId;
    if (!userId) return next();

    const now = Date.now();
    const windowMs = 60 * 1000; // 60 seconds
    const maxRequests = 5;

    // Upstash Redis implementation
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        try {
            const key = `limit:bid:${userId}`;
            const incUrl = `${process.env.UPSTASH_REDIS_REST_URL}/incr/${key}`;
            const headers = { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` };

            const incRes = await fetch(incUrl, { headers });
            const data = await incRes.json();
            const count = data.result;

            if (count === 1) {
                // First request, set expiration to 60s
                const expireUrl = `${process.env.UPSTASH_REDIS_REST_URL}/expire/${key}/60`;
                await fetch(expireUrl, { headers });
            }

            if (count > maxRequests) {
                return res.status(429).json({ error: 'Too many bid requests. Please wait a minute before bidding again.' });
            }
            return next();
        } catch (err) {
            console.error('[upstash-limit-error] Failed connecting to Upstash, falling back to memory limit:', err.message);
        }
    }

    // In-memory sliding window fallback
    const userRequests = memoryLimit.get(userId) || [];
    const recentRequests = userRequests.filter(timestamp => now - timestamp < windowMs);
    recentRequests.push(now);
    memoryLimit.set(userId, recentRequests);

    if (recentRequests.length > maxRequests) {
        return res.status(429).json({ error: 'Too many bid requests. Please wait a minute before bidding again.' });
    }

    next();
}

module.exports = { bidRateLimiter };
