import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="container">
                <p>&copy; 2026 Golden Hammer Auctions. All rights reserved.</p>
                <div className="footer-links">
                    <Link to="#">Privacy Policy</Link>
                    <Link to="#">Terms of Service</Link>
                    <Link to="#">Contact Support</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
