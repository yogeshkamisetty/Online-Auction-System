import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
    const { user, token, login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [activePanel, setActivePanel] = useState('dashboardHome');
    const [dashboardTab, setDashboardTab] = useState('buyer');

    const [buyerData, setBuyerData] = useState({ bids: [], activeCount: 0, wonCount: 0, totalSpent: 0 });
    const [sellerData, setSellerData] = useState({ activeListings: [], settledListings: [], activeCount: 0, soldCount: 0, totalGMV: 0 });

    const [profileForm, setProfileForm] = useState({ name: '', email: '', password: '' });
    const [profileMessage, setProfileMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        if (user) {
            setProfileForm({ name: user.name, email: user.email, password: '' });
            fetchBuyerData();
            fetchSellerData();
        }
    }, [token, user, navigate]);

    const fetchBuyerData = async () => {
        try {
            const res = await axios.get('http://localhost:3001/api/bids/my');
            const bids = res.data;
            const activeBids = bids.filter(b => b.auction.status === 'ACTIVE');
            const wonBids = bids.filter(b => b.auction.status === 'SETTLED' && b.isWinning);
            const totalSpent = wonBids.reduce((sum, b) => sum + parseFloat(b.amount), 0);

            const latestByAuction = {};
            bids.forEach(b => {
                if (!latestByAuction[b.auctionId] || parseFloat(b.amount) > parseFloat(latestByAuction[b.auctionId].amount)) {
                    latestByAuction[b.auctionId] = b;
                }
            });

            setBuyerData({
                bids: Object.values(latestByAuction),
                activeCount: activeBids.length,
                wonCount: wonBids.length,
                totalSpent
            });
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSellerData = async () => {
        if (!user) return;
        try {
            const [activeRes, settledRes] = await Promise.all([
                axios.get(`http://localhost:3001/api/auctions?sellerId=${user.id}&status=ACTIVE`),
                axios.get(`http://localhost:3001/api/auctions?sellerId=${user.id}&status=SETTLED`)
            ]);

            const activeListings = activeRes.data;
            const settledListings = settledRes.data;
            const totalGMV = settledListings.reduce((sum, a) => sum + parseFloat(a.currentBid), 0);

            setSellerData({
                activeListings,
                settledListings,
                activeCount: activeListings.length,
                soldCount: settledListings.length,
                totalGMV
            });
        } catch (err) {
            console.error(err);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileMessage({ text: 'Saving...', type: 'info' });

        try {
            const body = { name: profileForm.name };
            if (profileForm.password) body.password = profileForm.password;

            const res = await axios.put('http://localhost:3001/api/auth/me', body);
            login(res.data.user, token); // Update context
            setProfileMessage({ text: 'Profile updated successfully!', type: 'success' });
            setProfileForm({ ...profileForm, password: '' });
            setTimeout(() => setProfileMessage({ text: '', type: '' }), 3000);
        } catch (err) {
            setProfileMessage({ text: err.response?.data?.error || 'Update failed', type: 'error' });
        }
    };

    if (!user) return null;

    return (
        <main className="container page-spacing">
            <div className="dashboard-header">
                <h1 className="page-title">Welcome back, {user.name.split(' ')[0]}!</h1>
                {activePanel === 'dashboardHome' && (
                    <div className="dashboard-tabs" style={{ display: 'flex' }}>
                        <button className={`tab-btn ${dashboardTab === 'buyer' ? 'active' : ''}`} onClick={() => setDashboardTab('buyer')}>Buyer Dashboard</button>
                        <button className={`tab-btn ${dashboardTab === 'seller' ? 'active' : ''}`} onClick={() => setDashboardTab('seller')}>Seller Dashboard</button>
                    </div>
                )}
            </div>

            <div className="split-layout">
                <aside className="sidebar">
                    <div className="user-profile-mini">
                        <div className="avatar-large">{user.name.charAt(0).toUpperCase()}</div>
                        <h3>{user.name}</h3>
                        <p>Member since {new Date(user.createdAt || Date.now()).getFullYear()}</p>
                    </div>
                    
                    <h3 className="sidebar-title">Account Menu</h3>
                    <ul className="dashboard-menu">
                        <li><a href="#" className={activePanel === 'dashboardHome' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActivePanel('dashboardHome'); }}>Dashboard Home</a></li>
                        <li><a href="#" className={activePanel === 'messagesView' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActivePanel('messagesView'); }}>Messages <span className="badge-notification">2</span></a></li>
                        <li><a href="#" className={activePanel === 'watchlistView' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActivePanel('watchlistView'); }}>Watchlist</a></li>
                        <li><a href="#" className={activePanel === 'accountSettingsView' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActivePanel('accountSettingsView'); }}>Account Settings</a></li>
                        <li><a href="#" className={activePanel === 'paymentMethodsView' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActivePanel('paymentMethodsView'); }}>Payment Methods</a></li>
                    </ul>
                </aside>

                <div className="main-content">
                    {/* Dashboard Home */}
                    {activePanel === 'dashboardHome' && (
                        <>
                            {dashboardTab === 'buyer' && (
                                <div className="dashboard-panel active-panel">
                                    <div className="metrics-grid">
                                        <div className="metric-card">
                                            <h4 className="metric-title">Active Bids</h4>
                                            <p className="metric-value">{buyerData.activeCount}</p>
                                        </div>
                                        <div className="metric-card">
                                            <h4 className="metric-title">Items Won</h4>
                                            <p className="metric-value">{buyerData.wonCount}</p>
                                        </div>
                                        <div className="metric-card">
                                            <h4 className="metric-title">Total Spent</h4>
                                            <p className="metric-value">${buyerData.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                        </div>
                                    </div>
                                    <h2 className="panel-heading">My Active Bids</h2>
                                    <div className="table-container">
                                        <table className="dashboard-table">
                                            <thead>
                                                <tr>
                                                    <th>Item</th>
                                                    <th>My Bid</th>
                                                    <th>Current Top Bid</th>
                                                    <th>Status</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {buyerData.bids.length === 0 ? (
                                                    <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>No bids yet. <Link to="/browse" style={{ color: 'var(--primary)' }}>Browse auctions</Link></td></tr>
                                                ) : (
                                                    buyerData.bids.map(bid => (
                                                        <tr key={bid.auctionId}>
                                                            <td>{bid.auction.title}</td>
                                                            <td>${Number(bid.amount).toLocaleString()}</td>
                                                            <td>${Number(bid.auction.currentBid).toLocaleString()}</td>
                                                            <td>{bid.isWinning ? <span className="status-badge winning">Winning</span> : <span className="status-badge outbid">Outbid</span>}</td>
                                                            <td>
                                                                {bid.auction.status === 'ACTIVE' && !bid.isWinning ? (
                                                                    <Link to={`/product/${bid.auctionId}`} className="btn btn-primary btn-sm">Bid Again</Link>
                                                                ) : (
                                                                    <Link to={`/product/${bid.auctionId}`} className="action-link">View</Link>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {dashboardTab === 'seller' && (
                                <div className="dashboard-panel active-panel">
                                    <div className="metrics-grid">
                                        <div className="metric-card">
                                            <h4 className="metric-title">Active Listings</h4>
                                            <p className="metric-value">{sellerData.activeCount}</p>
                                        </div>
                                        <div className="metric-card">
                                            <h4 className="metric-title">Items Sold</h4>
                                            <p className="metric-value">{sellerData.soldCount}</p>
                                        </div>
                                        <div className="metric-card">
                                            <h4 className="metric-title">Total GMV</h4>
                                            <p className="metric-value">${sellerData.totalGMV.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                        </div>
                                    </div>
                                    <div className="panel-header-flex">
                                        <h2 className="panel-heading">My Listings</h2>
                                        <Link to="/sell" className="btn btn-primary">Create New Auction</Link>
                                    </div>
                                    <div className="table-container">
                                        <table className="dashboard-table">
                                            <thead>
                                                <tr>
                                                    <th>Item Name</th>
                                                    <th>Starting Price</th>
                                                    <th>Current Bid</th>
                                                    <th>Status</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sellerData.activeListings.length === 0 ? (
                                                    <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>No active listings. <Link to="/sell" style={{ color: 'var(--primary)' }}>Create one</Link></td></tr>
                                                ) : (
                                                    sellerData.activeListings.map(a => (
                                                        <tr key={a.id}>
                                                            <td>{a.title}</td>
                                                            <td>${Number(a.startPrice).toLocaleString()}</td>
                                                            <td>${Number(a.currentBid).toLocaleString()} <span className="bid-count">({a.bidCount} bids)</span></td>
                                                            <td><span className="badge-live">ACTIVE</span></td>
                                                            <td><Link to={`/product/${a.id}`} className="action-link">Manage</Link></td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Messages View */}
                    {activePanel === 'messagesView' && (
                        <div>
                            <h2 className="panel-heading">Messages</h2>
                            <div style={{ background: 'var(--card-bg, #fff)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border-color, #e5e7eb)' }}>
                                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color, #e5e7eb)', display: 'flex', justifyContent: 'space-between' }}>
                                    <div><strong>System Admin</strong><p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Welcome to Golden Hammer Auctions! Let us know if you need help.</p></div>
                                    <small>2 hours ago</small>
                                </div>
                                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color, #e5e7eb)', display: 'flex', justifyContent: 'space-between' }}>
                                    <div><strong>Seller: AntiquitiesRUs</strong><p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Your winning bid on the Ancient Canopic Jar has been processed!</p></div>
                                    <small>1 day ago</small>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Watchlist View */}
                    {activePanel === 'watchlistView' && (
                        <div>
                            <h2 className="panel-heading">My Watchlist</h2>
                            <div className="metrics-grid">
                                 <div className="metric-card" style={{ textAlign: 'center', padding: '3rem' }}>
                                     <p style={{ color: 'var(--text-muted)' }}>You aren't watching any items yet.</p>
                                     <Link to="/browse" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Browse Auctions</Link>
                                 </div>
                            </div>
                        </div>
                    )}

                    {/* Account Settings View */}
                    {activePanel === 'accountSettingsView' && (
                        <div>
                            <h2 className="panel-heading">Account Settings</h2>
                            <form onSubmit={handleProfileUpdate} style={{ background: 'var(--card-bg, #fff)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border-color, #e5e7eb)', maxWidth: '600px' }}>
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Full Name</label>
                                    <input type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                                </div>
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Email Address</label>
                                    <input type="email" value={profileForm.email} disabled style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: '#f3f4f6' }} />
                                </div>
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Password</label>
                                    <input type="password" placeholder="Leave blank to keep current password" value={profileForm.password} onChange={e => setProfileForm({ ...profileForm, password: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                                </div>
                                <p style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '15px', minHeight: '20px', color: profileMessage.type === 'error' ? '#e11d48' : '#166534' }}>{profileMessage.text}</p>
                                <button type="submit" className="btn btn-primary">Save Changes</button>
                            </form>
                        </div>
                    )}

                    {/* Payment Methods View */}
                    {activePanel === 'paymentMethodsView' && (
                        <div>
                            <div className="panel-header-flex">
                                 <h2 className="panel-heading">Payment Methods</h2>
                                 <button className="btn btn-primary">Add New Card</button>
                            </div>
                            <div style={{ background: 'var(--card-bg, #fff)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border-color, #e5e7eb)', maxWidth: '600px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '6px', marginBottom: '1rem' }}>
                                     <div>
                                          <strong>Visa ending in 4242</strong>
                                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Expires 12/28</p>
                                     </div>
                                     <span className="badge-live" style={{ background: '#166534', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>Default</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                                     <div>
                                          <strong>Mastercard ending in 8812</strong>
                                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Expires 09/26</p>
                                     </div>
                                     <button className="btn btn-light-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Set Default</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default Dashboard;
