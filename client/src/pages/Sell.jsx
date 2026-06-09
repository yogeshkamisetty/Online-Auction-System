import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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

    useEffect(() => {
        if (!token) {
            alert("You must be logged in to create an auction.");
            navigate('/login');
        }
    }, [token, navigate]);

    const handleSell = async (e) => {
        e.preventDefault();
        
        const endTime = new Date();
        endTime.setDate(endTime.getDate() + parseInt(duration));
        
        try {
            const res = await axios.post('http://localhost:3001/api/auctions', {
                title,
                category,
                condition,
                description,
                startPrice: parseFloat(startPrice),
                endTime,
                imageUrl: '' // To be handled later
            });
            
            alert("Auction launched successfully!");
            navigate(`/product/${res.data.id}`);
        } catch (err) {
            alert(err.response?.data?.error || err.message || 'Failed to create listing');
        }
    };

    if (!token) return null;

    return (
        <main className="container page-spacing">
            <div className="page-header">
                <h1 className="page-title">Create a New Auction Listing</h1>
            </div>
            
            <div className="split-layout">
                <div className="main-content">
                    <div className="sell-card">
                        <form onSubmit={handleSell} className="sell-form">
                            <h3 className="form-section-title">1. Item Details</h3>
                            
                            <div className="form-group">
                                <label>Item Title</label>
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="e.g., Vintage 1970s Film Camera"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group half-width">
                                    <label>Category</label>
                                    <select className="form-select" required value={category} onChange={(e) => setCategory(e.target.value)}>
                                        <option value="">Select a category...</option>
                                        <option value="Ancient">Ancient Artifacts</option>
                                        <option value="Modern">Modern Art</option>
                                        <option value="Luxury">Luxury Watches</option>
                                        <option value="Furniture">Vintage Furniture</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                
                                <div className="form-group half-width">
                                    <label>Condition</label>
                                    <select className="form-select" required value={condition} onChange={(e) => setCondition(e.target.value)}>
                                        <option value="">Select condition...</option>
                                        <option value="Mint">Mint / New</option>
                                        <option value="Excellent">Excellent</option>
                                        <option value="Good">Good (Minor Wear)</option>
                                        <option value="Fair">Fair (Needs Repair)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Detailed Description</label>
                                <textarea 
                                    rows="6" 
                                    className="form-textarea" 
                                    required 
                                    placeholder="Describe the history, flaws, dimensions, and unique features of your item..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                ></textarea>
                            </div>

                            <h3 className="form-section-title" style={{ marginTop: '40px' }}>2. Pricing & Duration</h3>
                            
                            <div className="form-row">
                                <div className="form-group half-width">
                                    <label>Starting Bid Price ($)</label>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        step="1" 
                                        required 
                                        placeholder="0.00"
                                        value={startPrice}
                                        onChange={(e) => setStartPrice(e.target.value)}
                                    />
                                </div>
                                
                                <div className="form-group half-width">
                                    <label>Auction Duration</label>
                                    <select className="form-select" required value={duration} onChange={(e) => setDuration(e.target.value)}>
                                        <option value="3">3 Days</option>
                                        <option value="5">5 Days</option>
                                        <option value="7">7 Days</option>
                                        <option value="10">10 Days</option>
                                    </select>
                                </div>
                            </div>

                            <h3 className="form-section-title" style={{ marginTop: '40px' }}>3. Upload Photos</h3>
                            
                            <div className="form-group">
                                <label>Primary Image (Required)</label>
                                <div className="file-upload-box">
                                    <input type="file" accept="image/*" className="file-input" required />
                                    <div className="file-upload-text">
                                        <span style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}>📸</span>
                                        <strong>Click to browse</strong> or drag and drop an image here.<br/>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>PNG, JPG up to 5MB</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '40px', borderTop: '1px solid var(--border-color)', paddingTop: '30px' }}>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '1.1rem', padding: '15px' }}>Launch Auction</button>
                            </div>
                        </form>
                    </div>
                </div>

                <aside className="sidebar">
                    <h3 className="sidebar-title">Seller Tips</h3>
                    <div className="tip-box">
                        <h4 style={{ color: 'var(--text-main)', marginBottom: '8px' }}>📷 Use High-Quality Photos</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
                            Listings with clear, well-lit photos taken from multiple angles receive up to <strong>40% more bids</strong>. Ensure the background is clean and uncluttered.
                        </p>
                    </div>
                    <div className="tip-box">
                        <h4 style={{ color: 'var(--text-main)', marginBottom: '8px' }}>📝 Be Honest About Flaws</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
                            Building trust is key. Explicitly list any scratches, dents, or missing pieces in the description to avoid buyer disputes later.
                        </p>
                    </div>
                    <div className="tip-box">
                        <h4 style={{ color: 'var(--text-main)', marginBottom: '8px' }}>💰 Set a Realistic Starting Price</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                            Setting your starting bid slightly lower than market value encourages early bidding wars, which drives the final price up.
                        </p>
                    </div>
                </aside>
            </div>
        </main>
    );
};

export default Sell;
