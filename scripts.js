let products = [];

// Select Elements (These might be null depending on the page)
const auctionGrid = document.querySelector(".auction-grid");
const itemDetailsLayout = document.querySelector(".item-details-layout");

const path = window.location.pathname;
const isHomePage = path.includes("index.html") || path === "/" || path.endsWith("/");
const isBrowsePage = path.includes("browse.html");

// Get URL Params
const params = new URLSearchParams(window.location.search);
const pid = params.get("pid");

async function fetchProducts() {
    try {
        const res = await fetch('http://localhost:3001/api/auctions');
        if (!res.ok) throw new Error('Failed to fetch auctions');
        products = await res.json();
    } catch (err) {
        console.error('Error fetching auctions:', err);
    }
}

function formatTimeLeft(endTimeStr) {
    const endTime = new Date(endTimeStr).getTime();
    const now = new Date().getTime();
    const timeLeft = endTime - now;
    if (timeLeft <= 0) return "Closed";
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) {
        return `${days}d ${hours}h`;
    }
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

function renderAuctions(productsToRender) {
    if (!auctionGrid) return;
    
    auctionGrid.innerHTML = "";
    
    if (productsToRender.length === 0) {
        auctionGrid.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;'>No auctions found matching your criteria.</p>";
        return;
    }

    productsToRender.forEach(product => {
        const cardHTML = `
            <article class="auction-card">
                <div class="card-image-wrapper">
                    <img src="${product.imageUrl || 'images/camera-1.avif'}" 
                         alt="${product.title}" 
                         class="card-image">

                    <span class="badge category-badge">
                        ${product.category}
                    </span>

                    <span class="badge timer-badge left">
                        Ends in:
                    </span>

                    <span class="badge timer-badge right">
                        ${formatTimeLeft(product.endTime)}
                    </span>
                </div>

                <div class="card-content">
                    <h3 class="card-title">
                        ${product.title}
                    </h3>

                    <p class="card-desc">
                        ${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}
                    </p>

                    <div class="card-footer">
                        <div class="bid-info">
                            <span class="bid-label">CURRENT BID</span>
                            <span class="bid-price">
                                $${Number(product.currentBid).toLocaleString()}
                            </span>
                        </div>

                        <div class="action-info">
                            <span class="bid-count">
                                ${product.bidCount} bids
                            </span>

                            <button 
                                onclick="location.href='product.html?pid=${product.id}'"
                                class="btn btn-light-primary">
                                Bid Now
                            </button>
                        </div>
                    </div>
                </div>
            </article>
        `;
        auctionGrid.innerHTML += cardHTML;
    });
}

