import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Spinner from './components/Spinner';

// Route Guards
import AdminRoute from './components/AdminRoute';

// Eager — needed for first paint
import Home from './pages/Home';
import Login from './pages/Login';

// Lazy — code-split so the initial bundle stays small
const Register = lazy(() => import('./pages/Register'));
const Browse = lazy(() => import('./pages/Browse'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Sell = lazy(() => import('./pages/Sell'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Watchlist = lazy(() => import('./pages/Watchlist'));
const Checkout = lazy(() => import('./pages/Checkout'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="flex-center" style={{ minHeight: '60vh' }}><Spinner /></div>}>
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
      </Suspense>
      <Footer />
    </>
  );
}

export default App;
