import React, { useState, useEffect } from 'react';
import { NavLink as Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, User, LogOut, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../contexts/UserContext';
import { useCart } from '../../contexts/CartContext';
import AuthModal from '../ui/AuthModal';
import { NAV_LINKS } from '../../constants';
import Button from '../ui/Button';


const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const location = useLocation();
  const { user, logout, login} = useUser();
  const { cartCount } = useCart();
  // Función para obtener nivel, icono y color según puntos
const getUserLevel = (points: number = 0) => {
  if (points >= 1000) return { name: 'Gold', icon: '🏆', color: 'from-yellow-400 to-amber-600' };
  if (points >= 500) return { name: 'Silver', icon: '🥈', color: 'from-gray-400 to-gray-600' };
  return { name: 'Bronze', icon: '🥉', color: 'from-orange-600 to-amber-700' };
};
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
  const openLogin = () => setShowLogin(true);
  const openRegister = () => setShowRegister(true);

  window.addEventListener('openLoginModal', openLogin);
  window.addEventListener('openRegisterModal', openRegister);

  return () => {
    window.removeEventListener('openLoginModal', openLogin);
    window.removeEventListener('openRegisterModal', openRegister);
  };
}, []);

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
  {user.email === 'admin' && (
        <Link 
          to="/admin" 
          className="flex items-center gap-2 bg-dark text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-accent transition-all duration-300 shadow-lg mr-2"
        >
          <LayoutDashboard size={16} />
          Panel Admin
        </Link>
      )}
                  <Link to="/profile" className="flex items-center gap-3 hover:scale-105 transition-all duration-300 cursor-pointer">
  <div className={`flex items-center gap-1.5 bg-gradient-to-r ${getUserLevel(user.points).color} text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md`}>
    <span className="text-base">{getUserLevel(user.points).icon}</span>
    <span>{getUserLevel(user.points).name}</span>
  </div>
</Link>
  {/* Puntos con shimmer (mantengo tu animación épica) */}
  <div className="relative flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md overflow-hidden">
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
                    className={`text-3xl font-bold ${location.pathname === link.path ? 'text-accent' : 'text-dark'}`}
                  >
                    {link.label}
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
  <div className={`inline-flex items-center gap-3 bg-gradient-to-r ${getUserLevel(user.points).color} text-white px-6 py-3 rounded-2xl font-bold shadow-lg text-xl`}>
    <span className="text-3xl">{getUserLevel(user.points).icon}</span>
    <span>{getUserLevel(user.points).name}</span>
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
          login(userData);           // ← Usa el login del contexto
          setShowLogin(false);}}
          login={login}
      />
    )}
    {showRegister && (
      <AuthModal 
        type="register" 
        onClose={() => setShowRegister(false)} 
        onAuthSuccess={(userData) => {
          login(userData);           // ← Usa el login del contexto
          setShowRegister(false);}}
          login={login} 
      />
    )}
    </>
  );
};

export default Navbar;