const products = [
    {
        pid: 101,
        featured: true,
        productimg: {
            src: "images/Vintagecamera.avif",
        },
        category: "Electronics",
        cardtitle: "Vintage 1970s Film Camera",
        carddesc: "A pristine condition 35mm film camera. Fully functional with original lens cap and leather strap. Perfect for...",
        bidprice: "$150",
        bidcount: 0
    },
    {
        pid: 102,
        featured: false,
        productimg: {
            src: "images/Modernchair1.jpg",
        },
        category: "Furniture",
        cardtitle: "Mid-Century Modern Chair",
        carddesc: "Authentic teak wood chair with original upholstery. Minor wear consistent with age. A statement piece for...",
        bidprice: "$420",
        bidcount: 2
    },
    {
        pid: 103,
        featured: false,
        productimg: {
            src: "images/Antique Gold Watch.webp",
        },
        category: "Accessories",
        cardtitle: "Limited Edition Antique Gold Watch",
        carddesc: "Swiss movement, sapphire crystal. Number 45 of 500. Comes with box and papers.",
        bidprice: "$830",
        bidcount: 1
    },
    {
        pid: 104,
        featured: true,
        productimg: {
            src: "images/1965-ford-mustang-gt-fastback.jpeg",
            src1: "images/Ford-Mustang-Fastback-Grey-Red-1.jpg",
        },
        category: "Vehicles",
        cardtitle: "Classic 1965 Mustang Fastback",
        carddesc: "Restored to original specs. V8 engine, manual transmission. Runs perfectly and looks stunning.",
        bidprice: "$25,000",
        bidcount: 3
    },
    {
        pid: 105,
        featured: true,
        productimg: {
            src: "images/ancientproduct.jpg",
        },
        category: "Collections",
        cardtitle: "Dancing Shiva and Parvati statue",
        carddesc: "A statue of Dancing Shiva and Parvati represents the harmonious union of the divine masculine and feminine energies that govern the universe. While Lord Shiva is most famous for his solo cosmic dance as Nataraja, his joint dance with Goddess Parvati symbolizes the perfect balance of creation, preservation, and destruction.",
        bidprice: "$2,500",
        bidcount: 3
    },
    {
        pid: 106,
        featured: false,
        productimg: {
            src: "images/ancientproduct1.jpg",
        },
        category: "Collections",
        cardtitle: "Goddess Durga statue standing on a lion",
        carddesc: "A statue of Goddess Durga standing on a lion is a powerful representation of Shakti (divine feminine energy) and the triumph of righteousness (Dharma) over evil. While she is frequently shown seated (Simhavahini), standing poses typically emphasize her active warrior role as Mahishasuramardini, the slayer of the buffalo demon Mahishasura.",
        bidprice: "$1,200",
        bidcount: 1
    },
    {
        pid: 107,
        featured: false,
        productimg: {
            src: "images/EgyptianAntiquities1.jpg",
        },
        category: "Collections",
        cardtitle: "Ancient Egyptian Canopic Jars",
        carddesc: "Ancient Egyptian canopic jars were specialized funerary vessels used to store and protect the internal organs of the deceased for the afterlife. These jars were an integral part of the mummification process from the Old Kingdom (c. 2575 BCE) until the Ptolemaic Period (30 BCE). ",
        bidprice: "$3,000",
        bidcount: 6
    },
    {
        pid: 108,
        featured: false,
        productimg: {
            src: "images/EgyptianAntiquities2.jpg",
        },
        category: "Collections",
        cardtitle: "Egyptian-inspired porcelain or ceramic vases",
        carddesc: "The listing describes the item as a collection of rare artifacts from the 18th Dynasty, though it mentions other items not pictured in the main frame, such as a golden mask and a ceremonial staff.",
        bidprice: "$1,200",
        bidcount: 2
    }
];

// Select Elements (These might be null depending on the page)
const auctionGrid = document.querySelector(".auction-grid");
const itemDetailsLayout = document.querySelector(".item-details-layout");

const path = window.location.pathname;
const isHomePage = path.includes("index.html") || path === "/" || path.endsWith("/");
const isBrowsePage = path.includes("browse.html");

// Get URL Params
const params = new URLSearchParams(window.location.search);
const pid = params.get("pid");


