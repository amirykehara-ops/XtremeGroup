import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Clock, Star, Flame, CheckCircle, User } from 'lucide-react';
import Button from '../components/ui/Button';
import { CATALOG_PRODUCTS } from '../constants';
import { Product } from '../types';
import { useUser } from '../contexts/UserContext';  // ← Corrige a '../'
import { useNavigate } from 'react-router-dom';
import AuthModal from '../components/ui/AuthModal';

const Catalog: React.FC = () => {
  const { user, login } = useUser(); // ← Obtiene el usuario logueado
  const userPoints = user?.points || 0;  // ← Puntos reales (0 si no logueado)
  const navigate = useNavigate();  // ← Añadido
// Para mostrar el nombre del producto en el modal de éxito
  const [lastCanjeado, setLastCanjeado] = useState<Product | null>(null);
  const [productoInsuficiente, setProductoInsuficiente] = useState<Product | null>(null);
// Estado para canjeados hoy
// Canjeados Hoy - persiste por usuario, resetea al logout
const canjeados = user ? (parseInt(localStorage.getItem(`canjeados_hoy_${user.email}`) || '0')) : 0;

// Actualiza al canjear
const handleCanje = (product: Product) => {
  if (!user) {
    setShowLoginRequired(true);
    return;
  }

  if (user.points >= product.points) {
    // 1. Restar puntos al usuario en el contexto
    login({ ...user, points: user.points - product.points });
    
    // 2. Aumentar contador de canjeados hoy
    const newCanjeados = canjeados + 1;
    localStorage.setItem(`canjeados_hoy_${user.email}`, newCanjeados.toString());

    // --- NUEVO: GUARDAR EL CANJE COMO UN PEDIDO ---
    const newExchange = {
      id: `CANJE-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      customerEmail: user.email,
      customerName: user.name,
      userEmail: user.email,
      date: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }),
      total: 0, // Es un canje, el costo es 0 soles
      status: 'pending', // Aparecerá en el Admin para que lo envíes
      isExchange: true,  // <--- Etiqueta clave para diferenciarlo
      pointsUsed: product.points,
      items: [{
        id: String(product.id),
        title: `(CANJE) ${product.title}`,
        price: 0,
        quantity: 1,
        img: product.img,
        points: product.points
      }],
      pointsEarned: 0
    };

    // Guardar en la bolsa global (all_orders)
    const allOrdersRaw = localStorage.getItem('all_orders');
    const allOrders = allOrdersRaw ? JSON.parse(allOrdersRaw) : [];
    allOrders.unshift(newExchange);
    localStorage.setItem('all_orders', JSON.stringify(allOrders));
    // ----------------------------------------------

    setLastCanjeado(product);
    setShowSuccess(true);
    setShowConfetti(true);
    
    setTimeout(() => setShowSuccess(false), 5000);
    setTimeout(() => setShowConfetti(false), 4000);
  } else {
    setProductoInsuficiente(product);
    setShowInsufficient(true);
  }
};
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
const [showInsufficient, setShowInsufficient] = useState(false);  // ← NUEVO
const [showLoginRequired, setShowLoginRequired] = useState(false);  // ← NUEVO


   const confetti = Array.from({ length: 150 }).map((_, i) => (  // ← Más partículas (150 para más impacto)
    <motion.div
        key={i}
        className="absolute w-3 h-3 bg-gradient-to-r from-accent to-blue-500 rounded-full shadow-lg"  // ← Más grande (w-3 h-3), gradient brillante y shadow para notorio
        style={{
        left: `${Math.random() * 100}%`,
        top: 0,  // ← Empieza desde arriba (top: 0)
        }}
        initial={{ y: 0, opacity: 1, scale: 0.5 }}  // ← Empieza pequeño en la parte superior
        animate={showConfetti ? { 
        y: Math.random() * 800 + 600,  // ← Cae hacia abajo (y positivo grande, hasta 1400px para cubrir pantalla)
        opacity: 0,
        scale: 1,
        rotate: Math.random() * 720,  // ← Más rotación para dinamismo
        } : { y: 0, opacity: 0, scale: 0.5 }}
        transition={{ duration: 3 + Math.random() * 2, delay: Math.random() * 0.5 }}  // ← Dura más (3-5s)
    />
    ));
  return (
    <div className="pt-28 pb-20 px-6 max-w-[1400px] mx-auto min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-blue-50" />

      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mb-16 relative z-10"
      >
<motion.h1 
  className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-600 mb-6 drop-shadow-lg shadow-accent/50"
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-100px" }}
  animate={{ 
    opacity: [1, 0.8, 1],  // ← Más notorio: opacidad de 1 a 0.8
    scale: [1, 1.01, 1],  // ← Agrega scale sutil para "pulso" visual
  }}
  transition={{ 
    duration: 1.5,  // ← Más rápido para dinamismo
    repeat: Infinity, 
    ease: "easeInOut",
  }}
  variants={{
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      }
    }
  }}
>
  {Array.from('Mercado de Canjes').map((char, i) => (
    <motion.span
      key={i}
      variants={{
        hidden: { opacity: 0, scale: 0.5, rotate: -90 },
        visible: { 
          opacity: 1, 
          scale: 1, 
          rotate: 0,
          transition: {
            type: "spring",
            stiffness: 350,
            damping: 15,
          }
        }
      }}
      className="inline-block"
    >
      {char === ' ' ? '\u00A0' : char}
    </motion.span>
  ))}
</motion.h1>

<motion.p 
  className="text-xl md:text-2xl text-slate-800 font-medium mb-8 max-w-4xl mx-auto leading-relaxed"
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, ease: "easeOut" }}
>
  <span className="text-accent font-bold">Canjea tus puntos</span> por accesorios dentales premium. 
  ¡Ofertas limitadas que desaparecen en minutos – acumula y cambia ahora o pierdes!
</motion.p>
  <motion.div 
  className="max-w-lg mx-auto mb-10 bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-accent/20"
  initial={{ opacity: 0, y: 40, scale: 0.95 }}
  whileInView={{ opacity: 1, y: 0, scale: 1 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ 
    duration: 0.8, 
    ease: "easeOut",
    type: "spring",
    stiffness: 100,
    damping: 20
  }}
>
  <div className="grid grid-cols-2 gap-8 text-center">
    <div>
      <p className="text-sm text-slate-600 uppercase tracking-wider font-semibold mb-2">Puntos Disponibles</p>
      <p className="text-4xl font-extrabold text-accent">
        {userPoints.toLocaleString()}
      </p>
    </div>
    <div>
      <p className="text-sm text-slate-600 uppercase tracking-wider font-semibold mb-2">Canjeados Hoy</p>
      <p className="text-4xl font-extrabold text-dark">
        {canjeados}
      </p>
    </div>
  </div>
  {!user && (
  <p className="text-center text-muted mt-8 mb-4">
    Inicia sesión para ver tus puntos reales
  </p>
)}
  {/* Barra de progreso mejorada */}
  <div className="mt-6">
    <div className="flex justify-between text-xs text-slate-600 mb-2">
      <span>Progreso hacia el siguiente nivel</span>
      <span className="font-bold text-accent">{Math.round((userPoints / 500) * 100)}%</span>
    </div>
    <div className="relative h-4 bg-slate-200 rounded-full overflow-hidden shadow-inner">
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-accent via-blue-500 to-purple-600 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min((userPoints / 500) * 100, 100)}%` }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
    </div>
  </div>
</motion.div>

        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
          className="flex justify-center"
        >
          <Button variant="primary" className="px-10 py-5 text-xl font-bold shadow-2xl hover:shadow-accent/50 relative overflow-hidden group">
            <span className="relative z-10 flex items-center gap-3">
              <ShoppingBag size={24} />
              Canjear con Puntos
            </span>
            <motion.div 
              className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100"
              initial={{ scale: 0 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, duration: 0.3 }}
            />
          </Button>
        </motion.div>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {CATALOG_PRODUCTS.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30, rotateY: 45 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ delay: i * 0.03, type: "spring", stiffness: 280, damping: 18 }}
              whileHover={{ y: -12, rotateY: 8, scale: 1.03 }}
              className="group relative bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 hover:border-accent/50 transition-all duration-400 cursor-pointer"
            >
              <motion.div 
                className="relative h-56 overflow-hidden"
                whileHover={{ y: -3 }}
              >
                <img 
                  src={product.img} 
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-400"
                />
                <motion.div 
                  className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Flame size={12} />
                  {Math.floor(Math.random() * 5 + 1)} restantes
                </motion.div>
              </motion.div>

              <div className="p-6 relative z-10">
                <h3 className="text-xl font-bold text-dark mb-2 group-hover:text-accent transition-colors duration-400">{product.title}</h3>
                <p className="text-slate-600 mb-4 line-clamp-2">{product.desc}</p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-accent font-bold">S/. {product.price}</span>
                  <span className="text-blue-600 font-bold">{product.points} pts</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 mb-4">
                  <Clock size={16} />
                  <span>Stock: {Math.floor(Math.random() * 10 + 1)} unidades</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-4 overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-accent to-red-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.random() * 80 + 20}%` }}
                    transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse" }}
                  />
                </div>
                <Button 
                  variant="primary" 
                  className="w-full py-3 text-sm font-bold shadow-2xl hover:shadow-accent/50 relative overflow-hidden group-btn bg-gradient-to-r from-accent to-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCanje(product);
                  }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <ShoppingBag size={16} />
                    Canjear Ahora
                  </span>
                  <motion.div 
                    className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100"
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    transition={{ type: "spring", stiffness: 400, duration: 0.3 }}
                  />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-20 text-center relative z-10"
      >
        <motion.h2 
          className="text-3xl font-bold text-dark mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          ¡Gana Más Puntos Hoy!
        </motion.h2>
        <motion.p 
          className="text-lg text-slate-700 mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          Canjea, compra o invita amigos para acumular y desbloquear ofertas exclusivas.
        </motion.p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="ghost" className="px-6 py-3">Cómo Ganar Puntos</Button>
          <Button variant="primary" className="px-6 py-3 shadow-xl hover:shadow-2xl transition-all duration-300">Ver Mi Saldo</Button>
        </div>
      </motion.section>
{/* Modal Login Requerido */}
<AnimatePresence>
  {showLoginRequired && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => setShowLoginRequired(false)}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50, rotate: -10 }}
        animate={{ scale: 1, y: 0, rotate: 0 }}
        exit={{ scale: 0.8, y: 50, rotate: 10 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
          className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <User size={48} className="text-accent" />
        </motion.div>
        <h2 className="text-3xl font-black text-dark mb-4">¡Inicia Sesión Primero!</h2>
        <p className="text-muted mb-8 text-lg">
          Para canjear este premio exclusivo, necesitas estar registrado. 
          <span className="text-accent font-bold"> ¡Regístrate y desbloquea todo!</span>
        </p>

        {/* Dos botones funcionales */}
        <div className="flex flex-col gap-4">
          <Button 
            variant="primary" 
            className="w-full py-4 text-lg"
            onClick={() => {
              setShowLoginRequired(false);
              window.dispatchEvent(new Event('openLoginModal'));  // ← Evento global
            }}
          >
            Iniciar Sesión
          </Button>
          <Button 
            variant="ghost" 
            className="w-full py-4 text-lg"
            onClick={() => {
              setShowLoginRequired(false);
              window.dispatchEvent(new Event('openRegisterModal'));  // ← Evento global
            }}
          >
            Registrarse
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
{/* Modal Puntos Insuficientes - MOTIVADOR */}
<AnimatePresence>
  {showInsufficient && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => setShowInsufficient(false)}
    >
      <motion.div
        initial={{ scale: 0.8, rotateY: 180 }}
        animate={{ scale: 1, rotateY: 0 }}
        exit={{ scale: 0.8, rotateY: -180 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="bg-gradient-to-br from-red-500 to-orange-600 rounded-3xl shadow-2xl p-10 max-w-md w-full text-center text-white relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          className="absolute top-4 right-6"
        >
          <Flame size={48} className="text-yellow-300 drop-shadow-lg" />
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
          className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md"
        >
          <Star size={48} className="text-yellow-300" />
        </motion.div>

        <h2 className="text-3xl font-black mb-4">
  ¡Casi lo tienes: {productoInsuficiente?.title || 'este premio'}!
</h2>
        <p className="text-lg mb-6 leading-relaxed">
          Te faltan <span className="text-4xl font-black">
  {productoInsuficiente ? productoInsuficiente.points - (user?.points || 0) : 0} pts
</span> para canjear este premio.
        </p>
        <p className="text-lg mb-8 opacity-90">
          <span className="font-bold">¡Compra ahora</span> y desbloquéalo al instante. ¡Oferta limitada!
        </p>
        <Button variant="primary" className="w-full py-4 text-lg bg-white text-red-600 hover:bg-white/90" onClick={() => {
          setShowInsufficient(false);
          navigate('/catalog');
        }}>
          Ir a Comprar y Ganar Puntos
        </Button>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

{/* Modal de Éxito */}
<AnimatePresence>
  {showSuccess && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => setShowSuccess(false)}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 180 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center relative overflow-hidden"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 500 }}
          className="w-28 h-28 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle size={64} className="text-accent" />
        </motion.div>

        <h2 className="text-3xl font-black text-dark mb-4">¡Canje Exitoso!</h2>
        <p className="text-lg text-muted mb-2">Has canjeado:</p>
        <p className="text-2xl font-bold text-accent mb-6">{lastCanjeado?.title || 'Premio Exclusivo'}</p>
        <p className="text-lg text-muted">¡Sigue acumulando para más premios épicos!</p>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
{/* Confetti SUTIL pero VISIBLE por delante del modal */}
<AnimatePresence>
  {showConfetti && (
    <motion.div
      className="fixed inset-0 z-[100] pointer-events-none"  // z-[100] = por delante del modal (z-50)
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {Array.from({ length: 80 }).map((_, i) => (  // ← Solo 80 partículas (no laguea)
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-accent to-blue-500 rounded-full shadow-md"  // ← Pequeño pero brillante
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10%',
          }}
          initial={{ y: -100, opacity: 0 }}
          animate={{ 
            y: window.innerHeight + 100,
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1.2, 0.8],
            rotate: Math.random() * 360,
          }}
          transition={{ 
            duration: 3 + Math.random() * 1.5, 
            delay: Math.random() * 0.6,
            ease: "easeOut"
          }}
        />
      ))}
    </motion.div>
  )}
</AnimatePresence>
    </div>
    
  );
};

export default Catalog;