async function renderProductDetails(productId) {
    if (!itemDetailsLayout) return;

    try {
        const res = await fetch(`http://localhost:3001/api/auctions/${productId}`);
        if (!res.ok) {
            itemDetailsLayout.innerHTML = "<h2>Product not found</h2>";
            return;
        }
        const product = await res.json();

        const bidsHTML = product.bids.map(bid => `
            <div class="history-item">
                <div class="bidder-info">
                    <div class="avatar">${bid.user.name.charAt(0).toUpperCase()}</div>
                    <div class="bidder-details">
                        <span class="bidder-name">${bid.user.name}</span>
                        <span class="bid-time">${new Date(bid.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="bid-amount">$${Number(bid.amount).toLocaleString()}</div>
            </div>
        `).join('');

        const productHTML = `
            <div class="item-gallery">
                <div class="main-image-container">
                    <img src="${product.imageUrl || 'images/camera-1.avif'}" 
                         alt="${product.title}" 
                         class="main-item-image">
                </div>
                <div class="thumbnail-list">
                    <div class="thumbnail placeholder"></div>
                    <div class="thumbnail placeholder"></div>
                </div>
            </div>

            <div class="item-info-col">
                <div class="detail-card">
                    <div class="detail-header">
                        <h1 class="item-title">${product.title}</h1>
                        <span class="badge-live">${product.status}</span>
                    </div>

                    <p class="item-meta">
                        Seller: <a href="#" class="seller-link">${product.seller?.name || 'ProSeller'}</a> • ${product.category}
                    </p>

                    <p class="item-description">
                        ${product.description}
                    </p>

                    <div class="timer-box">
                        <div class="timer-label">TIME REMAINING</div>
                        <div class="countdown">
                            <div class="time-unit">
                                <span class="time-value" id="days-val">0</span><span class="time-text">DAYS</span>
                            </div>
                            <div class="time-unit">
                                <span class="time-value" id="hours-val">0</span><span class="time-text">HOURS</span>
                            </div>
                            <div class="time-unit">
                                <span class="time-value" id="mins-val">0</span><span class="time-text">MINS</span>
                            </div>
                            <div class="time-unit">
                                <span class="time-value" id="secs-val">0</span><span class="time-text">SECS</span>
                            </div>
                        </div>
                    </div>

                    <div class="price-row">
                        <div class="price-col">
                            <span class="price-label">Current Price</span>
                            <span class="price-current">$${Number(product.currentBid).toLocaleString()}</span>
                        </div>
                        <div class="price-col">
                            <span class="price-label">Starting Price</span>
                            <span class="price-starting">$${Number(product.startPrice).toLocaleString()}</span>
                        </div>
                    </div>

                    <div class="bidding-section">
                        <div class="bid-labels">
                            <label>Place your bid</label>
                            <span class="min-increment">Min Increment: $10</span>
                        </div>

                        <form class="bid-form">
                            <div class="input-wrapper">
                                <span class="currency-symbol">$</span>
                                <input type="number" 
                                       id="bidAmountInput"
                                       value="${Math.floor(Number(product.currentBid)) + 10}">
                            </div>
                            <button type="submit" 
                                    class="btn btn-primary bid-submit-btn">
                                Bid
                            </button>
                        </form>

                        <div class="alert alert-success" style="display:none; margin-top: 15px;">
                            Bid placed successfully!
                        </div>
                        <div class="alert alert-danger" style="display:none; margin-top: 15px; color: #e11d48; font-weight: 600;">
                        </div>
                    </div>
                </div>

                <div class="bid-history">
                    <h3 class="history-title">Bid History</h3>
                    <div class="history-list">
                        ${bidsHTML || '<p style="padding: 1rem; color: var(--text-muted);">No bids yet. Be the first to bid!</p>'}
                    </div>
                </div>
            </div>
        `;

        itemDetailsLayout.innerHTML = productHTML;
        document.title = `${product.title} | Golden Hammer Auctions`;

        const form = document.querySelector(".bid-form");
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            placeBid(product.id);
        });

        // ── Socket.io: join this auction's room for live bid updates ──────────
        if (typeof io !== 'undefined') {
            const socket = io('http://localhost:3001', { transports: ['websocket'] });
            socket.emit('join:auction', product.id);

            socket.on('bid:new', (data) => {
                // Update current price display
                const priceEl = document.querySelector('.price-current');
                if (priceEl) priceEl.textContent = '$' + Number(data.currentBid).toLocaleString();

                // Update bid input minimum
                const bidInput = document.getElementById('bidAmountInput');
                if (bidInput) bidInput.value = Math.floor(Number(data.currentBid)) + 10;

                // Prepend new bid to history list
                const historyList = document.querySelector('.history-list');
                if (historyList) {
                    const newItem = document.createElement('div');
                    newItem.className = 'history-item';
                    newItem.innerHTML = `
                        <div class="bidder-info">
                            <div class="avatar">${data.bidder.charAt(0).toUpperCase()}</div>
                            <div class="bidder-details">
                                <span class="bidder-name">${data.bidder}</span>
                                <span class="bid-time">${new Date(data.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div class="bid-amount">$${Number(data.amount).toLocaleString()}</div>
                    `;
                    historyList.prepend(newItem);
                }
            });

            socket.on('auction:closed', () => {
                // Disable bid form and show closed message
                const bidSection = document.querySelector('.bidding-section');
                if (bidSection) {
                    bidSection.innerHTML = `
                        <div style="padding: 1.5rem; background: #fef2f2; border-radius: 8px;
                                    border: 1px solid #fecaca; text-align: center;">
                            <strong style="color:#b91c1c;">This auction has ended.</strong>
                            <p style="margin:0.5rem 0 0; color:#78716c; font-size:0.9rem;">
                                Check <a href="dashboard.html" style="color:var(--primary);">your dashboard</a>
                                to see if you won.
                            </p>
                        </div>
                    `;
                }
            });
        }

        // Initialize countdown timer
        const targetDate = new Date(product.endTime).getTime();
        const timerInterval = setInterval(() => {
            const now = new Date().getTime();
            const timeleft = targetDate - now;

            if (timeleft < 0) {
                clearInterval(timerInterval);
                document.getElementById('days-val').innerText = "0";
                document.getElementById('hours-val').innerText = "0";
                document.getElementById('mins-val').innerText = "0";
                document.getElementById('secs-val').innerText = "0";
                return;
            }

            const days = Math.floor(timeleft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeleft % (1000 * 60)) / 1000);

            document.getElementById('days-val').innerText = days;
            document.getElementById('hours-val').innerText = hours;
            document.getElementById('mins-val').innerText = minutes;
            document.getElementById('secs-val').innerText = seconds;
        }, 1000);

    } catch (err) {
        console.error(err);
        itemDetailsLayout.innerHTML = "<h2>Failed to load product details</h2>";
    }
}