if (itemDetailsLayout && pid) {

    const product = products.find(p => p.pid == pid);

    if (!product) {
        itemDetailsLayout.innerHTML = "<h2>Product not found</h2>";
    } else {

        const productHTML = `
            <div class="item-gallery">
                <div class="main-image-container">
                    <img src="${product.productimg.src}" 
                         alt="${product.cardtitle}" 
                         class="main-item-image">
                </div>
                <div class="thumbnail-list">
                    ${product.productimg.src1 
                        ? `<img src="${product.productimg.src1}" class="thumbnail active">`
                        : ""
                    }
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
                                <span class="time-value">1</span><span class="time-text">DAYS</span>
                            </div>
                            <div class="time-unit">
                                <span class="time-value">23</span><span class="time-text">HOURS</span>
                            </div>
                            <div class="time-unit">
                                <span class="time-value">37</span><span class="time-text">MINS</span>
                            </div>
                            <div class="time-unit">
                                <span class="time-value">29</span><span class="time-text">SECS</span>
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
                                <input type="number" 
                                       value="${product.bidprice.replace(/[$,]/g,'')}">
                            </div>
                            <button type="submit" 
                                    class="btn btn-primary bid-submit-btn">
                                Bid
                            </button>
                        </form>

                        <div class="alert alert-success" style="display:none;">
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
                                    <span class="bid-time">${new Date().toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div class="bid-amount">${product.bidprice}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        itemDetailsLayout.innerHTML = productHTML;

        //  Update browser tab title dynamically
        document.title = `${product.cardtitle} | Golden Hammer Auctions`;

        // Prevent page reload + attach bid logic
        const form = document.querySelector(".bid-form");

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            placeBid(product.pid);
        });
    }
}

// ============================================
// LOGIC B: LISTING PAGE (HOME/BROWSE)
// ============================================
if (auctionGrid) {

    let filteredProducts = products;

    // Only show featured on home
    if (isHomePage) {
        filteredProducts = products.filter(p => p.featured);
    }

    auctionGrid.innerHTML = "";

    filteredProducts.forEach(product => {

        const cardHTML = `
            <article class="auction-card">
                <div class="card-image-wrapper">
                    <img src="${product.productimg.src}" 
                         alt="${product.cardtitle}" 
                         class="card-image">

                    <span class="badge category-badge">
                        ${product.category}
                    </span>

                    <span class="badge timer-badge left">
                        Ends in:
                    </span>

                    <span class="badge timer-badge right">
                        1d 23h
                    </span>
                </div>

                <div class="card-content">
                    <h3 class="card-title">
                        ${product.cardtitle}
                    </h3>

                    <p class="card-desc">
                        ${product.carddesc}
                    </p>

                    <div class="card-footer">
                        <div class="bid-info">
                            <span class="bid-label">CURRENT BID</span>
                            <span class="bid-price">
                                ${product.bidprice}
                            </span>
                        </div>

                        <div class="action-info">
                            <span class="bid-count">
                                ${product.bidcount} bids
                            </span>

                            <button 
                                onclick="location.href='product.html?pid=${product.pid}'"
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

function placeBid(pid) {

    const product = products.find(p => p.pid == pid);
    const input = document.querySelector(".bid-form input");
    const alertBox = document.querySelector(".alert-success");
    const historyList = document.querySelector(".history-list");

    const newBid = parseFloat(input.value);
    const currentPrice = parseFloat(product.bidprice.replace(/[$,]/g, ""));

    if (isNaN(newBid) || newBid <= currentPrice) {
        alert("Bid must be higher than current price.");
        return;
    }

    // Update product data
    product.bidprice = "$" + newBid.toLocaleString();
    product.bidcount = parseInt(product.bidcount) + 1;

    // Update price in UI
    document.querySelector(".price-current").textContent = product.bidprice;

    // Add new bid to history (top entry)
    const newHistoryItem = `
        <div class="history-item">
            <div class="bidder-info">
                <div class="avatar">Y</div>
                <div class="bidder-details">
                    <span class="bidder-name">You</span>
                    <span class="bid-time">${new Date().toLocaleDateString()}</span>
                </div>
            </div>
            <div class="bid-amount">${product.bidprice}</div>
        </div>
    `;

    historyList.innerHTML = newHistoryItem + historyList.innerHTML;

    // Show success message
    alertBox.style.display = "block";

    // Reset input to new price
    input.value = newBid;
}