import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import AuctionCard from '../components/AuctionCard';

const Browse = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const location = useLocation();

    // Fetch products
    useEffect(() => {
        const fetchAuctions = async () => {
            try {
                const res = await axios.get('http://localhost:3001/api/auctions');
                setProducts(res.data);
                
                // Check if category is passed via URL
                const params = new URLSearchParams(location.search);
                const categoryParam = params.get('category');
                
                if (categoryParam) {
                    // Match category case-insensitively
                    const cat = categoryParam.toLowerCase();
                    const filtered = res.data.filter(p => p.category.toLowerCase() === cat);
                    setSelectedCategories([cat]);
                    setFilteredProducts(filtered);
                } else {
                    setFilteredProducts(res.data);
                }
            } catch (err) {
                console.error("Error fetching auctions:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAuctions();
    }, [location.search]);

    const handleCategoryChange = (e) => {
        const value = e.target.value.toLowerCase();
        if (e.target.checked) {
            setSelectedCategories([...selectedCategories, value]);
        } else {
            setSelectedCategories(selectedCategories.filter(c => c !== value));
        }
    };

    const applyFilters = () => {
        let result = products;

        // Search Query
        if (searchQuery.trim()) {
            const queryTokens = searchQuery.toLowerCase().trim().split(/\s+/).filter(t => t);
            if (queryTokens.length > 0) {
                result = result.filter(p => {
                    const text = `${p.title} ${p.description} ${p.category}`.toLowerCase();
                    return queryTokens.every(token => text.includes(token));
                });
            }
        }

        // Categories
        if (selectedCategories.length > 0) {
            result = result.filter(p => selectedCategories.includes(p.category.toLowerCase()));
        }

        // Price
        if (minPrice !== '') {
            result = result.filter(p => parseFloat(p.currentBid) >= parseFloat(minPrice));
        }
        if (maxPrice !== '') {
            result = result.filter(p => parseFloat(p.currentBid) <= parseFloat(maxPrice));
        }

        setFilteredProducts(result);
    };

    const categoriesList = ['Collections', 'Electronics', 'Furniture', 'Accessories', 'Vehicles', 'Ancient', 'Modern', 'Luxury'];

    return (
        <main className="container page-spacing">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                <h1 className="page-title" style={{ margin: 0 }}>Browse All Categories</h1>
                <div className="search-container" style={{ display: 'flex', gap: '8px', flex: '0 1 400px', width: '100%' }}>
                    <input 
                        type="text" 
                        placeholder="Search items, categories..." 
                        style={{ flex: 1, padding: '0.75rem 1rem', border: '1px solid var(--border-color, #e5e7eb)', borderRadius: '6px', fontFamily: 'inherit', fontSize: '0.95rem' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                    />
                    <button className="btn btn-primary" onClick={applyFilters} style={{ padding: '0.75rem 1.5rem' }}>Search</button>
                </div>
            </div>
            
            <div className="split-layout">
                <aside className="sidebar">
                    <h3 className="sidebar-title">Filters</h3>
                
                    <div className="filter-group">
                        <h4>Categories</h4>
                        <ul className="filter-list">
                            {categoriesList.map(cat => (
                                <li key={cat}>
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            value={cat}
                                            checked={selectedCategories.includes(cat.toLowerCase())}
                                            onChange={handleCategoryChange}
                                        /> {cat}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="filter-group">
                        <h4>Price Range</h4>
                        <div className="price-inputs">
                            <input 
                                type="number" 
                                placeholder="Min $" 
                                className="price-input"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                            /> 
                            <span>-</span> 
                            <input 
                                type="number" 
                                placeholder="Max $" 
                                className="price-input"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <button className="btn btn-primary filter-btn" onClick={applyFilters}>Apply Filters</button>
                </aside>

                <div className="main-content">
                    {loading ? (
                        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading auctions...</p>
                    ) : filteredProducts.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No auctions found matching your criteria.</p>
                    ) : (
                        <div className="auction-grid">
                            {filteredProducts.map(product => (
                                <AuctionCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default Browse;
