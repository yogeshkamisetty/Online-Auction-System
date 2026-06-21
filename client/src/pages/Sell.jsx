import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../lib/api';
import { AuthContext } from '../context/AuthContext';

const Sell = () => {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [condition, setCondition] = useState('');
    const [description, setDescription] = useState('');
    const [startPrice, setStartPrice] = useState('');
    const [duration, setDuration] = useState('7');
    const [imageFile, setImageFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    const handleSell = async (e) => {
        e.preventDefault();
        setUploading(true);
        setErrorMessage('');
        
        const endTime = new Date();
        endTime.setDate(endTime.getDate() + parseInt(duration));
        
        let imageUrl = '';
        if (imageFile) {
            const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
            const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'golden_hammer_preset';
            
            if (cloudName) {
                try {
                    const formData = new FormData();
                    formData.append('file', imageFile);
                    formData.append('upload_preset', uploadPreset);
                    
                    const uploadRes = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, formData);
                    imageUrl = uploadRes.data.secure_url;
                } catch (uploadErr) {
                    console.error('[cloudinary-upload-error] falling back to mock image:', uploadErr.message);
                }
            }
            
            if (!imageUrl) {
                const catLower = category.toLowerCase();
                if (catLower.includes('ancient')) {
                    imageUrl = 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=800&q=80';
                } else if (catLower.includes('modern')) {
                    imageUrl = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=800&q=80';
                } else if (catLower.includes('luxury') || catLower.includes('accessories')) {
                    imageUrl = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
                } else if (catLower.includes('furniture')) {
                    imageUrl = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80';
                } else {
                    imageUrl = 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80';
                }
            }
        }
        
        try {
            const res = await api.post('/auctions', {
                title,
                category,
                condition,
                description,
                startPrice: parseFloat(startPrice),
                endTime,
                imageUrl
            });
            navigate(`/product/${res.data.id}`);
        } catch (err) {
            setErrorMessage(err.response?.data?.error || err.message || 'Failed to create listing');
        } finally {
            setUploading(false);
        }
    };

    if (!token) return null;

    return (
        <main className="container py-xl">
            {/* Page Header */}
            <div className="section-header-flex">
                <div>
                    <h1 className="headline-lg" style={{ color: 'var(--secondary)' }}>Consignment Registry</h1>
                    <p className="body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}>
                        Register new high-stakes collections or luxury assets for public auction.
                    </p>
                </div>
            </div>
            
            <div className="split-layout">
                {/* Form area */}
                <div>
                    <form onSubmit={handleSell} className="detail-card space-y-lg">
                        <h3 className="panel-heading" style={{ borderBottom: '1px solid var(--outline-variant)', paddingBottom: '8px', fontSize: '18px' }}>
                            1. Asset Specifications
                        </h3>
                        
                        <div className="form-group">
                            <label>Asset Title</label>
                            <input 
                                type="text" 
                                className="form-input"
                                required 
                                placeholder="e.g., Patek Philippe Reference 1518"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                                <label>Category</label>
                                <select 
                                    className="form-input" 
                                    required 
                                    value={category} 
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="">Select category...</option>
                                    <option value="Ancient">Ancient Antiquities</option>
                                    <option value="Modern">Modern Expression</option>
                                    <option value="Luxury">Luxury Assets</option>
                                    <option value="Furniture">Vintage Furniture</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Condition</label>
                                <select 
                                    className="form-input" 
                                    required 
                                    value={condition} 
                                    onChange={(e) => setCondition(e.target.value)}
                                >
                                    <option value="">Select state...</option>
                                    <option value="Mint">Mint / Flawless</option>
                                    <option value="Excellent">Excellent</option>
                                    <option value="Good">Good (Minor Wear)</option>
                                    <option value="Fair">Fair (Needs Repair)</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Provenance & Description</label>
                            <textarea 
                                rows="5" 
                                className="form-input"
                                required 
                                placeholder="Describe the history, hallmarks, dimensions, and visual condition..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                style={{ resize: 'vertical' }}
                            ></textarea>
                        </div>

                        <h3 className="panel-heading" style={{ borderBottom: '1px solid var(--outline-variant)', paddingBottom: '8px', fontSize: '18px', marginTop: '32px' }}>
                            2. Financial Valuation
                        </h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                                <label>Opening Estimated Bid ($)</label>
                                <input 
                                    type="number" 
                                    className="form-input"
                                    min="1" 
                                    step="1" 
                                    required 
                                    placeholder="e.g. 50000"
                                    value={startPrice}
                                    onChange={(e) => setStartPrice(e.target.value)}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Bidding Run Duration</label>
                                <select 
                                    className="form-input" 
                                    required 
                                    value={duration} 
                                    onChange={(e) => setDuration(e.target.value)}
                                >
                                    <option value="3">3 Days (Express)</option>
                                    <option value="5">5 Days</option>
                                    <option value="7">7 Days (Standard)</option>
                                    <option value="10">10 Days (Premium)</option>
                                </select>
                            </div>
                        </div>

                        <h3 className="panel-heading" style={{ borderBottom: '1px solid var(--outline-variant)', paddingBottom: '8px', fontSize: '18px', marginTop: '32px' }}>
                            3. Image Registry
                        </h3>

                        <div className="form-group">
                            <label>Asset Portrait (Required)</label>
                            <div style={{ 
                                border: '2px dashed var(--outline-variant)', 
                                borderRadius: '8px', 
                                padding: '32px', 
                                textAlign: 'center',
                                backgroundColor: 'var(--surface-container-low)',
                                cursor: 'pointer',
                                position: 'relative'
                            }}>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    required 
                                    onChange={(e) => setImageFile(e.target.files[0])}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        width: '100%',
                                        height: '100%',
                                        opacity: 0,
                                        cursor: 'pointer'
                                    }}
                                />
                                <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--outline)', marginBottom: '8px' }}>
                                    upload_file
                                </span>
                                {imageFile ? (
                                    <p className="body-md" style={{ fontWeight: 600, color: 'var(--primary)' }}>
                                        ✓ Selected: {imageFile.name}
                                    </p>
                                ) : (
                                    <div className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                                        <strong>Click to browse</strong> or drag file here.<br/>
                                        <span style={{ fontSize: '12px', color: 'var(--outline)' }}>PNG, JPG up to 5MB</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {errorMessage && (
                            <div className="alert alert-error">
                                {errorMessage}
                            </div>
                        )}

                        <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid var(--outline-variant)' }}>
                            <button 
                                type="submit" 
                                className="btn btn-primary" 
                                style={{ width: '100%', padding: '14px', fontSize: '14px' }} 
                                disabled={uploading}
                            >
                                {uploading ? 'Registering Consignment...' : 'Publish Auction Listing'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Sidebar Tips */}
                <aside className="sidebar">
                    <h3 className="sidebar-title">Consignor Guidelines</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <h4 className="body-md" style={{ fontWeight: 600, color: 'var(--secondary)', marginBottom: '4px' }}>📷 High Resolution Portrayal</h4>
                            <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                                Assets photographed in clean, neutral studio lighting experience significantly higher bid increments and clearance rate.
                            </p>
                        </div>
                        <div>
                            <h4 className="body-md" style={{ fontWeight: 600, color: 'var(--secondary)', marginBottom: '4px' }}>✍ Full Provenance Disclosure</h4>
                            <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                                Document all prior ownership details and physical flaws. Full disclosure builds collector trust and avoids disputes.
                            </p>
                        </div>
                        <div>
                            <h4 className="body-md" style={{ fontWeight: 600, color: 'var(--secondary)', marginBottom: '4px' }}>💰 Opening Reserve Strategy</h4>
                            <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                                A conservative opening estimate acts as a low barrier to entry, sparking early bidding actions that drive higher endings.
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
};

export default Sell;
