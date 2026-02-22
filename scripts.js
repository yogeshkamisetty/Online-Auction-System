const auctionProducts = document.querySelector(".auction-grid");
const products=[
    {
        pid:101,
        productimg:"/images/Vintagecamera.avif",
        category :"Electronics",
        cardtitle:"Vintage 1970s Film Camera",
        carddesc:"A pristine condition 35mm film camera. Fully functional with original lens cap and leather strap. Perfect for...",
        bidprice:"$150",
        bidcount:"0"

    },
    {
        pid:102,
        productimg:"/images/Modernchair.avif",
        category:"Furniture",
        cardtitle:"Mid-Century Modern Chair",
        carddesc:"Authentic teak wood chair with original upholstery. Minor wear consistent with age. A statement piece for...",
        bidprice:"$420",
        bidcount:"2"
    },
    {
        pid:103,
        productimg:"/images/Antique Gold Watch.webp",
        category:"Accessories",
        cardtitle:"Limited Edition Antique Gold Watch",
        carddesc:"Swiss movement, sapphire crystal. Number 45 of 500. Comes with box and papers.",
        bidprice:"$830",
        bidcount:"1"
    }
    
];

const params = new URLSearchParams(window.location.search);
const pid = params.get("pid");

if (pid) {

const itemDetailsLayout = document.querySelector(".item-details-layout");

const product = products.find(p => p.pid == pid);

const productHTML = `

<div class="item-gallery">
    <div class="main-image-container">
        <img src="${product.productimg}" alt="${product.cardtitle}" class="main-item-image">
    </div>
    <div class="thumbnail-list">
        <img src="${product.productimg}" class="thumbnail active">
        <div class="thumbnail placeholder"></div>
        <div class="thumbnail placeholder"></div>
    </div>
</div>
<div class="item-info-col">
    <div class="detail-card">
        <div class="detail-header">
            <h1 class="item-title">${product.cardtitle}</h1>
            <span class="badge-live">LIVE</span>
        </div>
        <p class="item-meta">
        Seller: <a href="#" class="seller-link">ProSeller</a> • ${product.category}
        </p>
        <p class="item-description">
        ${product.carddesc}
        </p>
        <div class="timer-box">
        <div class="timer-label">TIME REMAINING</div>
                <div class="countdown">
                    <div class="time-unit">
                <span class="time-value">1</span>
                <span class="time-text">DAYS</span>
            </div>
        <div class="time-unit">
        <span class="time-value">23</span>
        <span class="time-text">HOURS</span>
        </div>
        <div class="time-unit">
        <span class="time-value">37</span>
        <span class="time-text">MINS</span>
        </div>
        <div class="time-unit">
        <span class="time-value">29</span>
        <span class="time-text">SECS</span>
        </div>
        </div>
        </div>
        <div class="price-row">
        <div class="price-col">
        <span class="price-label">Current Price</span>
        <span class="price-current">${product.bidprice}</span>
        </div>
        <div class="price-col">
        <span class="price-label">Starting Price</span>
        <span class="price-starting">${product.bidprice}</span>
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
        <input type="number" value="${product.bidprice.replace('$','')}" >
        </div>
        <button type="submit" class="btn btn-primary bid-submit-btn">
        Bid
        </button>
        </form>
        <div class="alert alert-success">
        Bid placed successfully!
        </div>
    </div>
</div>
    <div class="bid-history">
    <h3 class="history-title">Bid History</h3>
    <div class="history-list">
    <div class="history-item">
    <div class="bidder-info">
    <div class="avatar">D</div>
    <div class="bidder-details">
    <span class="bidder-name">DemoBuyer</span>
    <span class="bid-time">${new Date().toLocaleString()}</span>
    </div>
    </div>
    <div class="bid-amount">${product.bidprice}</div>
            </div>
        </div>
    </div>
</div>

`;

itemDetailsLayout.innerHTML = productHTML;

}

products.forEach((product)=>{
    const productCard = `
                <article class="auction-card">
                <div class="card-image-wrapper">
                    <img src="${product.productimg}" alt="${product.cardtitle}" class="card-image">
                    <span class="badge category-badge">${product.category}</span>
                    <span class="badge timer-badge left">Ends in:</span>
                    <span class="badge timer-badge right">1d 23h</span>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${product.cardtitle}</h3>
                    <p class="card-desc">${product.carddesc}</p>
                    
                    <div class="card-footer">
                        <div class="bid-info">
                            <span class="bid-label">CURRENT BID</span>
                            <span class="bid-price">${product.bidprice}</span>
                        </div>
                        <div class="action-info">
                            <span class="bid-count">${product.bidcount} bids</span>
                            <button onclick="location.href='product.html?pid=${product.pid}'" class="btn btn-light-primary">Bid Now</button>
                        </div>
                    </div>
                </div>
            </article>
    `;
    auctionProducts.innerHTML += productCard;
});




