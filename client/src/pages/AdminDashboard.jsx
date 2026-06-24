import React, { useEffect, useRef, useState, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';
import Pagination from '../components/Pagination';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const queryClient = useQueryClient();
    const toast = useToast();
    const verificationDialogRef = useRef(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'overview';
    
    // Pagination & Search States
    const [userSearch, setUserSearch] = useState('');
    const [userPage, setUserPage] = useState(0);
    const [auctionSearch, setAuctionSearch] = useState('');
    const [auctionPage, setAuctionPage] = useState(0);
    const [statusFilter, setStatusFilter] = useState('');
    const [verificationFilter, setVerificationFilter] = useState('');

    // Verification Modal States
    const [verifyingAuction, setVerifyingAuction] = useState(null);
    const [verificationNotes, setVerificationNotes] = useState('');
    const [verificationStatus, setVerificationStatus] = useState('VERIFIED');
    const [verifyingError, setVerifyingError] = useState('');

    // Custom Confirmation Modal States
    const [confirmation, setConfirmation] = useState(null);
    const confirmationDialogRef = useRef(null);

    const limit = 20;

    // Queries
    const { data: stats, isLoading: statsLoading, isError: statsError } = useQuery({
        queryKey: ['adminStats'],
        queryFn: async () => {
            const res = await api.get('/admin/stats');
            return res.data;
        },
        enabled: activeTab === 'overview'
    });

    const { data: usersData, isLoading: usersLoading, isError: usersError } = useQuery({
        queryKey: ['adminUsers', userSearch, userPage],
        queryFn: async () => {
            const res = await api.get(`/admin/users?search=${userSearch}&take=${limit}&skip=${userPage * limit}`);
            return res.data;
        },
        enabled: activeTab === 'users'
    });

    const { data: auctionsData, isLoading: auctionsLoading, isError: auctionsError } = useQuery({
        queryKey: ['adminAuctions', auctionSearch, auctionPage, statusFilter, verificationFilter],
        queryFn: async () => {
            let url = `/admin/auctions?search=${auctionSearch}&take=${limit}&skip=${auctionPage * limit}`;
            if (statusFilter) url += `&status=${statusFilter}`;
            if (verificationFilter) url += `&verificationStatus=${verificationFilter}`;
            const res = await api.get(url);
            return res.data;
        },
        enabled: activeTab === 'auctions' || activeTab === 'verification'
    });

    const { data: deletedAuctions, isLoading: deletedLoading, isError: deletedError } = useQuery({
        queryKey: ['adminDeletedAuctions'],
        queryFn: async () => {
            const res = await api.get('/admin/auctions/deleted');
            return res.data;
        },
        enabled: activeTab === 'deleted'
    });

    // Mutations
    const suspendMutation = useMutation({
        mutationFn: async ({ userId, suspended }) => {
            const res = await api.patch(`/admin/users/${userId}`, { suspended });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to update user status');
        }
    });

    const verifyMutation = useMutation({
        mutationFn: async ({ auctionId, verificationStatus, verificationNotes }) => {
            const res = await api.patch(`/admin/auctions/${auctionId}/verify`, {
                verificationStatus,
                verificationNotes
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminAuctions'] });
            queryClient.invalidateQueries({ queryKey: ['adminStats'] });
            setVerifyingAuction(null);
            setVerificationNotes('');
            setVerificationStatus('VERIFIED');
            setVerifyingError('');
        },
        onError: (err) => {
            setVerifyingError(err.message || 'Failed to verify auction');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (auctionId) => {
            const res = await api.delete(`/admin/auctions/${auctionId}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminAuctions'] });
            queryClient.invalidateQueries({ queryKey: ['adminStats'] });
            queryClient.invalidateQueries({ queryKey: ['adminDeletedAuctions'] });
            toast.success('Listing placed in retention (will be purged in 7 days).');
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to delete auction');
        }
    });

    // Handlers
    const handleSuspendToggle = (targetUser) => {
        if (targetUser.id === user?.id) {
            toast.warning('Security safeguard: you cannot suspend your own admin account.');
            return;
        }
        const isSuspending = !targetUser.suspended;
        setConfirmation({
            title: `${isSuspending ? 'Suspend' : 'Unsuspend'} Account`,
            message: `Are you sure you want to ${isSuspending ? 'suspend' : 'unsuspend'} ${targetUser.name}?`,
            actionText: isSuspending ? 'Suspend User' : 'Unsuspend User',
            isDestructive: isSuspending,
            onConfirm: () => {
                suspendMutation.mutate({ userId: targetUser.id, suspended: isSuspending });
            }
        });
    };

    const handleDeleteAuction = (auctionId, title) => {
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

    const restoreMutation = useMutation({
        mutationFn: async (auctionId) => {
            const res = await api.post(`/admin/auctions/${auctionId}/restore`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminAuctions'] });
            queryClient.invalidateQueries({ queryKey: ['adminStats'] });
            queryClient.invalidateQueries({ queryKey: ['adminDeletedAuctions'] });
            toast.success('Listing restored successfully.');
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to restore auction');
        }
    });

    const handleRestoreAuction = (auctionId, title) => {
        setConfirmation({
            title: 'Restore Listing',
            message: `Are you sure you want to restore "${title}" to the active catalog?`,
            actionText: 'Restore Listing',
            isDestructive: false,
            onConfirm: () => {
                restoreMutation.mutate(auctionId);
            }
        });
    };

    const submitVerification = (e) => {
        e.preventDefault();
        setVerifyingError('');
        if (!verifyingAuction) return;
        verifyMutation.mutate({
            auctionId: verifyingAuction.id,
            verificationStatus,
            verificationNotes
        });
    };

    useEffect(() => {
        if (!verifyingAuction || !verificationDialogRef.current) return;

        const dialog = verificationDialogRef.current;
        const focusable = Array.from(dialog.querySelectorAll('button, select, textarea, input, [href], [tabindex]:not([tabindex="-1"])'));
        focusable[0]?.focus();

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setVerifyingAuction(null);
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
    }, [verifyingAuction]);

    useEffect(() => {
        if (!confirmation || !confirmationDialogRef.current) return;

        const dialog = confirmationDialogRef.current;
        const focusable = Array.from(dialog.querySelectorAll('button, select, textarea, input, [href], [tabindex]:not([tabindex="-1"])'));
        focusable[0]?.focus();

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

    useEffect(() => {
        if (activeTab === 'verification') {
            setVerificationFilter('PENDING');
            setStatusFilter('');
        } else {
            setVerificationFilter('');
            setStatusFilter('');
        }
        setUserSearch('');
        setUserPage(0);
        setAuctionSearch('');
        setAuctionPage(0);
    }, [activeTab]);

    return (
        <main className="container py-xl">
            {/* Header Title */}
            <div className="section-header-flex">
                <div>
                    <h1 className="headline-lg" style={{ color: 'var(--secondary)' }}>Platform Administration</h1>
                    <p className="body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}>
                        Executive command console. Monitor core KPIs, verify lots, and moderate users.
                    </p>
                </div>
                <div>
                    <span className="badge-live" style={{ background: 'var(--secondary)', color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}>
                        Operator: {user?.name}
                    </span>
                </div>
            </div>

            {/* Split Sidebar Layout */}
            <div className="split-layout">
                {/* Sidebar Navigation */}
                <aside className="sidebar">
                    <h3 className="sidebar-title">Admin Console</h3>
                    <ul className="dashboard-menu">
                        <li>
                            <Link to="/admin?tab=overview" className={activeTab === 'overview' ? 'active' : ''}>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>monitoring</span>
                                System KPIs
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin?tab=verification" className={activeTab === 'verification' ? 'active' : ''}>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>verified_user</span>
                                Verification Queue
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin?tab=users" className={activeTab === 'users' ? 'active' : ''}>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>group</span>
                                User Directory
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin?tab=auctions" className={activeTab === 'auctions' ? 'active' : ''}>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>gavel</span>
                                Auction Audit Log
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin?tab=deleted" className={activeTab === 'deleted' ? 'active' : ''}>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                                Deleted Lots
                            </Link>
                        </li>
                    </ul>
                </aside>

                {/* Main Console Content */}
                <div className="main-content">
                    {/* Tab 1: System Overview */}
                    {activeTab === 'overview' && (
                        <div className="space-y-lg">
                            <h2 className="panel-heading">Platform Financial KPIs</h2>
                            {statsLoading ? (
                                <div className="flex-center" style={{ padding: '40px' }}><Spinner /></div>
                            ) : statsError || !stats ? (
                                <div className="alert alert-error text-center">Failed to retrieve administration metrics.</div>
                            ) : (
                                <div className="stack gap-lg">
                                    <div className="metrics-grid">
                                        <div className="metric-card">
                                            <p className="metric-title">Gross Volume (GMV)</p>
                                            <p className="metric-value font-mono">${stats.gmv.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                        </div>
                                        <div className="metric-card">
                                            <p className="metric-title">Platform Revenue (Est)</p>
                                            <p className="metric-value font-mono" style={{ color: 'var(--success)' }}>
                                                ${stats.platformRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <div className="metric-card">
                                            <p className="metric-title">Registered Accounts</p>
                                            <p className="metric-value">{stats.users}</p>
                                        </div>
                                    </div>
                                    <div className="metrics-grid">
                                        <div className="metric-card">
                                            <p className="metric-title">Total Placed Lots</p>
                                            <p className="metric-value">{stats.auctions?.total}</p>
                                        </div>
                                        <div className="metric-card">
                                            <p className="metric-title">Active / Closed / Settled</p>
                                            <p className="metric-value" style={{ fontSize: '20px', marginTop: '8px' }}>
                                                {stats.auctions?.active} / {stats.auctions?.closed} / {stats.auctions?.settled}
                                            </p>
                                        </div>
                                        <div className="metric-card">
                                            <p className="metric-title">Bidding Activity Ratio</p>
                                            <p className="metric-value font-mono">{stats.bidToListingRatio}x</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 2: Verification Queue */}
                    {activeTab === 'verification' && (
                        <div className="space-y-lg">
                            <h2 className="panel-heading">Expert Verification Queue</h2>
                            <p className="body-sm" style={{ color: 'var(--on-surface-variant)', marginTop: '-8px' }}>
                                Review unverified consignment entries and assign authentication stamps.
                            </p>

                            <div className="table-container table-scroll-container">
                                {auctionsLoading ? (
                                    <div className="flex-center" style={{ padding: 'var(--space-xl)' }}><Spinner /></div>
                                ) : auctionsError ? (
                                    <div className="alert alert-error text-center" style={{ margin: 'var(--space-md)' }}>Failed to retrieve verification lists.</div>
                                ) : (
                                    <table className="dashboard-table" aria-label="Consignments awaiting verification">
                                        <thead>
                                            <tr>
                                                <th>Asset Item</th>
                                                <th>Seller Profile</th>
                                                <th>Category</th>
                                                <th>Start Val Est</th>
                                                <th>State</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {auctionsData.items?.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--on-surface-variant)', padding: '24px' }}>
                                                        No pending assets in verification queue.
                                                    </td>
                                                </tr>
                                            ) : (
                                                auctionsData.items.map(auc => (
                                                    <tr key={auc.id}>
                                                        <td style={{ fontWeight: 600, color: 'var(--secondary)' }}>{auc.title}</td>
                                                        <td>{auc.seller?.name}</td>
                                                        <td>{auc.category}</td>
                                                        <td className="font-mono">${Number(auc.startPrice).toLocaleString('en-US')}</td>
                                                        <td>
                                                            <span className="status-pill status-pill--warning">
                                                                {auc.verificationStatus}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button 
                                                                className="btn btn-primary" 
                                                                style={{ padding: '6px 12px', fontSize: '11px' }}
                                                                onClick={() => { setVerifyingAuction(auc); setVerificationStatus('VERIFIED'); }}
                                                            >
                                                                Stamp
                                                            </button>
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

                    {/* Tab 3: User Directory */}
                    {activeTab === 'users' && (
                        <div className="space-y-lg">
                            <div className="panel-header-flex">
                                <h2 className="panel-heading" style={{ margin: 0 }}>User Directory</h2>
                                <input 
                                    type="text" 
                                    className="form-input"
                                    placeholder="Search users..." 
                                    value={userSearch} 
                                    onChange={(e) => { setUserSearch(e.target.value); setUserPage(0); }}
                                    style={{ width: '250px', backgroundColor: 'var(--surface-container-lowest)', padding: '6px 12px' }}
                                />
                            </div>

                            <div className="table-container table-scroll-container">
                                {usersLoading ? (
                                    <div className="flex-center" style={{ padding: 'var(--space-xl)' }}><Spinner /></div>
                                ) : usersError ? (
                                    <div className="alert alert-error text-center" style={{ margin: 'var(--space-md)' }}>Failed to retrieve user accounts.</div>
                                ) : (
                                    <table className="dashboard-table" aria-label="System user directory">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>System Role</th>
                                                <th>Consigns / Bids</th>
                                                <th>Status</th>
                                                <th>Moderate</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {usersData.items?.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--on-surface-variant)', padding: '24px' }}>
                                                        No user accounts found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                usersData.items.map(u => (
                                                    <tr key={u.id}>
                                                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                                                        <td>{u.email}</td>
                                                        <td>
                                                            <span className={`status-pill ${u.role === 'ADMIN' ? 'status-pill--info' : 'status-pill--neutral'}`}>{u.role}</span>
                                                        </td>
                                                        <td className="font-mono">{u._count?.auctions} / {u._count?.bids}</td>
                                                        <td>
                                                            {u.suspended ? (
                                                                <span className="status-badge outbid">Suspended</span>
                                                            ) : (
                                                                <span className="status-badge winning">Active</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <button 
                                                                onClick={() => handleSuspendToggle(u)}
                                                                disabled={u.id === user?.id}
                                                                className={`btn ${u.suspended ? 'btn-primary' : 'btn-danger'}`}
                                                                style={{ 
                                                                    padding: '4px 8px', 
                                                                    fontSize: '10px',
                                                                    cursor: u.id === user?.id ? 'not-allowed' : 'pointer'
                                                                }}
                                                            >
                                                                {u.suspended ? 'Unsuspend' : 'Suspend'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            {/* Pagination */}
                            <Pagination
                                total={usersData?.total || 0}
                                pageSize={limit}
                                page={userPage}
                                onPage={setUserPage}
                            />
                        </div>
                    )}

                    {/* Tab 4: Auction Audit Log */}
                    {activeTab === 'auctions' && (
                        <div className="space-y-lg">
                            <div className="panel-header-flex">
                                <h2 className="panel-heading" style={{ margin: 0 }}>Auction Audit Log</h2>
                                <div className="row gap-xs">
                                    <select 
                                        className="form-input"
                                        value={statusFilter} 
                                        onChange={(e) => { setStatusFilter(e.target.value); setAuctionPage(0); }}
                                        style={{ width: '130px', padding: '4px 8px', backgroundColor: 'var(--surface-container-lowest)' }}
                                    >
                                        <option value="">Statuses</option>
                                        <option value="PENDING">PENDING</option>
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="CLOSED">CLOSED</option>
                                        <option value="SETTLED">SETTLED</option>
                                    </select>
                                    <input 
                                        type="text" 
                                        className="form-input"
                                        placeholder="Search title..." 
                                        value={auctionSearch} 
                                        onChange={(e) => { setAuctionSearch(e.target.value); setAuctionPage(0); }}
                                        style={{ width: '180px', padding: '4px 8px', backgroundColor: 'var(--surface-container-lowest)' }}
                                    />
                                </div>
                            </div>

                            <div className="table-container table-scroll-container">
                                {auctionsLoading ? (
                                    <div className="flex-center" style={{ padding: 'var(--space-xl)' }}><Spinner /></div>
                                ) : auctionsError ? (
                                    <div className="alert alert-error text-center" style={{ margin: 'var(--space-md)' }}>Failed to retrieve auction logs.</div>
                                ) : (
                                    <table className="dashboard-table" aria-label="Platform auction audit log">
                                        <thead>
                                            <tr>
                                                <th>Asset Lot</th>
                                                <th>Seller Name</th>
                                                <th>Current High</th>
                                                <th>State</th>
                                                <th>Authentication</th>
                                                <th>Moderate</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {auctionsData.items?.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--on-surface-variant)', padding: '24px' }}>
                                                        No auctions found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                auctionsData.items.map(auc => (
                                                    <tr key={auc.id}>
                                                        <td>
                                                            <Link to={`/product/${auc.id}`} style={{ fontWeight: 600, color: 'var(--secondary)' }}>
                                                                {auc.title}
                                                            </Link>
                                                        </td>
                                                        <td>{auc.seller?.name}</td>
                                                        <td className="font-mono">${Number(auc.currentBid).toLocaleString('en-US')} <span style={{ fontSize: '11px', color: 'var(--outline)' }}>({auc._count?.bids})</span></td>
                                                        <td>
                                                            <span className={`status-badge ${auc.status.toLowerCase()}`}>{auc.status}</span>
                                                        </td>
                                                        <td>
                                                            <span className={`status-pill ${auc.verificationStatus === 'VERIFIED' ? 'status-pill--success' : auc.verificationStatus === 'PENDING' ? 'status-pill--warning' : 'status-pill--neutral'}`}>{auc.verificationStatus}</span>
                                                        </td>
                                                        <td>
                                                            <div className="row gap-xs">
                                                                <button 
                                                                    onClick={() => { setVerifyingAuction(auc); setVerificationStatus(auc.verificationStatus); setVerificationNotes(auc.verificationNotes || ''); }}
                                                                    className="btn btn-ghost"
                                                                    style={{ padding: '4px 8px', fontSize: '10px' }}
                                                                >
                                                                    Stamp
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeleteAuction(auc.id, auc.title)}
                                                                    className="btn btn-danger"
                                                                    style={{ padding: '4px 8px', fontSize: '10px' }}
                                                                >
                                                                    Purge
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            {/* Pagination */}
                            <Pagination
                                total={auctionsData?.total || 0}
                                pageSize={limit}
                                page={auctionPage}
                                onPage={setAuctionPage}
                            />
                        </div>
                    )}

                    {/* Tab 5: Deleted Lots */}
                    {activeTab === 'deleted' && (
                        <div className="space-y-lg">
                            <div className="panel-header-flex">
                                <h2 className="panel-heading" style={{ margin: 0 }}>Deleted Lots Retention (7 Days)</h2>
                            </div>
                            <p className="body-sm" style={{ color: 'var(--on-surface-variant)', marginTop: '-8px' }}>
                                Lots here are soft-deleted. After 7 days, they are permanently purged from the database and Cloudinary.
                            </p>

                            <div className="table-container table-scroll-container">
                                {deletedLoading ? (
                                    <div className="flex-center" style={{ padding: 'var(--space-xl)' }}><Spinner /></div>
                                ) : deletedError ? (
                                    <div className="alert alert-error text-center" style={{ margin: 'var(--space-md)' }}>Failed to retrieve deleted listings.</div>
                                ) : (
                                    <table className="dashboard-table" aria-label="Deleted lots catalog">
                                        <thead>
                                            <tr>
                                                <th>Asset Lot</th>
                                                <th>Seller Name</th>
                                                <th>Deleted At</th>
                                                <th>Purge Schedule (Est)</th>
                                                <th>State At Deletion</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {!deletedAuctions || deletedAuctions.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--on-surface-variant)', padding: '24px' }}>
                                                        No deleted auctions currently in retention.
                                                    </td>
                                                </tr>
                                            ) : (
                                                deletedAuctions.map(auc => {
                                                    const deletedDate = new Date(auc.deletedAt);
                                                    const purgeDate = new Date(deletedDate);
                                                    purgeDate.setDate(purgeDate.getDate() + 7);
                                                    return (
                                                        <tr key={auc.id}>
                                                            <td style={{ fontWeight: 600, color: 'var(--secondary)' }}>{auc.title}</td>
                                                            <td>{auc.seller?.name || 'Unknown'}</td>
                                                            <td className="font-mono">{deletedDate.toLocaleDateString()}</td>
                                                            <td className="font-mono" style={{ color: 'var(--primary)' }}>{purgeDate.toLocaleDateString()}</td>
                                                            <td>
                                                                <span className={`status-badge ${auc.status.toLowerCase()}`}>{auc.status}</span>
                                                            </td>
                                                            <td>
                                                                <button 
                                                                    onClick={() => handleRestoreAuction(auc.id, auc.title)}
                                                                    className="btn btn-primary"
                                                                    style={{ padding: '4px 8px', fontSize: '10px' }}
                                                                >
                                                                    Restore
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Verification Stamp Modal Overlay */}
            <div className={`modal-overlay ${verifyingAuction ? 'active' : ''}`} aria-hidden={!verifyingAuction}>
                {verifyingAuction && (
                    <div ref={verificationDialogRef} className="detail-card glass-panel modal-content-container" role="dialog" aria-modal="true" aria-labelledby="verification-dialog-title" style={{
                        width: '100%',
                        maxWidth: '500px',
                        padding: 'var(--space-lg)',
                        backgroundColor: '#ffffff'
                    }}>
                        <h3 id="verification-dialog-title" className="panel-heading" style={{ fontSize: '18px', borderBottom: '1px solid var(--outline-variant)', paddingBottom: 'var(--space-xs)' }}>
                            Verify: {verifyingAuction.title}
                        </h3>
                        <form onSubmit={submitVerification} className="space-y-md" style={{ marginTop: 'var(--space-md)' }}>
                            <div className="form-group">
                                <label htmlFor="verification-status-select">Verification Stamp Action</label>
                                <select 
                                    id="verification-status-select"
                                    className="form-input"
                                    value={verificationStatus} 
                                    onChange={(e) => setVerificationStatus(e.target.value)}
                                >
                                    <option value="VERIFIED">VERIFIED (Approve Registry)</option>
                                    <option value="PENDING">PENDING (Review Queue)</option>
                                    <option value="UNVERIFIED">UNVERIFIED (Decline Consignment)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="verification-notes-textarea">Expert Appraisal notes</label>
                                <textarea 
                                    id="verification-notes-textarea"
                                    rows="4"
                                    className="form-input"
                                    placeholder="Enter physical checks, metal tests, or authenticity details..."
                                    value={verificationNotes}
                                    onChange={(e) => setVerificationNotes(e.target.value)}
                                    style={{ resize: 'vertical' }}
                                ></textarea>
                            </div>

                            {verifyingError && (
                                <div className="alert alert-error">
                                    {verifyingError}
                                </div>
                            )}

                            <div className="row gap-sm" style={{ justifyContent: 'flex-end', paddingTop: 'var(--space-base)' }}>
                                <button 
                                    type="button" 
                                    className="btn btn-ghost" 
                                    onClick={() => setVerifyingAuction(null)}
                                    aria-label="Cancel verification"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={verifyMutation.isPending}
                                    className="btn btn-primary"
                                    aria-label="Submit verification stamp"
                                >
                                    {verifyMutation.isPending ? 'Stamping...' : 'Apply Stamp'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
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
                            <div style={{ display: 'flex', gap: 'var(--space-base)', justifyContent: 'flex-end' }}>
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

export default AdminDashboard;
