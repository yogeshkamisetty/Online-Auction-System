import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import AuctionCard from '../components/AuctionCard';
import Spinner from '../components/Spinner';

const Browse = () => {
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const location = useLocation();

    // Fetch products
    const { data: products = [], isLoading, isError } = useQuery({
        queryKey: ['auctions'],
        queryFn: async () => {
            const res = await api.get('/auctions');
            return res.data;
        }
    });

    // Sync URL queries
    useEffect(() => {
        if (!products.length) {
            setFilteredProducts([]);
            return;
        }
        const params = new URLSearchParams(location.search);
        const categoryParam = params.get('category');
        
        if (categoryParam) {
            const cat = categoryParam.toLowerCase();
            const filtered = products.filter(p => p.category.toLowerCase() === cat);
            setSelectedCategories([cat]);
            setFilteredProducts(filtered);
        } else {
            setFilteredProducts(products);
        }
    }, [products, location.search]);

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

        if (searchQuery.trim()) {
            const queryTokens = searchQuery.toLowerCase().trim().split(/\s+/).filter(t => t);
            if (queryTokens.length > 0) {
                result = result.filter(p => {
                    const text = `${p.title} ${p.description} ${p.category}`.toLowerCase();
                    return queryTokens.every(token => text.includes(token));
                });
            }
        }

        if (selectedCategories.length > 0) {
            result = result.filter(p => selectedCategories.includes(p.category.toLowerCase()));
        }

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
        <main className="container py-xl">
            {/* Header Section */}
            <div className="section-header-flex" style={{ flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 className="headline-lg" style={{ color: 'var(--secondary)' }}>Asset Catalog</h1>
                    <p className="body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}>
                        Browse active, verified assets currently undergoing open ascending price bidding.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '400px' }}>
                    <input 
                        type="text" 
                        placeholder="Search items or categories..." 
                        className="form-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                        style={{ backgroundColor: 'var(--surface-container-lowest)' }}
                    />
                    <button className="btn btn-primary" onClick={applyFilters}>Search</button>
                </div>
            </div>
            
            <div className="split-layout">
                {/* Filters Sidebar */}
                <aside className="sidebar">
                    <h3 className="sidebar-title">Catalog Filters</h3>
                
                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label style={{ marginBottom: '8px' }}>Categories</label>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {categoriesList.map(cat => (
                                <li key={cat} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input 
                                        type="checkbox" 
                                        id={`cat-${cat}`}
                                        value={cat}
                                        checked={selectedCategories.includes(cat.toLowerCase())}
                                        onChange={handleCategoryChange}
                                        style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                                    /> 
                                    <label htmlFor={`cat-${cat}`} className="body-sm" style={{ cursor: 'pointer', textTransform: 'none', color: 'var(--on-surface)', fontWeight: 500 }}>
                                        {cat}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label style={{ marginBottom: '8px' }}>Current Price Range</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input 
                                type="number" 
                                placeholder="Min $" 
                                className="form-input"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                style={{ backgroundColor: 'var(--surface-container-lowest)', padding: '6px 12px' }}
                            /> 
                            <span className="body-sm" style={{ color: 'var(--outline)' }}>-</span> 
                            <input 
                                type="number" 
                                placeholder="Max $" 
                                className="form-input"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                style={{ backgroundColor: 'var(--surface-container-lowest)', padding: '6px 12px' }}
                            />
                        </div>
                    </div>
                    
                    <button className="btn btn-secondary" onClick={applyFilters} style={{ width: '100%' }}>
                        Apply Filters
                    </button>
                </aside>

                {/* Main Content Grid */}
                <div>
                    {isLoading ? (
                        <div className="flex-center" style={{ minHeight: '40vh' }}>
                            <Spinner />
                        </div>
                    ) : isError ? (
                        <div className="alert alert-error text-center">
                            Failed to retrieve auctions. Please verify network connectivity.
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="detail-card text-center" style={{ padding: '60px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--outline)' }}>
                                search_off
                            </span>
                            <p className="body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '16px' }}>
                                No assets matched your current search filters.
                            </p>
                        </div>
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
