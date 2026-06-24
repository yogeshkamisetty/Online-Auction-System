import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import AuctionCard from '../components/AuctionCard';
import SkeletonCard from '../components/SkeletonCard';

const Browse = () => {
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [filterError, setFilterError] = useState('');

    const location = useLocation();
    const navigate = useNavigate();

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
        const searchParam = params.get('search');
        const minParam = params.get('min');
        const maxParam = params.get('max');
        
        let result = products;
        
        if (categoryParam) {
            const categories = categoryParam.split(',').map(value => value.toLowerCase()).filter(Boolean);
            result = result.filter(p => categories.includes(p.category.toLowerCase()));
            setSelectedCategories(categories);
        } else {
            setSelectedCategories([]);
        }

        if (searchParam) {
            setSearchInput(searchParam);
            const queryTokens = searchParam.toLowerCase().trim().split(/\s+/).filter(t => t);
            if (queryTokens.length > 0) {
                result = result.filter(p => {
                    const text = `${p.title} ${p.description} ${p.category}`.toLowerCase();
                    return queryTokens.every(token => text.includes(token));
                });
            }
        } else {
            setSearchInput('');
        }

        setMinPrice(minParam || '');
        setMaxPrice(maxParam || '');
        const min = minParam === null ? null : Number(minParam);
        const max = maxParam === null ? null : Number(maxParam);
        if (min !== null && Number.isFinite(min) && min >= 0) {
            result = result.filter(p => Number(p.currentBid) >= min);
        }
        if (max !== null && Number.isFinite(max) && max >= 0) {
            result = result.filter(p => Number(p.currentBid) <= max);
        }
        
        setFilteredProducts(result);
    }, [products, location.search]);

    // Debounced URL updates for search input
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const params = new URLSearchParams(location.search);
            const currentSearch = params.get('search') || '';
            const targetSearch = searchInput.trim();
            
            if (targetSearch !== currentSearch) {
                if (targetSearch) {
                    params.set('search', targetSearch);
                } else {
                    params.delete('search');
                }
                navigate({ pathname: '/browse', search: params.toString() ? `?${params}` : '' }, { replace: true });
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchInput, location.search, navigate]);

    const handleCategoryChange = (e) => {
        const value = e.target.value.toLowerCase();
        const nextCategories = e.target.checked
            ? [...selectedCategories, value]
            : selectedCategories.filter(c => c !== value);
        setSelectedCategories(nextCategories);

        // Instantly sync category change to URL
        const params = new URLSearchParams(location.search);
        if (nextCategories.length > 0) {
            params.set('category', nextCategories.join(','));
        } else {
            params.delete('category');
        }
        navigate({ pathname: '/browse', search: params.toString() ? `?${params}` : '' });
    };

    const applyFilters = () => {
        setFilterError('');
        const min = minPrice === '' ? null : Number(minPrice);
        const max = maxPrice === '' ? null : Number(maxPrice);

        if ((min !== null && !Number.isFinite(min)) || (max !== null && !Number.isFinite(max))) {
            setFilterError('Enter valid numeric price values.');
            return;
        }
        if ((min !== null && min < 0) || (max !== null && max < 0)) {
            setFilterError('Price filters cannot be negative.');
            return;
        }
        if (min !== null && max !== null && min > max) {
            setFilterError('Minimum price cannot be greater than maximum price.');
            return;
        }

        const params = new URLSearchParams(location.search);
        if (min !== null) params.set('min', String(min));
        else params.delete('min');
        
        if (max !== null) params.set('max', String(max));
        else params.delete('max');

        navigate({ pathname: '/browse', search: params.toString() ? `?${params}` : '' });
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
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
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
                        Apply Price Range
                    </button>
                    {filterError && (
                        <div className="alert alert-error" style={{ marginTop: 'var(--space-base)' }}>
                            {filterError}
                        </div>
                    )}
                </aside>

                {/* Main Content Grid */}
                <div>
                    {isLoading ? (
                        <div className="auction-grid">
                            {[...Array(6)].map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
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
