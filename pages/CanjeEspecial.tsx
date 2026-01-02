import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Clock, Star, ChevronLeft, ShoppingBag, CheckCircle, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { CATALOG_PRODUCTS } from '../constants';
import Button from '../components/ui/Button';

const CanjeEspecial = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useUser();
  const [timeLeft, setTimeLeft] = useState("");
  const [selectedCanje, setSelectedCanje] = useState<any>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  // Dentro de const CanjeEspecial = () => {
const [showModal, setShowModal] = useState(false);
const [productoInsuficiente, setProductoInsuficiente] = useState<any>(null);
const [showInsufficient, setShowInsufficient] = useState(false);
const [cantidadInsuficiente, setCantidadInsuficiente] = useState(1);

  // Lógica del contador de 12 horas
  useEffect(() => {
    const timer = setInterval(() => {
      const lastPurchase = localStorage.getItem('last_purchase_time');
      const lastUser = localStorage.getItem('last_purchase_user');
      if (!lastPurchase || (user && lastUser !== user.email)) { navigate('/'); return; }

      const expiryTime = parseInt(lastPurchase) + (12 * 60 * 60 * 1000);
      const now = new Date().getTime();
      const diff = expiryTime - now;

      if (diff <= 0) {
        localStorage.removeItem('last_purchase_time');
        navigate('/');
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

const handleCanjeFinal = (product: any) => {
  const totalCost = product.points * selectedQuantity;
  
  if ((user?.points || 0) < totalCost) {
    setProductoInsuficiente(product);
    setShowModal(false);
    setShowInsufficient(true); 
    return;
  }

  // 1. OBTENER IDs REALES
  const lastOrderId = localStorage.getItem('lastPurchaseOrderId');
  const userEmail = user?.email || localStorage.getItem('last_purchase_user');
  const userOrdersKey = `orders_${userEmail}`;
  
  // 2. ACTUALIZAR HISTORIAL DEL USUARIO (orders_amir)
  const userOrders = JSON.parse(localStorage.getItem(userOrdersKey) || '[]');
  let userIdx = userOrders.findIndex((o: any) => o.id === lastOrderId);
  if (userIdx === -1 && userOrders.length > 0) {
    userIdx = 0; // En tu código de PaymentSuccess usas [newOrder, ...existingOrders], así que la última es la posición 0
  }

  if (userIdx !== -1) {
    const canjeItem = {
      id: `EXTRA-${product.id}-${Date.now()}`,
      title: `${product.title} (Canje Extra)`,
      price: 0,
      quantity: selectedQuantity,
      img: product.img,
      color: selectedColor || product.colors?.[0],
      isCanje: true
    };

    userOrders[userIdx].items.push(canjeItem);
    userOrders[userIdx].pointsSpent = (userOrders[userIdx].pointsSpent || 0) + totalCost;
    localStorage.setItem(userOrdersKey, JSON.stringify(userOrders));

    // 3. ACTUALIZAR PANEL ADMIN (all_orders)
    // TRUCO DE SEGURIDAD: Como tus IDs a veces no coinciden, 
    // buscaremos por ID o por ser la última orden del mismo email y fecha.
    const adminOrders = JSON.parse(localStorage.getItem('all_orders') || '[]');
    
    // Intentamos buscar por ID primero
    let adminIdx = adminOrders.findIndex((o: any) => o.id === lastOrderId);
    
    // Si no lo encuentra por ID, buscamos la última orden de este usuario
    if (adminIdx === -1) {
      adminIdx = adminOrders.findLastIndex((o: any) => o.customerEmail === userEmail || o.userEmail === userEmail);
    }
    
    if (adminIdx !== -1) {
      adminOrders[adminIdx].items.push(canjeItem);
      adminOrders[adminIdx].pointsSpent = (adminOrders[adminIdx].pointsSpent || 0) + totalCost;
      localStorage.setItem('all_orders', JSON.stringify(adminOrders));
    }

    // 4. ACTUALIZAR PUNTOS EN AMBOS ARRAYS DE USUARIOS (Sincronización total)
    // Actualizamos 'users'
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map((u: any) => 
      u.email === userEmail ? { ...u, points: u.points - totalCost } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // Actualizamos 'all_users' (El que usa tu Dashboard)
    const allUsers = JSON.parse(localStorage.getItem('all_users') || '[]');
    const updatedAllUsers = allUsers.map((u: any) => 
      u.email === userEmail ? { ...u, points: u.points - totalCost } : u
    );
    localStorage.setItem('all_users', JSON.stringify(updatedAllUsers));

    // 5. ACTUALIZAR CONTEXTO Y UI
    updateUser({ points: (user?.points || 0) - totalCost });
    window.dispatchEvent(new Event('storage'));
    setShowModal(false);
    alert("¡Regalo añadido con éxito a tu pedido!");
  } else {
    alert("No se encontró la orden activa.");
  }
};

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header con Neón */}
        <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 mb-12 relative overflow-hidden">
          <motion.div 
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -mr-20 -mt-20"
          />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted hover:text-accent font-bold mb-4 transition-colors">
                <ChevronLeft size={20} /> Volver
              </button>
              <h1 className="text-4xl md:text-6xl font-black text-dark tracking-tighter mb-4">
                ¡Beneficio <span className="text-accent">Exclusivo!</span>
              </h1>
              <p className="text-xl text-muted max-w-xl">
                Por tu compra reciente, tienes 12 horas para añadir canjes a tu pedido <span className="font-bold text-dark italic">¡SIN COSTO DE ENVÍO ADICIONAL!</span>
              </p>
            </div>

            <div className="bg-dark p-8 rounded-[2.5rem] shadow-2xl text-center min-w-[280px] border-t-4 border-accent">
              <div className="flex justify-center mb-2">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                  <Clock className="text-accent" size={32} />
                </motion.div>
              </div>
              <p className="text-slate-400 text-xs uppercase font-black tracking-widest mb-1">Tu oferta expira en:</p>
              <p className="text-4xl font-mono font-black text-white">{timeLeft}</p>
            </div>
          </div>
        </div>

        {/* Grid de Productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {CATALOG_PRODUCTS.map((product) => {
            const canAfford = (user?.points || 0) >= product.points;
            return (
              <motion.div
                key={product.id}
                whileHover={{ y: -10 }}
                className={`bg-white rounded-[2.5rem] p-6 shadow-xl border-2 transition-all ${canAfford ? 'border-transparent hover:border-accent' : 'opacity-75 border-slate-100 grayscale-[0.5]'}`}
              >
                <div className="relative mb-6">
                  <img src={product.img} alt={product.title} className="w-full h-48 object-contain" />
                  <div className="absolute top-0 right-0 bg-dark text-white px-4 py-2 rounded-2xl font-black text-sm">
                    {product.points} PTS
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-dark mb-4 line-clamp-2 h-14">{product.title}</h3>
                
                <Button 
                  variant={canAfford ? "primary" : "ghost"} 
                  className="w-full py-4 rounded-2xl font-black"
                  disabled={!canAfford}
                  onClick={() => {
                    setSelectedCanje(product);
                    setSelectedQuantity(1);
                    setSelectedColor(product.colors?.[0] || "");
                    setShowModal(true);
                  }}
                >
                  {canAfford ? "AÑADIR AL PEDIDO" : "PUNTOS INSUFICIENTES"}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
      {/* MODAL DE SELECCIÓN PREMIUM */}
<AnimatePresence>
  {showModal && selectedCanje && (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-lg w-full relative"
      >
        <div className="flex flex-col items-center">
          <img src={selectedCanje.img} className="w-40 h-40 object-contain mb-4" />
          <h3 className="text-2xl font-black text-dark text-center">{selectedCanje.title}</h3>
          <p className="text-accent font-black text-xl mb-6">{selectedCanje.points * selectedQuantity} PTS</p>

          {/* Selector de Color */}
          {selectedCanje.colors && (
            <div className="w-full mb-6">
              <select 
                value={selectedColor} 
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold focus:border-accent outline-none"
              >
                {selectedCanje.colors.map((c: string) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          {/* Selector de Cantidad */}
          <div className="flex items-center gap-6 mb-8 bg-slate-50 p-2 rounded-2xl">
            <button onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))} className="w-10 h-10 font-bold">-</button>
            <span className="text-xl font-black">{selectedQuantity}</span>
            <button onClick={() => setSelectedQuantity(selectedQuantity + 1)} className="w-10 h-10 font-bold">+</button>
          </div>

          <div className="flex gap-4 w-full">
            <Button variant="ghost" className="flex-1" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button 
              variant="primary" 
              className="flex-1 font-black"
              onClick={() => {
                handleCanjeFinal(selectedCanje); // <--- AQUÍ SE EJECUTA LA LÓGICA
                setShowModal(false);
              }}
            >
              ¡CONFIRMAR REGALO!
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
<AnimatePresence>
  {showInsufficient && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[160] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
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
        <div className="absolute top-4 right-6 opacity-20">
          <Flame size={80} fill="currentColor" />
        </div>
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/30">
          <Star size={48} className="text-yellow-300 fill-current" />
        </div>
        <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">
          ¡Aún no llegas!
        </h2>
        <p className="text-lg mb-6 leading-relaxed">
          Te faltan <span className="text-4xl font-black block my-2">
            {(productoInsuficiente?.points || 0) * selectedQuantity - (user?.points || 0)}
          </span> 
          para llevarte este regalo. ¡Sigue comprando para acumular más!
        </p>
        <Button 
          variant="primary" 
          className="w-full py-4 text-lg bg-white text-red-600 hover:bg-slate-100 border-none font-black" 
          onClick={() => setShowInsufficient(false)}
        >
          ¡ENTENDIDO!
        </Button>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

      {/* Reutiliza aquí el Modal de Selección que ya tienes en PaymentSuccess pero ajustado */}
      {/* ... (Aquí iría el AnimatePresence de tu modal actual) ... */}
    </div>
  );
};

export default CanjeEspecial;