async function placeBid(auctionId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Please log in to place a bid.");
        window.location.href = "login.html";
        return;
    }

    const input = document.getElementById("bidAmountInput");
    const alertSuccess = document.querySelector(".alert-success");
    const alertDanger = document.querySelector(".alert-danger");

    alertSuccess.style.display = "none";
    alertDanger.style.display = "none";

    const bidAmount = parseFloat(input.value);

    try {
        const res = await fetch('http://localhost:3001/api/bids', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                auctionId: auctionId,
                amount: bidAmount
            })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Failed to place bid');
        }

        alertSuccess.style.display = "block";
        
        // Reload details to update UI values and history
        setTimeout(() => {
            renderProductDetails(auctionId);
        }, 1000);

    } catch (err) {
        alertDanger.textContent = err.message;
        alertDanger.style.display = "block";
    }
}

function applyFilters() {
    let filtered = products;

    if (isHomePage) {
        filtered = filtered.filter(p => p.featured);
    }

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        const queryTokens = searchInput.value.toLowerCase().trim().split(/\s+/).filter(t => t);
        if (queryTokens.length > 0) {
            filtered = filtered.filter(p => {
                const text = (p.title + " " + p.description + " " + p.category).toLowerCase();
                return queryTokens.every(token => text.includes(token));
            });
        }
    }

    const categoryCheckboxes = document.querySelectorAll("#categoryFilters input[type='checkbox']:checked");
    if (categoryCheckboxes && categoryCheckboxes.length > 0) {
        const selectedCategories = Array.from(categoryCheckboxes).map(cb => cb.value.toLowerCase());
        filtered = filtered.filter(p => selectedCategories.includes(p.category.toLowerCase()));
    }

    const minPriceInput = document.getElementById("minPrice");
    const maxPriceInput = document.getElementById("maxPrice");
    if (minPriceInput && maxPriceInput) {
        const minPrice = parseFloat(minPriceInput.value);
        const maxPrice = parseFloat(maxPriceInput.value);
        
        filtered = filtered.filter(p => {
            const priceVal = parseFloat(p.currentBid);
            let meetsMin = true;
            let meetsMax = true;
            
            if (!isNaN(minPrice)) {
                meetsMin = priceVal >= minPrice;
            }
            if (!isNaN(maxPrice)) {
                meetsMax = priceVal <= maxPrice;
            }
            return meetsMin && meetsMax;
        });
    }

    renderAuctions(filtered);
}

function updateHeaderNav() {
    const navRight = document.querySelector('.nav-right');
    if (!navRight) return;

    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
        try {
            const user = JSON.parse(userStr);
            navRight.innerHTML = `
                <span class="user-greeting" style="margin-right: 15px; font-weight: 500; color: var(--text-main, #1f2937);">
                    Hi, ${user.name.split(' ')[0]}
                </span>
                <a href="#" class="btn btn-dark" id="logoutBtn">Log Out</a>
            `;
            document.getElementById('logoutBtn').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'index.html';
            });
        } catch (err) {
            console.error(err);
        }
    } else {
        navRight.innerHTML = `
            <a href="login.html" class="login-link">Log In</a>
            <a href="register.html" class="btn btn-dark">Get Started</a>
        `;
    }
}

async function init() {
    updateHeaderNav();
    await fetchProducts();

    if (itemDetailsLayout && pid) {
        await renderProductDetails(pid);
    }

    if (auctionGrid) {
        let initialProducts = products;
        if (isHomePage) {
            initialProducts = products.filter(p => p.featured);
        }
        renderAuctions(initialProducts);
    }
}

init();