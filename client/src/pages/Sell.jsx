import React, { useState, useContext, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../lib/api';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const STEPS = [
    { num: 1, label: 'Item Details', icon: 'inventory_2' },
    { num: 2, label: 'Description & Photo', icon: 'image' },
    { num: 3, label: 'Pricing & Publish', icon: 'gavel' },
];

const CATEGORIES = [
    { value: '', label: 'Select category...' },
    { value: 'Luxury Watches', label: 'Luxury Watches' },
    { value: 'Classic Vehicles', label: 'Classic Vehicles' },
    { value: 'Fine Art', label: 'Fine Art' },
    { value: 'Ancient Antiquities', label: 'Ancient Antiquities' },
    { value: 'Rare Coins', label: 'Rare Coins' },
    { value: 'Jewelry & Gems', label: 'Jewelry & Gems' },
    { value: 'Vintage Furniture', label: 'Vintage Furniture' },
];

const CURATED_IMAGES = [
    { name: 'Tourbillon Grand Complication', category: 'Luxury Watches', url: '/images/luxury-tourbillon-watch.jpg' },
    { name: '1964 Ferrari 250 GT Lusso', category: 'Classic Vehicles', url: '/images/ferrari-250gt-classic.jpg' },
    { name: 'Royal Colombian Emerald Necklace', category: 'Jewelry & Gems', url: '/images/emerald-diamond-necklace.jpg' },
    { name: 'Impressionist Sunset Riviera', category: 'Fine Art', url: '/images/impressionist-coastal-painting.jpg' },
    { name: 'Julius Caesar Gold Aureus 44 BC', category: 'Rare Coins', url: '/images/julius-caesar-gold-aureus.jpg' },
    { name: 'Patek Philippe Celestial', category: 'Luxury Watches', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop' },
    { name: 'Ancient Hellenistic Bronze', category: 'Ancient Antiquities', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1200&auto=format&fit=crop' },
    { name: 'Rosewood Lounge & Ottoman', category: 'Vintage Furniture', url: 'https://images.unsplash.com/photo-1580481077195-c228c407f9ab?q=80&w=1200&auto=format&fit=crop' },
];

const CONDITIONS = [
    { value: '', label: 'Select condition...' },
    { value: 'Mint', label: 'Mint / Flawless' },
    { value: 'Excellent', label: 'Excellent' },
    { value: 'Good', label: 'Good (Minor Wear)' },
    { value: 'Fair', label: 'Fair (Needs Repair)' },
];

const DURATIONS = [
    { value: '3', label: '3 Days (Express)' },
    { value: '5', label: '5 Days' },
    { value: '7', label: '7 Days (Standard)' },
    { value: '10', label: '10 Days (Premium)' },
];

const Sell = () => {
    const { token, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const toast = useToast();

    const [step, setStep] = useState(1);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [condition, setCondition] = useState('');
    const [description, setDescription] = useState('');
    const [startPrice, setStartPrice] = useState('');
    const [duration, setDuration] = useState('7');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');
    const [customUrlInput, setCustomUrlInput] = useState('');
    const [uploading, setUploading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    // Handle file upload preview
    useEffect(() => {
        if (imageFile) {
            const url = URL.createObjectURL(imageFile);
            setImagePreviewUrl(url);
            setCustomUrlInput('');
            return () => URL.revokeObjectURL(url);
        }
    }, [imageFile]);

    const handleSelectCuratedImage = (img) => {
        setImageFile(null);
        setCustomUrlInput(img.url);
        setImagePreviewUrl(img.url);
        if (!category) {
            setCategory(img.category);
        }
        toast.info(`Selected ${img.name} image`);
    };

    const handleCustomUrlChange = (url) => {
        setCustomUrlInput(url);
        setImageFile(null);
        setImagePreviewUrl(url);
    };

    const categoryLabel = useMemo(
        () => CATEGORIES.find((c) => c.value === category)?.label || '',
        [category]
    );

    const conditionLabel = useMemo(
        () => CONDITIONS.find((c) => c.value === condition)?.label || '',
        [condition]
    );

    const durationLabel = useMemo(
        () => DURATIONS.find((d) => d.value === duration)?.label || '',
        [duration]
    );

    const canAdvanceStep1 = title.trim() && category && condition;
    const canAdvanceStep2 = description.trim() && (imagePreviewUrl || imageFile || customUrlInput);

    const goNext = () => {
        setErrorMessage('');
        if (step === 1 && !canAdvanceStep1) {
            setErrorMessage('Please fill in all fields before continuing.');
            return;
        }
        if (step === 2 && !canAdvanceStep2) {
            setErrorMessage('Please provide a description and choose or upload an image before continuing.');
            return;
        }
        if (step < 3) setStep(step + 1);
    };

    const goBack = () => {
        setErrorMessage('');
        if (step > 1) setStep(step - 1);
    };

    const goToStep = (targetStep) => {
        if (targetStep < step) {
            setErrorMessage('');
            setStep(targetStep);
        }
    };

    const fileToDataUri = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });

    const handleSell = async (e) => {
        e.preventDefault();
        setUploading(true);
        setErrorMessage('');

        const endTime = new Date();
        endTime.setDate(endTime.getDate() + parseInt(duration));

        let finalImageUrl = customUrlInput || imagePreviewUrl;

        // If a file was selected, attempt Cloudinary upload or convert to Data URI
        if (imageFile) {
            const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
            const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'golden_hammer_preset';

            if (cloudName && uploadPreset) {
                try {
                    const formData = new FormData();
                    formData.append('file', imageFile);
                    formData.append('upload_preset', uploadPreset);

                    const uploadRes = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, formData);
                    finalImageUrl = uploadRes.data.secure_url;
                } catch {
                    // Fallback to data URI if Cloudinary fails
                    try {
                        finalImageUrl = await fileToDataUri(imageFile);
                    } catch {
                        finalImageUrl = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop';
                    }
                }
            } else {
                try {
                    finalImageUrl = await fileToDataUri(imageFile);
                } catch {
                    finalImageUrl = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop';
                }
            }
        }

        if (!finalImageUrl) {
            finalImageUrl = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop';
        }

        try {
            const res = await api.post('/auctions', {
                title: title.trim(),
                category,
                condition,
                description: description.trim(),
                startPrice: parseFloat(startPrice),
                endTime,
                imageUrl: finalImageUrl
            });

            if (res.data.status === 'ACTIVE') {
                toast.success('Auction published live to catalog!');
                navigate(`/product/${res.data.id}`);
            } else {
                toast.success('Consignment submitted! It is in the curator verification queue.');
                navigate('/dashboard');
            }
        } catch (err) {
            const text = err.response?.data?.error || err.message || 'Failed to create listing';
            setErrorMessage(text);
            toast.error(text);
        } finally {
            setUploading(false);
        }
    };

    if (!token) return null;

    const renderStepIndicator = () => (
        <div className="sell-step-indicator">
            {STEPS.map((s, i) => (
                <React.Fragment key={s.num}>
                    <div
                        className={`sell-step-item ${step === s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}
                        onClick={() => goToStep(s.num)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Step ${s.num}: ${s.label}`}
                    >
                        <div className="sell-step-circle">
                            {step > s.num ? (
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                            ) : (
                                s.num
                            )}
                        </div>
                        <span className="sell-step-label">{s.label}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                        <div className={`sell-step-connector ${step > s.num ? 'completed' : ''}`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    const renderStep1 = () => (
        <div className="sell-step-content" key="step1">
            <h3 className="sell-form-section-title">
                <span className="material-symbols-outlined">inventory_2</span>
                Item Details
            </h3>
            <p className="sell-form-section-desc">
                Tell us about the item you want to sell.
            </p>

            <div className="sell-form-group">
                <label className="sell-form-label">Asset Title</label>
                <input
                    type="text"
                    className="sell-form-input"
                    placeholder="e.g., Patek Philippe Reference 1518"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>

            <div className="sell-form-row">
                <div className="sell-form-group">
                    <label className="sell-form-label">Category</label>
                    <select
                        className="sell-form-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                    >
                        {CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                    </select>
                </div>
                <div className="sell-form-group">
                    <label className="sell-form-label">Condition</label>
                    <select
                        className="sell-form-select"
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                        required
                    >
                        {CONDITIONS.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="sell-step-content" key="step2">
            <h3 className="sell-form-section-title">
                <span className="material-symbols-outlined">image</span>
                Description & Photo
            </h3>
            <p className="sell-form-section-desc">
                Describe your item and upload a clear photo.
            </p>

            <div className="sell-form-group">
                <label className="sell-form-label">Description</label>
                <textarea
                    className="sell-form-textarea"
                    placeholder="Describe the item's condition, dimensions, and any notable features..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </div>

            <div className="sell-form-group">
                <label className="sell-form-label">Asset Image (Select Preset, Upload, or Enter URL)</label>

                {/* Curated Presets Bar */}
                <div style={{ marginBottom: '16px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                        Curated Luxury Vault Presets (One-Click Selection)
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
                        {CURATED_IMAGES.map((img) => (
                            <button
                                key={img.name}
                                type="button"
                                onClick={() => handleSelectCuratedImage(img)}
                                title={img.name}
                                style={{
                                    border: customUrlInput === img.url ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '6px',
                                    overflow: 'hidden',
                                    padding: 0,
                                    background: 'none',
                                    cursor: 'pointer',
                                    aspectRatio: '1',
                                    position: 'relative'
                                }}
                            >
                                <img src={img.url} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Direct Image URL input */}
                <div style={{ marginBottom: '16px' }}>
                    <input
                        type="url"
                        className="sell-form-input"
                        placeholder="Or enter direct image URL (https://...)"
                        value={customUrlInput}
                        onChange={(e) => handleCustomUrlChange(e.target.value)}
                    />
                </div>

                {/* File Upload Dropzone */}
                <div className={`sell-dropzone ${imageFile || imagePreviewUrl ? 'has-image' : ''}`}>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files[0])}
                        className="sell-dropzone-input"
                    />
                    {imagePreviewUrl ? (
                        <>
                            <img
                                src={imagePreviewUrl}
                                alt="Upload preview"
                                className="sell-dropzone-preview"
                            />
                            <div className="sell-dropzone-filename">
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
                                {imageFile ? imageFile.name : 'Asset Image Selected'}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="sell-dropzone-icon">
                                <span className="material-symbols-outlined" style={{ fontSize: 'inherit' }}>cloud_upload</span>
                            </div>
                            <p className="sell-dropzone-text">
                                <strong>Click to browse</strong> or drag file here
                            </p>
                            <p className="sell-dropzone-hint">PNG, JPG up to 5MB</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="sell-step-content" key="step3">
            <h3 className="sell-form-section-title">
                <span className="material-symbols-outlined">gavel</span>
                Pricing & Review
            </h3>
            <p className="sell-form-section-desc">
                Set your starting bid and how long the auction runs. Review before publishing.
            </p>

            <div className="sell-form-row">
                <div className="sell-form-group">
                    <label className="sell-form-label">Starting Bid ($)</label>
                    <input
                        type="number"
                        className="sell-form-input"
                        min="1"
                        step="1"
                        placeholder="e.g. 50000"
                        value={startPrice}
                        onChange={(e) => setStartPrice(e.target.value)}
                        required
                    />
                </div>
                <div className="sell-form-group">
                    <label className="sell-form-label">Bidding Duration</label>
                    <select
                        className="sell-form-select"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        required
                    >
                        {DURATIONS.map((d) => (
                            <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Review summary */}
            <div style={{
                background: 'rgba(212, 175, 55, 0.04)',
                border: '1px solid rgba(212, 175, 55, 0.12)',
                borderRadius: '12px',
                padding: '20px',
                marginTop: '8px',
            }}>
                <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#e6c35c', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
                    Listing Summary
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                    <div>
                        <span style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</span>
                        <p style={{ color: '#f0f1f5', fontWeight: 600, margin: '2px 0 0' }}>{title || '—'}</p>
                    </div>
                    <div>
                        <span style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</span>
                        <p style={{ color: '#f0f1f5', fontWeight: 600, margin: '2px 0 0' }}>{categoryLabel || '—'}</p>
                    </div>
                    <div>
                        <span style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Condition</span>
                        <p style={{ color: '#f0f1f5', fontWeight: 600, margin: '2px 0 0' }}>{conditionLabel || '—'}</p>
                    </div>
                    <div>
                        <span style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Image</span>
                        <p style={{ color: (imagePreviewUrl || customUrlInput || imageFile) ? '#10b981' : '#fca5a5', fontWeight: 600, margin: '2px 0 0' }}>
                            {(imagePreviewUrl || customUrlInput || imageFile) ? '✓ Attached' : '✗ Required'}
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '28px' }}>
                <button
                    type="submit"
                    className="btn-gold-shimmer"
                    disabled={uploading || !startPrice || (!imageFile && !customUrlInput && !imagePreviewUrl)}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>rocket_launch</span>
                    {uploading ? 'Publishing...' : 'Publish Listing'}
                </button>
            </div>
        </div>
    );

    const renderPreviewCard = () => (
        <div className="sell-preview-wrapper">
            <p className="sell-preview-label">Live Auction Preview</p>
            <div className="sell-preview-card">
                <div className="sell-preview-image-wrap">
                    {imagePreviewUrl ? (
                        <img src={imagePreviewUrl} alt="Preview" />
                    ) : (
                        <span className="material-symbols-outlined sell-preview-placeholder-icon">photo_camera</span>
                    )}
                    <span className="sell-preview-live-tag">Preview</span>
                </div>
                <div className="sell-preview-content">
                    {category && <p className="sell-preview-category">{categoryLabel}</p>}
                    <h3 className="sell-preview-title">
                        {title || 'Untitled Asset'}
                    </h3>
                    {condition && (
                        <p className="sell-preview-condition">
                            <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#e6c35c' }}>verified</span>
                            {conditionLabel}
                        </p>
                    )}
                    <div className="sell-preview-footer">
                        <div className="sell-preview-price-col">
                            <span className="sell-preview-price-label">Opening Bid</span>
                            <span className="sell-preview-price-value">
                                {startPrice ? `$${Number(startPrice).toLocaleString()}` : '$—'}
                            </span>
                        </div>
                        <div className="sell-preview-duration">
                            <span className="material-symbols-outlined">schedule</span>
                            {durationLabel}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tips */}
            <div className="sell-preview-tips">
                <p className="sell-preview-tips-title">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>tips_and_updates</span>
                    Seller Tips
                </p>
                <div className="sell-tip-item">
                    <span className="material-symbols-outlined sell-tip-icon">photo_camera</span>
                    <p className="sell-tip-text">
                        <strong>Clear, bright photos</strong> attract more bids and help buyers feel confident.
                    </p>
                </div>
                <div className="sell-tip-item">
                    <span className="material-symbols-outlined sell-tip-icon">history_edu</span>
                    <p className="sell-tip-text">
                        <strong>A detailed description</strong> builds buyer trust and reduces disputes.
                    </p>
                </div>
                <div className="sell-tip-item">
                    <span className="material-symbols-outlined sell-tip-icon">trending_up</span>
                    <p className="sell-tip-text">
                        A <strong>lower starting bid</strong> attracts early bidders and can drive the final price higher.
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <main className="sell-premium-root">
            <div className="container">
                {/* Page Header */}
                <div className="sell-page-header">
                    <div className="sell-page-badge">
                        <span className="badge-dot" />
                        {user?.role === 'ADMIN' ? 'Curator Console (Instant Publish)' : 'List an Item'}
                    </div>
                    <h1 className="sell-page-title">Sell Your Item</h1>
                    <p className="sell-page-subtitle">
                        List your item for auction and reach thousands of buyers worldwide.
                    </p>
                </div>

                {/* Step Indicator */}
                {renderStepIndicator()}

                {/* Wizard Layout */}
                <div className="sell-wizard-layout">
                    {/* Left: Form */}
                    <div>
                        <form onSubmit={handleSell}>
                            <div className="sell-form-panel">
                                {errorMessage && (
                                    <div className="sell-alert-error">
                                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>error</span>
                                        {errorMessage}
                                    </div>
                                )}

                                {step === 1 && renderStep1()}
                                {step === 2 && renderStep2()}
                                {step === 3 && renderStep3()}

                                {/* Navigation (not shown on step 3 since publish button is inline) */}
                                {step < 3 && (
                                    <div className="sell-nav-buttons">
                                        {step > 1 ? (
                                            <button type="button" className="sell-btn-back" onClick={goBack}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
                                                Back
                                            </button>
                                        ) : (
                                            <div />
                                        )}
                                        <button type="button" className="sell-btn-next" onClick={goNext}>
                                            Continue
                                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                                        </button>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="sell-nav-buttons" style={{ justifyContent: 'flex-start' }}>
                                        <button type="button" className="sell-btn-back" onClick={goBack}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
                                            Back
                                        </button>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Right: Live Preview */}
                    {renderPreviewCard()}
                </div>
            </div>
        </main>
    );
};

export default Sell;
