import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Clock, Star, Flame, CheckCircle, User, Minus, Plus, ChevronDown, CheckCircle2 } from 'lucide-react';
import Button from '../components/ui/Button';
import { CATALOG_PRODUCTS } from '../constants';
import { Product } from '../types';
import { useUser } from '../contexts/UserContext';  // ← Corrige a '../'
import { useNavigate } from 'react-router-dom';
import AuthModal from '../components/ui/AuthModal';
import { useCart } from '../contexts/CartContext';  // ← Para agregar al carrito
import Modal from '../components/ui/Modal';  // ← Si no lo tienes, para el nuevo modal

const Canjes: React.FC = () => {
  const { user, login } = useUser(); // ← Obtiene el usuario logueado
  const { addToCart, cart } = useCart();  // ← Para agregar al carrito
  const userPoints = user?.points || 0;  // ← Puntos reales (0 si no logueado)
  const navigate = useNavigate(); 
  const [showCartRequired, setShowCartRequired] = useState(false); // Nuevo modal
  const [showInsufficient, setShowInsufficient] = useState(false);  // ← NUEVO
const [showLoginRequired, setShowLoginRequired] = useState(false);  // ← NUEVO
const [selectedCanje, setSelectedCanje] = useState<Product | null>(null);  // Producto seleccionado para canje
const [selectedQuantity, setSelectedQuantity] = useState(1);  // Cantidad (default 1)
const [selectedColor, setSelectedColor] = useState<string | null>(null);  // Color (default null)
const [showCanjeModal, setShowCanjeModal] = useState(false); // ← Añadido
// Para mostrar el nombre del producto en el modal de éxito
  const [productoInsuficiente, setProductoInsuficiente] = useState<Product | null>(null);
  const [cantidadInsuficiente, setCantidadInsuficiente] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
// Estado para canjeados hoy
// Canjeados Hoy - persiste por usuario, resetea al logout
const canjeados = user ? (parseInt(localStorage.getItem(`canjeados_hoy_${user.email}`) || '0')) : 0;

// Actualiza al canjear
const handleCanje = (product: Product) => {
  if (!user) {
    setShowLoginRequired(true);
    return;
  }
  // VALIDACIÓN: ¿Tiene al menos un producto normal en el carrito?
  // Un producto normal es aquel que NO tiene costo en puntos (o tiene precio > 0)
  const tieneProductoNormal = cart.some(item => !item.isCanje && item.product.price > 0);

  if (!tieneProductoNormal) {
    setShowCartRequired(true); // Mostramos el aviso de que necesita un producto normal
    return;
  }
  const totalPointsNeeded = product.points; // Por ahora 1 unidad, el modal ajustará después

  if (user.points >= totalPointsNeeded) {
    // Tiene puntos → abre modal de cantidad/color
    setSelectedCanje(product);
    setSelectedQuantity(1);
    setSelectedColor(product.colors?.[0] || null);
    setShowCanjeModal(true);
  } else {
    // No tiene puntos → abre modal insuficientes
    setProductoInsuficiente(product);
    setShowInsufficient(true);
  }
};

 // Abrir/cerrar modal canje

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark mb-6"
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
  {productoInsuficiente 
    ? (productoInsuficiente.points * cantidadInsuficiente) - (user?.points || 0) 
    : 0} pts
</span> para canjear este premio.
        </p>
        <p className="text-lg mb-8 opacity-90">
          <span className="font-bold">¡Compra ahora</span> y desbloquéalo al instante. ¡Oferta limitada!
        </p>
        <Button variant="primary" className="w-full py-4 text-lg bg-white text-red-600 hover:bg-white/90" onClick={() => {
          setShowInsufficient(false);
          navigate('/canjes');
        }}>
          Ir a Comprar y Ganar Puntos
        </Button>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

{/* MODAL DE CANJE – DISEÑO PREMIUM, COMPACTO Y PROFESIONAL */}
<AnimatePresence>
  {showCanjeModal && selectedCanje && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => setShowCanjeModal(false)}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-accent/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Imagen + Título */}
        <div className="relative">
          <div className="h-56 sm:h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-t-3xl overflow-hidden">
            <img 
              src={selectedCanje.img} 
              alt={selectedCanje.title}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6">
            <h2 className="text-2xl md:text-3xl font-black text-white drop-shadow-lg">
              {selectedCanje.title}
            </h2>
          </div>
        </div>

        <div className="p-8">
          {/* Descripción */}
          <p className="text-muted text-base leading-relaxed mb-8">
            {selectedCanje.desc}
          </p>

          {/* Costo en puntos – DESTACADO */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 mb-8 text-center border-2 border-purple-200 shadow-inner mx-auto max-w-xs">
            <p className="text-lg font-bold text-purple-700 mb-2">Costo total en puntos</p>
            <p className="text-3xl font-black text-purple-600">
              {selectedCanje.points * selectedQuantity} pts
            </p>
          </div>

          {/* Cantidad – Más grande y premium */}
          <div className="mb-8">
            <p className="text-xl font-bold text-dark mb-4 text-center">Cantidad</p>
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="small-ghost"
                onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                className="w-auto h-auto rounded-full shadow-lg hover:bg-slate-100 hover:text-dark font-black"
              >
                <Minus size={16}/>
              </Button>
              <span className="text-2xl font-black text-dark w-24 text-center">
                {selectedQuantity}
              </span>
              <Button
                variant="small-ghost"
                onClick={() => setSelectedQuantity(selectedQuantity + 1)}
                className="w-auto h-auto rounded-full shadow-lg hover:bg-slate-100 hover:text-dark font-black"
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>

          {/* Selector de color – Estilo Premium de Canjes */}
{selectedCanje.colors && selectedCanje.colors.length > 0 && (
  <div className="w-full mb-8">
    <p className="text-sm font-bold text-slate-500 mb-3 text-center uppercase tracking-widest">Elige tu color</p>
    <div className="max-w-xs mx-auto relative">
      <select
        value={selectedColor || selectedCanje.colors[0]}
        onChange={(e) => setSelectedColor(e.target.value)}
        className="text-center w-full appearance-none bg-white border-2 border-slate-200 rounded-2xl px-6 py-4 pr-12 text-lg font-medium text-dark focus:border-accent focus:outline-none transition-all shadow-md hover:border-accent/50"
      >
        {selectedCanje.colors.map((color) => (
          <option key={color} value={color}>{color}</option>
        ))}
      </select>
      
      {/* Bolita de color dinámica */}
      <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
        <div 
          className="w-8 h-8 rounded-full shadow-lg border-4 border-white"
          style={{
            backgroundColor: 
              selectedColor === 'Azul Eléctrico' ? '#0066FF' :
              selectedColor === 'Rojo Fuego' ? '#FF3333' :
              selectedColor === 'Verde Esmeralda' ? '#00C853' :
              selectedColor === 'Morado Premium' ? '#8E24AA' :
              selectedColor === 'Naranja Vibrante' ? '#FF6D00' :
              selectedColor === 'Amarillo Solar' ? '#FFD600' :
              selectedColor === 'Rosa Impacto' ? '#FF1744' :
              selectedColor === 'Turquesa Marino' ? '#00BFA5' :
              selectedColor === 'Gris Titanio' ? '#263238' :
              selectedColor === 'Dorado Luxe' ? '#FFA000' : '#666666'
          }}
        />
      </div>
      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
        <ChevronDown size={24} className="text-slate-400" />
      </div>
    </div>
  </div>
)}

          {/* Botones finales – Más grandes y equilibrados */}
          <div className="flex gap-4">
            <Button
              variant="ghost"
              className="flex-1 py-4 sm:py-5 text-base sm:text-lg font-bold border-2 border-slate-300 hover:border-slate-400 transition-all duration-200"
              onClick={() => setShowCanjeModal(false)}
            >
              Regresar
            </Button>
            <Button
              variant="primary"
              className="flex-1 py-4 sm:py-5 text-base sm:text-lg font-bold shadow-2xl shadow-accent/40 hover:shadow-accent/60 transition-all duration-300"
              onClick={() => {
                if (!selectedCanje || !user) return;

                const totalPointsNeeded = selectedCanje.points * selectedQuantity;

                if (user.points >= totalPointsNeeded) {
                  addToCart(selectedCanje, selectedQuantity, selectedColor || undefined, selectedCanje.points);
                  setShowCanjeModal(false);
                  setSuccessMessage(`
                    ¡${selectedCanje.title} agregado al carrito!
                    Cantidad: ${selectedQuantity}
                    Costo: ${totalPointsNeeded} pts

                    Los puntos se descontarán al confirmar el pago.
                  `);
                  setShowSuccessModal(true);
                } else {
                  setShowCanjeModal(false);
                  setProductoInsuficiente(selectedCanje);
                  setCantidadInsuficiente(selectedQuantity);
                  setShowInsufficient(true);
                }
              }}
            >
              Canjear Ya
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
{/* MODAL CARRITO REQUERIDO (PRODUCTO NORMAL) */}
<AnimatePresence>
  {showCartRequired && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => setShowCartRequired(false)}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-md w-full text-center border-4 border-accent"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={40} className="text-white" />
        </div>
        
        <h2 className="text-2xl font-black text-dark mb-4">¡Casi listo!</h2>
        
        <p className="text-slate-600 mb-8 leading-relaxed">
          Los canjes son <span className="font-bold text-accent">regalos exclusivos</span> por tu lealtad. 
          Para procesar el envío, debes tener al menos un <span className="font-bold">producto regular</span> en tu carrito.
        </p>

        <div className="flex flex-col gap-3">
          <Button 
            variant="primary" 
            className="w-full py-4 text-lg shadow-xl shadow-accent/20"
            onClick={() => {
              setShowCartRequired(false);
              navigate('/equipamiento'); // Lo mandamos a comprar algo
            }}
          >
            Ir a ver Productos
          </Button>
          <Button 
            variant="ghost" 
            className="w-full py-2 text-slate-500"
            onClick={() => setShowCartRequired(false)}
          >
            Entendido
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </div>
    
  );
};

export default Canjes;

