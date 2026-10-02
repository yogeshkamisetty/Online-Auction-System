import React, { useState } from 'react';

const LEGAL_DOCS = {
    terms: {
        title: 'Terms of Service',
        subtitle: 'Golden Hammer Auction Platform Bylaws & Bidding Regulations',
        content: `
1. Binding Bids & Settlement: All bids submitted via Golden Hammer are legally binding obligations. When an auction timer expires, the winning bidder is entered into our secure settlement escrow.
2. Premium & Commissions: A standard Buyer's Premium of 5% is assessed on settled hammer prices. Consignors are charged a 10% platform facilitation fee upon successful transaction completion.
3. Authenticity Guarantee: Every cataloged lot has been examined and approved by our curatorial team. In the event an item's provenance is contested by an accredited authority within 30 days of acquisition, 100% of escrow funds are refunded.
4. Shill Bidding Prohibition: Consignors, their agents, and related parties are strictly prohibited from bidding on their own lots. Automated telemetry monitors IP and wallet associations to ensure absolute market integrity.
        `
    },
    privacy: {
        title: 'Privacy Policy',
        subtitle: 'Data Protection, Confidentiality & Non-Disclosure Protocol',
        content: `
1. Discretion First: We respect the privacy of high-net-worth collectors. Bidder identities are pseudonymized in public ledgers unless explicitly configured otherwise.
2. Data Retention & Erasure: Personal telemetry and identification documents required for KYC compliance are stored using AES-256 at-rest encryption and can be purged upon account closure request in accordance with GDPR and CCPA.
3. Zero Commercialization: Golden Hammer will never sell, lease, or monetize your contact information or bidding history to third parties.
        `
    },
    partners: {
        title: 'Institutional Partners',
        subtitle: 'Curatorial Affiliates, Appraisers & Secure Logistics Guilds',
        content: `
1. Museum & Horology Guilds: Affiliated with the Geneva Horological Society, Swiss Gemmological Institute (SSEF), and International Classic Car Federation.
2. Armored Logistics: All post-sale physical deliveries are routed via insured white-glove armored transit providers with continuous GPS tracking and climate-controlled storage.
3. Escrow Banking: Escrow settlements are processed via Tier-1 institutional banking partners with complete fund segregation.
        `
    },
    security: {
        title: 'Platform Security Architecture',
        subtitle: 'Cryptographic Integrity & Escrow Safeguards',
        content: `
1. Transport Security: Enforced TLS 1.3 with HSTS headers across all public endpoints and real-time WebSocket channels.
2. Payment Architecture: Full PCI-DSS Level 1 compliance. No credit card or banking secrets are ever stored in our databases.
3. Continuous Auditing: Automated bot protection, rate-limiting on authentication and bidding endpoints, and automated retention purges of soft-deleted records.
        `
    }
};

const Footer = () => {
    const [activeModal, setActiveModal] = useState(null);

    return (
        <>
            <footer className="site-footer">
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} Golden Hammer Auctions Ltd. All rights reserved.</p>
                    <div className="footer-links">
                        <button
                            type="button"
                            onClick={() => setActiveModal('terms')}
                            style={{ background: 'none', border: 'none', color: 'inherit', font: 'inherit', cursor: 'pointer', padding: 0 }}
                        >
                            Terms of Service
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveModal('privacy')}
                            style={{ background: 'none', border: 'none', color: 'inherit', font: 'inherit', cursor: 'pointer', padding: 0 }}
                        >
                            Privacy Policy
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveModal('partners')}
                            style={{ background: 'none', border: 'none', color: 'inherit', font: 'inherit', cursor: 'pointer', padding: 0 }}
                        >
                            Partners
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveModal('security')}
                            style={{ background: 'none', border: 'none', color: 'inherit', font: 'inherit', cursor: 'pointer', padding: 0 }}
                        >
                            Security
                        </button>
                    </div>
                </div>
            </footer>

            {/* Informational Dialog Modal */}
            {activeModal && (
                <div 
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="footer-dialog-title"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        padding: '16px'
                    }}
                    onClick={() => setActiveModal(null)}
                >
                    <div 
                        style={{
                            backgroundColor: '#0F1420',
                            border: '1px solid rgba(197, 168, 128, 0.3)',
                            borderRadius: '8px',
                            maxWidth: '560px',
                            width: '100%',
                            padding: '28px',
                            color: '#F3F4F6',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div>
                                <span style={{ color: 'var(--primary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                                    Official Platform Policy
                                </span>
                                <h3 id="footer-dialog-title" style={{ fontSize: '1.4rem', color: '#FFFFFF', margin: '4px 0 0' }}>
                                    {LEGAL_DOCS[activeModal].title}
                                </h3>
                                <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '4px 0 0' }}>
                                    {LEGAL_DOCS[activeModal].subtitle}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#9CA3AF',
                                    fontSize: '20px',
                                    cursor: 'pointer',
                                    padding: '4px 8px'
                                }}
                                aria-label="Close dialog"
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ whiteSpace: 'pre-line', fontSize: '13px', lineHeight: 1.7, color: '#D1D5DB', maxHeight: '360px', overflowY: 'auto', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                            {LEGAL_DOCS[activeModal].content}
                        </div>

                        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => setActiveModal(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Footer;
