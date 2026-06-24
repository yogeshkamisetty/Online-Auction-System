const memoryLimit = new Map();

/**
 * Helper to execute rate limiting with Upstash Redis or In-Memory fallback.
 * @param {string} key Unique identifier for the rate limit subject (e.g. userId or IP)
 * @param {number} maxRequests Maximum allowed requests in the window
 * @param {number} windowMs Time window in milliseconds
 * @param {string} errorMsg Custom error message for HTTP 429
 * @param {object} res Express response object
 * @param {function} next Express next callback
 */
async function rateLimitHelper(key, maxRequests, windowMs, errorMsg, res, next) {
    const now = Date.now();

    // Upstash Redis implementation
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        try {
            const redisKey = `limit:${key}`;
            const incUrl = `${process.env.UPSTASH_REDIS_REST_URL}/incr/${redisKey}`;
            const headers = { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` };

            const incRes = await fetch(incUrl, { headers });
            const data = await incRes.json();
            const count = data.result;

            if (count === 1) {
                // First request, set expiration (windowMs converted to seconds)
                const expireSeconds = Math.ceil(windowMs / 1000);
                const expireUrl = `${process.env.UPSTASH_REDIS_REST_URL}/expire/${redisKey}/${expireSeconds}`;
                await fetch(expireUrl, { headers });
            }

            if (count > maxRequests) {
                return res.status(429).json({ error: errorMsg });
            }
            return next();
        } catch (err) {
            console.error('[upstash-limit-error] Upstash failure, falling back to memory limit:', err.message);
        }
    }

    // In-memory sliding window fallback
    const userRequests = memoryLimit.get(key) || [];
    const recentRequests = userRequests.filter(timestamp => now - timestamp < windowMs);
    recentRequests.push(now);
    memoryLimit.set(key, recentRequests);

    if (recentRequests.length > maxRequests) {
        return res.status(429).json({ error: errorMsg });
    }

    next();
}

/**
 * Limits users to 5 bids per 60 seconds.
 */
async function bidRateLimiter(req, res, next) {
    const userId = req.user?.userId;
    if (!userId) return next();
    await rateLimitHelper(
        `bid:${userId}`,
        5,
        60 * 1000,
        'Too many bid requests. Please wait a minute before bidding again.',
        res,
        next
    );
}

/**
 * Limits IPs to 10 authentication requests (login/register) per 60 seconds.
 */
async function authRateLimiter(req, res, next) {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown-ip';
    await rateLimitHelper(
        `auth:${ip}`,
        10,
        60 * 1000,
        'Too many authentication attempts. Please wait a minute before trying again.',
        res,
        next
    );
}

/**
 * Limits users to 3 consignment listings per 60 seconds.
 */
async function listingRateLimiter(req, res, next) {
    const userId = req.user?.userId;
    if (!userId) return next();
    await rateLimitHelper(
        `listing:${userId}`,
        3,
        60 * 1000,
        'Too many listing creation requests. Please wait a minute before registering another asset.',
        res,
        next
    );
}

module.exports = {
    bidRateLimiter,
    authRateLimiter,
    listingRateLimiter
};
