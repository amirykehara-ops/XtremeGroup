import React, { useState, useEffect } from 'react';
import { NavLink as Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, User, LogOut, LayoutDashboard, Star, Flame, AlertCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../contexts/UserContext';
import { useCart } from '../../contexts/CartContext';
import AuthModal from '../ui/AuthModal';
import { NAV_LINKS } from '../../constants';
import Button from '../ui/Button';
import { getUserBenefits, getSubscriptionColor } from '../../constants';


const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const location = useLocation();
  const { user, logout, login} = useUser();
  const [hasActiveOffer, setHasActiveOffer] = useState(false);
  const { cartCount } = useCart();
  const badgeColor = getSubscriptionColor(user?.subscription);
  const [timeLeft, setTimeLeft] = useState("");
  // Función para obtener nivel, icono y color según puntos

const benefits = getUserBenefits(user?.subscription);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  // Dentro de tu componente Navbar
useEffect(() => {
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 20);
  };
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
useEffect(() => {
  if (!hasActiveOffer) return;

  const updateTimer = () => {
    const lastPurchase = localStorage.getItem('last_purchase_time');
    if (lastPurchase) {
      const expiry = parseInt(lastPurchase) + (12 * 60 * 60 * 1000);
      const now = new Date().getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setHasActiveOffer(false);
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${h}h ${m}m`);
      }
    }
  };

  updateTimer();
  const timer = setInterval(updateTimer, 60000); // Actualiza cada minuto
  return () => clearInterval(timer);
}, [hasActiveOffer]);

  useEffect(() => {
  const openLogin = () => setShowLogin(true);
  const openRegister = () => setShowRegister(true);

  window.addEventListener('openLoginModal', openLogin);
  window.addEventListener('openRegisterModal', openRegister);

  return () => {
    window.removeEventListener('openLoginModal', openLogin);
    window.removeEventListener('openRegisterModal', openRegister);
  };
}, []);
useEffect(() => {
  const checkOffer = () => {
    const lastPurchase = localStorage.getItem('last_purchase_time');
    const lastUser = localStorage.getItem('last_purchase_user');
    if (lastPurchase && user && lastUser === user.email) {
      const expiry = parseInt(lastPurchase) + (12 * 60 * 60 * 1000);
      const now = new Date().getTime();
      setHasActiveOffer(now < expiry);
    } else {
      setHasActiveOffer(false);
    }
  };

  checkOffer();
  const interval = setInterval(checkOffer, 10000); // Revisa cada 10 seg
  return () => clearInterval(interval);
}, [location.pathname]);
  return (
    <>
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/90 backdrop-blur-xl shadow-lg py-3' 
            : 'bg-white/50 backdrop-blur-sm py-5'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="images/logo.jpg" 
              alt="Xtreme Group" 
              className="h-10 w-auto rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300"
            />
            <span className="text-xl font-bold text-dark tracking-tight">Xtreme Group</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-white/50 px-2 py-1 rounded-full border border-white/40 shadow-sm backdrop-blur-md">
            {NAV_LINKS.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className={`relative px-5 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                  location.pathname === link.path 
                    ? 'text-accent' 
                    : 'text-muted hover:text-accent hover:bg-blue-50/50'
                }`}
              >
                {location.pathname === link.path && (
                  <motion.div 
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-blue-50 rounded-full -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {link.label}
              </Link>
            ))}
          </nav>

            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
<div className="flex items-center gap-3">
                {/* ICONO DE LLAMA PREMIUM */}
{/* ICONO DE ALERTA DE CANJE CON TOOLTIP */}
{hasActiveOffer && (
  <div className="relative group px-2">
    <Link to="/canje-especial">
      <motion.div 
        animate={{ 
          scale: [1, 1.15, 1],
        }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="bg-red-100 text-red-600 p-2 rounded-xl cursor-pointer flex items-center justify-center shadow-sm border border-red-200 hover:bg-red-600 hover:text-white transition-colors duration-300"
      >
        <AlertCircle size={20} className="animate-pulse" />
      </motion.div>
    </Link>

    {/* TOOLTIP PROFESIONAL */}
    <div className="absolute top-full mt-3 right-0 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-[100]">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 relative">
        {/* Triangulito del tooltip */}
        <div className="absolute -top-1.5 right-4 w-3 h-3 bg-white border-t border-l border-slate-100 rotate-45"></div>
        
        <div className="flex items-start gap-3">
          <div className="bg-red-500 p-2 rounded-lg text-white">
            <Clock size={16} />
          </div>
          <div>
            <p className="text-xs font-black text-dark uppercase tracking-wider">¡Acceso Especial!</p>
            <p className="text-[11px] text-muted leading-relaxed mt-1">
              Tienes <span className="font-bold text-red-600">{timeLeft}</span> para añadir canjes a tu envío <span className="font-bold underline">GRATIS</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

  {user.email === 'admin' && (
        <Link 
          to="/admin" 
          className="flex items-center gap-2 bg-dark text-white px-2 py-1.5 rounded-xl text-xs font-bold hover:bg-accent transition-all duration-300 shadow-lg mr-2 whitespace-nowrap"
        >
          <LayoutDashboard size={16} />
          Panel Admin
        </Link>
      )}
                  <Link to="/profile" className="flex items-center gap-4  hover:scale-105 transition-all duration-300 cursor-pointer">
<div className={`flex items-center gap-1.5 ${badgeColor} text-white px-2 py-1.5 rounded-full text-xs font-bold shadow-md whitespace-nowrap`}>
  <Star size={16} />
  <span>{benefits.badge}</span>
</div>
</Link>
  {/* Puntos con shimmer (mantengo tu animación épica) */}
  <div className="relative flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-2 py-1.5 rounded-full text-xs font-bold shadow-md overflow-hidden whitespace-nowrap">
    <User size={18} />
    <motion.span
      key={user.points}
      initial={{ y: 20, opacity: 0, scale: 1.5 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className="inline-block"
    >
      {user.points} pts
    </motion.span>

    <motion.div
      key={`shimmer-${user.points}`}
      initial={{ x: '-100%' }}
      animate={{ x: '100%' }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
    />
  </div>
</div>
                  <button onClick={logout} className="text-sm text-muted hover:text-red-500 flex items-center gap-1">
                    <LogOut size={16} /> Cerrar
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setShowLogin(true)} 
                    className="text-sm font-bold text-accent hover:bg-blue-50 px-4 py-2 rounded-xl transition-colors"
                  >
                    Iniciar Sesión
                  </button>
                  <Button variant="primary" onClick={() => setShowRegister(true)}>
                    Registrarse
                  </Button>
                </>
              )}
            </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden text-dark p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100vh' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed inset-0 bg-white z-40 pt-24 px-6 md:hidden overflow-hidden"
          >
{/* Mobile Menu - Dentro de AnimatePresence */}
{hasActiveOffer && (
  <motion.div 
    initial={{ x: -20, opacity: 0 }} 
    animate={{ x: 0, opacity: 1 }}
    className="mb-6"
  >
    <Link 
      to="/canje-especial" 
      className="flex flex-col gap-1 p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700 shadow-sm"
      onClick={() => setMobileOpen(false)}
    >
      <div className="flex items-center gap-2 font-black text-sm">
        <AlertCircle size={18} />
        ¡ENVÍO DE CANJES DISPONIBLE!
      </div>
      <p className="text-xs opacity-80">Te quedan {timeLeft} para aprovechar tu pedido actual.</p>
    </Link>
  </motion.div>
)}
            <div className="flex flex-col gap-6">
              {user?.email === 'admin' && (
    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
      <Link 
        to="/admin" 
        className="text-3xl font-bold text-accent flex items-center gap-3"
        onClick={() => setMobileOpen(false)}
      >
        <LayoutDashboard size={32} />
        Administración
      </Link>
    </motion.div>
  )}

  
{NAV_LINKS.map((link, i) => (
  <motion.div
    key={link.path}
    initial={{ x: -20, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ delay: i * 0.1 }}
  >
    <Link 
      to={link.path} 
      className={`text-3xl font-bold flex items-center gap-3 ${location.pathname === link.path ? 'text-accent' : 'text-dark'}`}
      onClick={() => setMobileOpen(false)}
    >
      {link.label}
      {link.label === 'Suscripciones' && (
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Star size={32} className="text-yellow-500" fill="currentColor" />
        </motion.span>
      )}
    </Link>
  </motion.div>
))}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex flex-col gap-4"
              >
                {user ? (
  <>
<div className="text-center">
  <Link to="/profile" className="block text-center mb-6">
  {/* Nivel grande */}
<div className={`inline-flex items-center gap-3 ${badgeColor} text-white px-6 py-3 rounded-2xl font-bold shadow-lg text-xl`}>
  <Star size={32} />
  <span>{benefits.badge}</span>
</div>
  
  {/* Puntos debajo */}
  <div className="mt-4 text-3xl font-black text-accent bg-white/90 backdrop-blur-sm px-8 py-4 rounded-2xl shadow-xl">
    {user.points} pts
  </div>
  </Link>

</div>

    <Button variant="ghost" onClick={logout} className="w-full">
      Cerrar Sesión
    </Button>
  </>
) : (
  <>
    <Button variant="ghost" onClick={() => { setShowLogin(true); setMobileOpen(false); }} className="w-full">
      Iniciar Sesión
    </Button>
    <Button variant="primary" onClick={() => { setShowRegister(true); setMobileOpen(false); }} className="w-full">
      Registrarse
    </Button>
  </>
)}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
            {/* Modales de Auth */}
{showLogin && (
  <AuthModal 
    type="login" 
    onClose={() => setShowLogin(false)} 
    onAuthSuccess={(userData) => {
      const fullUser = {
        ...userData,
        subscription: 'regular' as const,
        subscriptionEndDate: null
      };
      login(fullUser);
      setShowLogin(false);
    }}
    login={login}
  />
)}

{showRegister && (
  <AuthModal 
    type="register" 
    onClose={() => setShowRegister(false)} 
    onAuthSuccess={(userData) => {
      const fullUser = {
        ...userData,
        subscription: 'regular' as const,
        subscriptionEndDate: null
      };
      login(fullUser);
      setShowRegister(false);
    }}
    login={login} 
  />
)}
    </>
  );
};

export default Navbar;