import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Equipment from './pages/Equipment';
import Clinic from './pages/Clinic';
import About from './pages/About';
import { CartProvider } from './contexts/CartContext';
import { UserProvider } from './contexts/UserContext';
import ProductDetail from './pages/ProductDetail';
import Catalog from './pages/Catalog';
import CartIcon from './components/ui/CartIcon';
import Checkout from './pages/Checkout';  // ← Añade este import arriba
import PaymentFailed from './pages/PaymentFailed';
import PaymentSuccess from './pages/PaymentSuccess';
import UserProfile from './pages/UserProfile';
import DashboardAdmin from './pages/DashboardAdmin';
import OrderHistory from './pages/OrderHistory';  
import ExchangeHistory from './pages/ExchangeHistory';  
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    // ENVOLVEMOS TODO CON LOS PROVIDERS
    <CartProvider>
      <UserProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/" element={<Home />} />
                <Route path="/equipamiento" element={<Equipment />} />
                <Route path="/clinica" element={<Clinic />} />
                <Route path="/laboratorio" element={<Equipment />} />
                <Route path="/nosotros" element={<About />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-failed" element={<PaymentFailed />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/admin" element={<DashboardAdmin />} />
                <Route path="/order-history" element={<OrderHistory />} />
                <Route path="/exchange-history" element={<ExchangeHistory />} />
                <Route path="*" element={<Home />} />

              </Routes>
            </main>
            <Footer />
           <CartIcon /> 
          </div>
        </Router>
      </UserProvider>
    </CartProvider>
  );
};

export default App;