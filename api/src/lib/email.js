const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Sends a transactional email. Falls back to console logging in dev if api key is missing.
 * @param {object} params
 * @param {string} params.to
 * @param {string} params.subject
 * @param {string} params.html
 */
async function sendEmail({ to, subject, html }) {
    if (!resend) {
        console.log(`\n================== [EMAIL SIMULATION] ==================`);
        console.log(`To:      ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body:`);
        console.log(html);
        console.log(`========================================================\n`);
        return { id: 'simulated-email-id' };
    }

    try {
        const response = await resend.emails.send({
            from: 'Golden Hammer Auctions <onboarding@resend.dev>', // Resend default dev domain
            to,
            subject,
            html,
        });
        return response;
    } catch (error) {
        console.error('[resend-error] Failed to dispatch email via Resend:', error.message);
        // Silently catch to avoid crashing critical bidding/auction flows (degrade gracefully)
    }
}

module.exports = { sendEmail };
