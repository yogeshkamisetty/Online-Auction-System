import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';


const Dashboard = () => {
    const { user, token, login } = useContext(AuthContext);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const toast = useToast();

    const [activePanel, setActivePanel] = useState('dashboardHome');
    const [dashboardTab, setDashboardTab] = useState('buyer');

    const [profileForm, setProfileForm] = useState({ name: '', email: '', password: '' });
    const [profileMessage, setProfileMessage] = useState({ text: '', type: '' });

    // Custom Confirmation Modal States
    const [confirmation, setConfirmation] = useState(null);
    const confirmationDialogRef = useRef(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!token) {
            navigate('/login');
        } else if (user) {
            setProfileForm({ name: user.name, email: user.email, password: '' });
        }
    }, [token, user, navigate]);

    // Fetch Buyer Data (My Bids)
    const { data: bids = [], isLoading: isBuyerLoading, isError: isBuyerError } = useQuery({
        queryKey: ['myBids'],
        queryFn: async () => {
            const res = await api.get('/bids/my');
            return res.data;
        },
        enabled: !!user && !!token
    });

    // Fetch Seller Data (My Listings)
    const { data: sellerData = { activeListings: [], settledListings: [], closedListings: [] }, isLoading: isSellerLoading, isError: isSellerError } = useQuery({
        queryKey: ['myListings', user?.id],
        queryFn: async () => {
            const [activeRes, settledRes, closedRes] = await Promise.all([
                api.get(`/auctions?sellerId=${user.id}&status=ACTIVE`),
                api.get(`/auctions?sellerId=${user.id}&status=SETTLED`),
                api.get(`/auctions?sellerId=${user.id}&status=CLOSED`)
            ]);
            return {
                activeListings: activeRes.data,
                settledListings: settledRes.data,
                closedListings: closedRes.data
            };
        },
        enabled: !!user && !!token
    });

    const deleteMutation = useMutation({
        mutationFn: async (auctionId) => {
            const res = await api.delete(`/auctions/${auctionId}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myListings'] });
            toast.success('Listing placed in retention (will be purged in 7 days).');
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to delete listing');
        }
    });

    const handleDeleteListing = (auctionId, title) => {
        setConfirmation({
            title: 'Delete Listing',
            message: `Are you sure you want to delete "${title}"? It will be placed in retention for 7 days before permanent purge.`,
            actionText: 'Delete Listing',
            isDestructive: true,
            onConfirm: () => {
                deleteMutation.mutate(auctionId);
            }
        });
    };

    useEffect(() => {
        if (!confirmation || !confirmationDialogRef.current) return;

        const dialog = confirmationDialogRef.current;
        const focusable = Array.from(dialog.querySelectorAll('button, select, textarea, input, [href], [tabindex]:not([tabindex="-1"])'));
        if (focusable.length > 0) {
            focusable[0].focus();
        }

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setConfirmation(null);
                return;
            }
            if (event.key !== 'Tab' || focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [confirmation]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileMessage({ text: 'Saving changes...', type: 'info' });

        try {
            const body = { name: profileForm.name };
            if (profileForm.password) body.password = profileForm.password;

            const res = await api.put('/auth/me', body);
            login(res.data.user, token); // Update context
            setProfileMessage({ text: 'Profile updated successfully!', type: 'success' });
            setProfileForm({ ...profileForm, password: '' });
            setTimeout(() => setProfileMessage({ text: '', type: '' }), 3000);
        } catch (err) {
            setProfileMessage({ text: err.message || 'Update failed', type: 'error' });
        }
    };

    if (!user) return null;

    // Process Buyer Stats
    const activeBids = bids.filter(b => b.auction.status === 'ACTIVE');
    const wonBids = bids.filter(b => (b.auction.status === 'SETTLED' || b.auction.status === 'CLOSED') && b.isWinning);
    const totalSpent = bids.filter(b => b.auction.status === 'SETTLED' && b.isWinning)
                          .reduce((sum, b) => sum + parseFloat(b.amount), 0);

    // Group bids to only display the latest bid per unique auction
    const latestByAuction = {};
    bids.forEach(b => {
        if (!latestByAuction[b.auctionId] || parseFloat(b.amount) > parseFloat(latestByAuction[b.auctionId].amount)) {
            latestByAuction[b.auctionId] = b;
        }
    });
    const uniqueBids = Object.values(latestByAuction);

    // Process Seller Stats
    const activeListings = sellerData.activeListings || [];
    const settledListings = sellerData.settledListings || [];
    const closedListings = sellerData.closedListings || [];
    const sellerActiveCount = activeListings.length;
    const sellerSoldCount = settledListings.length;
    const totalGMV = settledListings.reduce((sum, a) => sum + parseFloat(a.currentBid), 0);

    // Combined listings list sorted with most active first
    const allListings = [...activeListings, ...closedListings, ...settledListings];

    return (
        <main className="container py-xl">
            {/* Header Title */}
            <div className="section-header-flex">
                <div>
                    <h1 className="headline-lg" style={{ color: 'var(--secondary)' }}>Collector Workspace</h1>
                    <p className="body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}>
                        Manage your active acquisitions, listing pipeline, and profile configuration.
                    </p>
                </div>
            </div>

            {/* Split Sidebar Layout */}
            <div className="split-layout">
                {/* Sidebar Navigation */}
                <aside className="sidebar">
                    <div className="user-profile-mini">
                        <div className="avatar-large">{user.name.charAt(0).toUpperCase()}</div>
                        <h3>{user.name}</h3>
                        <p className="font-mono label-caps" style={{ color: 'var(--primary)', fontSize: '10px' }}>
                            {user.role} Member
                        </p>
                    </div>
                    
                    <h3 className="sidebar-title">Workspace Menu</h3>
                    <ul className="dashboard-menu">
                        <li>
                            <a 
                                href="#" 
                                className={activePanel === 'dashboardHome' ? 'active' : ''} 
                                onClick={(e) => { e.preventDefault(); setActivePanel('dashboardHome'); }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>dashboard</span>
                                Workspace Home
                            </a>
                        </li>
                        <li>
                            <Link to="/watchlist">
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span>
                                Watchlist Ticker
                            </Link>
                        </li>
                        <li>
                            <a 
                                href="#" 
                                className={activePanel === 'accountSettingsView' ? 'active' : ''} 
                                onClick={(e) => { e.preventDefault(); setActivePanel('accountSettingsView'); }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>settings</span>
                                Settings & Profile
                            </a>
                        </li>
                    </ul>
                </aside>

                {/* Main Workspace Console */}
                <div className="main-content">
                    {/* Dashboard Tabbed View */}
                    {activePanel === 'dashboardHome' && (
                        <>
                            <div className="dashboard-header" style={{ marginBottom: '24px' }}>
                                <h2 className="panel-heading" style={{ margin: 0 }}>
                                    {dashboardTab === 'buyer' ? 'Acquisition Center' : 'Consignment Center'}
                                </h2>
                                <div className="dashboard-tabs">
                                    <button 
                                        className={`tab-btn ${dashboardTab === 'buyer' ? 'active' : ''}`} 
                                        onClick={() => setDashboardTab('buyer')}
                                    >
                                        Buyer Console
                                    </button>
                                    <button 
                                        className={`tab-btn ${dashboardTab === 'seller' ? 'active' : ''}`} 
                                        onClick={() => setDashboardTab('seller')}
                                    >
                                        Seller Console
                                    </button>
                                </div>
                            </div>

                            {/* Buyer Workspace */}
                            {dashboardTab === 'buyer' && (
                                <div className="space-y-lg">
                                    <div className="metrics-grid">
                                        <div className="metric-card">
                                            <p className="metric-title">Active Monitored Bids</p>
                                            <p className="metric-value">{activeBids.length}</p>
                                        </div>
                                        <div className="metric-card">
                                            <p className="metric-title">Auctions Won</p>
                                            <p className="metric-value">{wonBids.length}</p>
                                        </div>
                                        <div className="metric-card">
                                            <p className="metric-title">Escrow Capital Spent</p>
                                            <p className="metric-value font-mono">${totalSpent.toLocaleString('en-US')}</p>
                                        </div>
                                    </div>

                                    <h3 className="panel-heading">My Bidding Ledger</h3>
                                    <div className="table-container table-scroll-container">
                                        {isBuyerError ? (
                                            <div className="alert alert-error text-center" style={{ margin: 'var(--space-md)' }}>Failed to retrieve bids.</div>
                                        ) : (
                                            <table className="dashboard-table" aria-label="Bidding activities and invoice tracking">
                                                <thead>
                                                    <tr>
                                                        <th>Lot Asset</th>
                                                        <th>My Bid Amount</th>
                                                        <th>Current Top Bid</th>
                                                        <th>Bidding Status</th>
                                                        <th>Console Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {isBuyerLoading ? (
                                                        [...Array(3)].map((_, i) => (
                                                            <tr key={i}>
                                                                <td><div className="skeleton" style={{ width: '120px', height: '14px' }}></div></td>
                                                                <td><div className="skeleton" style={{ width: '80px', height: '14px' }}></div></td>
                                                                <td><div className="skeleton" style={{ width: '80px', height: '14px' }}></div></td>
                                                                <td><div className="skeleton" style={{ width: '60px', height: '14px', borderRadius: 'var(--rounded-full)' }}></div></td>
                                                                <td><div className="skeleton skeleton-btn" style={{ width: '70px', height: '24px' }}></div></td>
                                                            </tr>
                                                        ))
                                                    ) : uniqueBids.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="5" style={{ textAlign: 'center', color: 'var(--on-surface-variant)', padding: 'var(--space-lg)' }}>
                                                                No bids recorded. <Link to="/browse" style={{ color: 'var(--primary)', fontWeight: 'bold' }} aria-label="Browse catalog of live auctions">Browse live auctions</Link>
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        uniqueBids.map(bid => (
                                                            <tr key={bid.auctionId}>
                                                                <td style={{ fontWeight: 600, color: 'var(--secondary)' }}>{bid.auction.title}</td>
                                                                <td className="font-mono">${Number(bid.amount).toLocaleString('en-US')}</td>
                                                                <td className="font-mono">${Number(bid.auction.currentBid).toLocaleString('en-US')}</td>
                                                                <td>
                                                                    {bid.auction.status === 'ACTIVE' ? (
                                                                        bid.isWinning ? (
                                                                            <span className="status-badge winning">Winning</span>
                                                                        ) : (
                                                                            <span className="status-badge outbid">Outbid</span>
                                                                        )
                                                                    ) : bid.auction.status === 'CLOSED' ? (
                                                                        bid.isWinning ? (
                                                                            <span className="status-badge active" style={{ backgroundColor: 'var(--primary-container)', color: 'var(--on-primary-container)' }}>Won — awaiting settlement</span>
                                                                        ) : (
                                                                            <span className="status-badge closed">Ended</span>
                                                                        )
                                                                    ) : bid.auction.status === 'SETTLED' ? (
                                                                        bid.isWinning ? (
                                                                            <span className="status-badge winning">Purchased</span>
                                                                        ) : (
                                                                            <span className="status-badge closed">Ended</span>
                                                                        )
                                                                    ) : (
                                                                        <span className="status-badge closed">{bid.auction.status}</span>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {bid.auction.status === 'ACTIVE' ? (
                                                                        <Link to={`/product/${bid.auctionId}`} className="btn btn-primary btn-sm" aria-label={`Monitor live bidding details for ${bid.auction.title}`}>
                                                                            {bid.isWinning ? 'Monitor' : 'Bid Again'}
                                                                        </Link>
                                                                    ) : bid.auction.status === 'CLOSED' && bid.isWinning ? (
                                                                        <Link to={`/checkout/${bid.auctionId}`} className="btn btn-primary btn-sm" aria-label={`Settle invoice payment for won lot ${bid.auction.title}`}>
                                                                            Settle Invoice
                                                                        </Link>
                                                                    ) : (
                                                                        <Link to={`/product/${bid.auctionId}`} className="btn btn-ghost btn-sm" aria-label={`View lot details for ${bid.auction.title}`}>
                                                                            Details
                                                                        </Link>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Seller Workspace */}
                            {dashboardTab === 'seller' && (
                                <div className="space-y-lg">
                                    <div className="metrics-grid">
                                        <div className="metric-card">
                                            <p className="metric-title">Active Consigned Lots</p>
                                            <p className="metric-value">{sellerActiveCount}</p>
                                        </div>
                                        <div className="metric-card">
                                            <p className="metric-title">Lots Sold</p>
                                            <p className="metric-value">{sellerSoldCount}</p>
                                        </div>
                                        <div className="metric-card">
                                            <p className="metric-title">Gross Merchandise Value (GMV)</p>
                                            <p className="metric-value font-mono">${totalGMV.toLocaleString('en-US')}</p>
                                        </div>
                                    </div>

                                    <div className="panel-header-flex">
                                        <h3 className="panel-heading">Consigned Inventory</h3>
                                        <Link to="/sell" className="btn btn-secondary btn-sm" aria-label="List a new luxury consignment asset">List New Asset</Link>
                                    </div>

                                    <div className="table-container table-scroll-container">
                                        {isSellerError ? (
                                            <div className="alert alert-error text-center" style={{ margin: 'var(--space-md)' }}>Failed to retrieve listings.</div>
                                        ) : (
                                            <table className="dashboard-table" aria-label="Consigned luxury inventory ledger">
                                                <thead>
                                                    <tr>
                                                        <th>Lot Name</th>
                                                        <th>Start Val Est</th>
                                                        <th>High Bid Price</th>
                                                        <th>Asset State</th>
                                                        <th>Console Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {isSellerLoading ? (
                                                        [...Array(3)].map((_, i) => (
                                                            <tr key={i}>
                                                                <td><div className="skeleton" style={{ width: '120px', height: '14px' }}></div></td>
                                                                <td><div className="skeleton" style={{ width: '80px', height: '14px' }}></div></td>
                                                                <td><div className="skeleton" style={{ width: '80px', height: '14px' }}></div></td>
                                                                <td><div className="skeleton" style={{ width: '60px', height: '14px', borderRadius: 'var(--rounded-full)' }}></div></td>
                                                                <td><div className="skeleton skeleton-btn" style={{ width: '70px', height: '24px' }}></div></td>
                                                            </tr>
                                                        ))
                                                    ) : allListings.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="5" style={{ textAlign: 'center', color: 'var(--on-surface-variant)', padding: 'var(--space-lg)' }}>
                                                                No consignments found. <Link to="/sell" style={{ color: 'var(--primary)', fontWeight: 'bold' }} aria-label="Consign and list a new asset">List one now</Link>
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        allListings.map(a => (
                                                            <tr key={a.id}>
                                                                <td style={{ fontWeight: 600, color: 'var(--secondary)' }}>{a.title}</td>
                                                                <td className="font-mono">${Number(a.startPrice).toLocaleString('en-US')}</td>
                                                                <td className="font-mono">
                                                                    ${Number(a.currentBid).toLocaleString('en-US')} <span style={{ color: 'var(--outline)', fontSize: '11px' }}>({a.bidCount} bids)</span>
                                                                </td>
                                                                <td>
                                                                    <span className={`status-badge ${a.status.toLowerCase()}`}>{a.status}</span>
                                                                </td>
                                                                <td>
                                                                    <div className="row gap-xs">
                                                                        <Link to={`/product/${a.id}`} className="btn btn-ghost btn-sm" aria-label={`View lot details for consignment ${a.title}`}>
                                                                            Details
                                                                        </Link>
                                                                        {(a.status === 'ACTIVE' || a.status === 'PENDING') && (
                                                                            <button 
                                                                                onClick={() => handleDeleteListing(a.id, a.title)}
                                                                                className="btn btn-danger btn-sm"
                                                                                style={{ padding: '4px 8px', fontSize: '10px' }}
                                                                            >
                                                                                Delete
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Account Settings View */}
                    {activePanel === 'accountSettingsView' && (
                        <div className="space-y-lg">
                            <h2 className="panel-heading">Profile Configuration</h2>
                            <form onSubmit={handleProfileUpdate} className="detail-card space-y-md" style={{ maxWidth: '600px' }}>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input 
                                        type="text" 
                                        className="form-input"
                                        value={profileForm.name} 
                                        onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Registered Email Address</label>
                                    <input 
                                        type="email" 
                                        className="form-input"
                                        value={profileForm.email} 
                                        disabled 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Update Password</label>
                                    <input 
                                        type="password" 
                                        className="form-input"
                                        placeholder="Leave blank to maintain current credentials" 
                                        value={profileForm.password} 
                                        onChange={e => setProfileForm({ ...profileForm, password: e.target.value })} 
                                    />
                                </div>

                                {profileMessage.text && (
                                    <div className={`alert ${profileMessage.type === 'error' ? 'alert-error' : profileMessage.type === 'success' ? 'alert-success' : 'alert-info'}`}>
                                        {profileMessage.text}
                                    </div>
                                )}

                                <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
                                    Save Configurations
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Confirmation Modal Overlay */}
            <div className={`modal-overlay ${confirmation ? 'active' : ''}`} aria-hidden={!confirmation}>
                {confirmation && (
                    <div ref={confirmationDialogRef} className="detail-card glass-panel modal-content-container" role="dialog" aria-modal="true" aria-labelledby="confirmation-dialog-title" style={{
                        width: '100%',
                        maxWidth: '450px',
                        padding: 'var(--space-lg)',
                        backgroundColor: '#ffffff'
                    }}>
                        <h3 id="confirmation-dialog-title" className="panel-heading" style={{ fontSize: '18px', borderBottom: '1px solid var(--outline-variant)', paddingBottom: 'var(--space-xs)', color: 'var(--secondary)' }}>
                            {confirmation.title}
                        </h3>
                        <div style={{ marginTop: 'var(--space-md)' }}>
                            <p className="body-md" style={{ color: 'var(--on-surface-variant)', marginBottom: 'var(--space-lg)' }}>
                                {confirmation.message}
                            </p>
                            <div className="row gap-sm" style={{ justifyContent: 'flex-end' }}>
                                <button 
                                    type="button" 
                                    className="btn btn-ghost" 
                                    onClick={() => setConfirmation(null)}
                                    aria-label="Cancel action"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className={`btn ${confirmation.isDestructive ? 'btn-danger' : 'btn-primary'}`}
                                    onClick={() => {
                                        confirmation.onConfirm();
                                        setConfirmation(null);
                                    }}
                                    aria-label={confirmation.actionText}
                                >
                                    {confirmation.actionText}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default Dashboard;
