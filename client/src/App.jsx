import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Browse from './pages/Browse';
import ProductDetails from './pages/ProductDetails';
import Dashboard from './pages/Dashboard';
import Sell from './pages/Sell';
import AdminDashboard from './pages/AdminDashboard';
import Watchlist from './pages/Watchlist';
import Checkout from './pages/Checkout';
import NotFound from './pages/NotFound';

// Route Guards
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sell" element={<Sell />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/checkout/:id" element={<Checkout />} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
