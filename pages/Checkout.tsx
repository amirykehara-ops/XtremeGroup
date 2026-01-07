      import React, { useState, useEffect } from 'react';
      import { motion, AnimatePresence } from 'framer-motion';
      import { ChevronLeft, CheckCircle, ShoppingBag, Flame, Star, ChevronDown } from 'lucide-react';
      import Button from '../components/ui/Button';
      import { useCart } from '../contexts/CartContext';
      import { useUser } from '../contexts/UserContext';
      import { useNavigate, Link } from 'react-router-dom';
      import { initMercadoPago} from '@mercadopago/sdk-react';
      import { CATALOG_PRODUCTS, getUserBenefits} from '../constants'; // ← Esta línea falta
      import { Product } from '../types';

      const districts = [
        'Lima Centro', 'Miraflores', 'San Isidro', 'Surco', 'La Molina', 'Barranco', 'San Borja', // Cerca (10 soles)
        'Lince', 'Jesús María', 'Pueblo Libre', 'Magdalena', 'San Miguel', 'Callao', 'Surquillo', // Medio (15 soles)
        'Ate', 'Chorrillos', 'Comas', 'Independencia', 'Villa El Salvador', 'Villa María del Triunfo', // Lejos (20 soles)
        'San Juan de Lurigancho', 'San Juan de Miraflores', 'San Martín de Porres', 'Carabayllo', 'Puente Piedra' // Muy lejos (25 soles)
      ];

      const getShippingCost = (district: string, subscription: string = 'regular', subtotal: number = 0) => {
  // 1. Caso PRIME PRO: Siempre gratis
  if (subscription === 'prime_pro') return 0;

  // 2. Caso PRIME BASIC: Gratis si compra >= 3000, si no, paga como regular
  if (subscription === 'prime_basic' && subtotal >= 3000) return 0;

  // 3. Caso REGULAR (o Prime Basic < 3000): Lógica de distritos estándar
  if (['Lima Centro', 'Miraflores', 'San Isidro', 'Surco', 'La Molina', 'Barranco', 'San Borja'].includes(district)) return 10;
  if (['Lince', 'Jesús María', 'Pueblo Libre', 'Magdalena', 'San Miguel', 'Callao', 'Surquillo'].includes(district)) return 15;
  if (['Ate', 'Chorrillos', 'Comas', 'Independencia', 'Villa El Salvador', 'Villa María del Triunfo'].includes(district)) return 20;
  
  return 25; // El resto
};

      const Checkout: React.FC = () => {
  
        const { cart, clearCart, addToCart } = useCart();
      const { user, login } = useUser();
      const navigate = useNavigate();
        const [showCanjeModal, setShowCanjeModal] = useState(false);
        const [selectedCanje, setSelectedCanje] = useState<Product | null>(null);
        const [selectedQuantity, setSelectedQuantity] = useState(1);
        const [selectedColor, setSelectedColor] = useState<string | null>(null);
        const [shippingCost, setShippingCost] = useState<number>(0);
        const [showError, setShowError] = useState(false);
        const [finalTotal, setFinalTotal] = useState(0);
        const [products, setProducts] = useState<Product[]>([]);
        const [showInsufficient, setShowInsufficient] = useState(false);
        const [productoInsuficiente, setProductoInsuficiente] = useState<Product | null>(null);
          const [cantidadInsuficiente, setCantidadInsuficiente] = useState(1);
        const userPoints = user?.points || 0;

const recommendedCanjes = CATALOG_PRODUCTS
  .filter(p => p.points <= userPoints + 10)
  .sort((a, b) => b.points - a.points)
  .slice(0, 5);
        useEffect(() => {
        initMercadoPago('APP_USR-3d56d6e4-e2f3-4bb0-8c8f-74d675c540d1'); // ← Public Key del vendedor de prueba
      }, []); 

        
        const [formData, setFormData] = useState({
          name: user?.name || '',
          email: user?.email || '',
          address: '',
          district: '',
          phone: ''
        });
        const [earnedPoints, setEarnedPoints] = useState(0);  // ← Nuevo estado para puntos ganados
        // Subtotal solo de productos pagados (no canjes)
const subtotal = cart.reduce((sum, item) => {
  return item.pointsCost > 0 ? sum : sum + item.product.price * item.quantity;
}, 0);
const benefits = getUserBenefits(user?.subscription || 'regular');
const discountPercent = benefits.discount;
const pointsMultiplier = benefits.pointsMultiplier;

// Total puntos usados en canjes
const puntosUsados = cart.reduce((sum, item) => sum + (item.pointsCost || 0), 0);

// Puntos ganados (solo por productos pagados)
// Cambia tu lógica actual por esta más segura:
const puntosGanados = cart.reduce((sum, item) => {
  // ❌ Los canjes no generan puntos
  const isExchange = item.pointsCost && item.pointsCost > 0;
  if (isExchange) return sum;

  const basePoints = (Number(item.product.points) || 0) * item.quantity;

  // 🔥 Multiplicador según suscripción
  const multiplier =
    user?.subscription === 'prime_pro'
      ? 3
      : user?.subscription === 'prime_basic'
      ? 2
      : 1;

  return sum + basePoints * multiplier;
}, 0);


// Total a pagar
const total = subtotal + shippingCost;
        const [showSuccess, setShowSuccess] = useState(false);
        const [showConfetti, setShowConfetti] = useState(false);     

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
  
  if (name === 'district') {
    // Pasamos el distrito, la suscripción del usuario y el subtotal actual
    const cost = getShippingCost(value, user?.subscription, subtotal);
    setShippingCost(cost);
  }
};

useEffect(() => {
  if (formData.district) {
    const newCost = getShippingCost(formData.district, user?.subscription, subtotal);
    setShippingCost(newCost);
  }
}, [subtotal, user?.subscription, formData.district]);

 const handleSubmit = async () => {
  if (!formData.district) {
  alert('Por favor, selecciona un distrito para calcular el envío.');
  return;
}
  if (!formData.name || !formData.email || !formData.address || !formData.district || !formData.phone) {
    setShowError(true);
    return;
  }

  if (cart.length === 0) {
    alert('Tu carrito está vacío');
    return;
  }
  if (user && puntosUsados > userPoints) {
    // Si el total de puntos de todos los canjes en el carrito supera el saldo
    setProductoInsuficiente(null); // Reset para el mensaje genérico
    setShowInsufficient(true); 
    return; // Detiene la ejecución y no llega a Mercado Pago
  }
const totalAmount = subtotal + shippingCost;
  const pointsToEarn = puntosGanados;
  

  // Objeto de orden UNIFICADO
  const newOrder = {
    id: Math.random().toString(36).substr(2, 9).toUpperCase(),
    customerEmail: formData.email, // <--- Obligatorio para el ADMIN
    customerName: formData.name,   // <--- Obligatorio para el ADMIN
    userEmail: formData.email,  
    customerPhone: formData.phone, // ← Agregado
  address: formData.address,     // ← Agregado
  district: formData.district,   // <--- Obligatorio para el HISTORIAL
    date: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }),
    total: totalAmount,
    status: 'pending',
    items: cart.map(item => ({
      id: String(item.product.id),
      title: item.product.title,
      price: item.pointsCost > 0 ? 0 : item.product.price, // ← Si es canje, precio 0
      quantity: item.quantity,
      img: item.product.img,
      color: item.color, // ← Agregado para que el admin sepa qué color enviar
    isCanje: item.pointsCost > 0,
      points: Number(item.product.points)
    })),
    pointsEarned: pointsToEarn,
    shippingCost: shippingCost // ← Agregado
  };

  // --- PERSISTENCIA (La clave del éxito) ---
  
  // 1. Guardamos en la bolsa global (all_orders) para que el ADMIN lo vea
  const allOrdersRaw = localStorage.getItem('all_orders');
  const allOrders = allOrdersRaw ? JSON.parse(allOrdersRaw) : [];
  allOrders.unshift(newOrder); 
  const existingOrdersJSON = localStorage.getItem(`orders_${user.email}`);
const existingOrders = existingOrdersJSON ? JSON.parse(existingOrdersJSON) : [];
localStorage.setItem(`orders_${user.email}`, JSON.stringify([newOrder, ...existingOrders]));
  localStorage.setItem('lastPurchaseOrderId', newOrder.id);
  
  localStorage.setItem('last_purchase_time', new Date().getTime().toString());
  localStorage.setItem('last_purchase_user', user.email);
  localStorage.setItem('all_orders', JSON.stringify(allOrders));
    // 2. Guardamos datos temporales para la pantalla de Success
  localStorage.setItem('lastPurchasePoints', puntosGanados.toString());
  localStorage.setItem('lastPurchaseTotal', totalAmount.toString());
  localStorage.setItem('lastPurchaseSpentPoints', puntosUsados.toString());

  // --- MERCADO PAGO ---
// --- MERCADO PAGO ---
const itemsParaMercadoPago = cart
    .filter(item => !(item.pointsCost && item.pointsCost > 0)) // Elimina los canjes de la lista
    .map(item => ({
      id: String(item.product.id),
      title: String(item.product.title).substring(0, 250),
      unit_price: Number(item.product.price), // Enviamos el número puro
      quantity: Number(item.quantity),
      currency_id: 'PEN'
    }));

  // AGREGAR EL COSTO DE ENVÍO (Si existe)
  if (shippingCost > 0) {
    itemsParaMercadoPago.push({
      id: "shipping-cost",
      title: `Costo de Envío: ${formData.district}`,
      unit_price: Number(shippingCost),
      quantity: 1,
      currency_id: 'PEN'
    });
  }

// AGREGAR EL COSTO DE ENVÍO COMO UN ITEM ADICIONAL

try {
  const response = await fetch('/api/create-preference', { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items:itemsParaMercadoPago }), // Aquí ya va el envío incluido
  });

  const data = await response.json();
  if (data.init_point) {
    window.location.href = data.init_point;
  }
} catch (error) {
  console.error("Error de conexión:", error);
  alert('No se pudo conectar con Mercado Pago, pero el pedido se registró localmente.');
}
};


      

      const confetti = Array.from({ length: 150 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 bg-gradient-to-r from-accent to-blue-500 rounded-full shadow-lg"
          style={{
            left: `${Math.random() * 100}%`,
            top: 0,
          }}
          initial={{ y: 0, opacity: 1, scale: 0.5 }}
          animate={{ 
            y: Math.random() * 800 + 600,
            opacity: 0,
            scale: 1,
            rotate: Math.random() * 720,
          }}
          transition={{ duration: 3 + Math.random() * 2, delay: Math.random() * 0.5 }}
        />
      ));

      return (
        
        <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen relative overflow-x-hidden">
          
          <Link to="/" className="flex items-center gap-2 text-accent mb-8 hover:text-dark transition-colors">
            <ChevronLeft size={20} />
            Volver al Inicio
          </Link>

          <motion.h1 
            className="text-3xl sm:text-4xl font-bold text-dark mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Checkout
          </motion.h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
            {/* Formulario */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-3xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-bold mb-6">Datos de Envío</h2>
              <form className="space-y-6">
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre Completo"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 sm:p-4 border border-slate-200 rounded-2xl focus:border-accent focus:outline-none transition-colors text-base"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 sm:p-4 border border-slate-200 rounded-2xl focus:border-accent focus:outline-none transition-colors text-base"
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Dirección Completa"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-3 sm:p-4 border border-slate-200 rounded-2xl focus:border-accent focus:outline-none transition-colors text-base"
                />
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full p-3 sm:p-4 border border-slate-200 rounded-2xl focus:border-accent focus:outline-none transition-colors text-base"
                >
                  <option value="">Selecciona Distrito (Lima Metropolitana)</option>
                  {districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Teléfono"
                  value={formData.phone}
                  onChange={handleChange}
                 className="w-full p-3 sm:p-4 border border-slate-200 rounded-2xl focus:border-accent focus:outline-none transition-colors text-base"
                />
              </form>
            </motion.div>

            {/* Resumen */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-gradient-to-br from-slate-50 to-white rounded-3xl shadow-xl p-8 sticky top-28"
            >
              <h2 className="text-2xl font-bold mb-6">Resumen de Compra</h2>
              <div className="space-y-4 mb-6">
                {cart.map((item, index) => {
                  if (!item || !item.product) return null; // Protección contra items corruptos
  return (
  <div key={`${item.product.id}-${item.color || 'default'}`} className="flex justify-between items-center py-2">
    <div>
      <p className="font-medium text-dark">
        {item.product.title} x {item.quantity}
        {item.color && <span className="text-sm text-muted ml-2">(Color: {item.color})</span>}
      </p>
      {item.pointsCost > 0 ? (
        <p className="text-purple-600 font-bold text-sm mt-1">
          Canje por {item.pointsCost} pts
        </p>
      ) : null}
    </div>
    <div className="text-right">
      {item.pointsCost > 0 ? (
        <p className="text-purple-600 font-bold">Gratis</p>
      ) : (
        <p className="font-bold text-accent">
          S/ {(item.product.price * item.quantity).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
        </p>
      )}
    </div>
  </div>
  );
      })}
                <div className="border-t pt-4 flex justify-between font-bold">
                  <span>Subtotal</span>
                  <span>S/ {subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-muted">
  <span>Envío ({formData.district || 'Pendiente'})</span>
  <span className={shippingCost === 0 && formData.district ? "text-blue-600 font-bold" : ""}>
    {shippingCost === 0 && formData.district ? '¡GRATIS!' : `S/ ${shippingCost.toFixed(2)}`}
  </span>
</div>

{/* Mensaje motivador para Prime Basic */}
{user?.subscription === 'prime_basic' && subtotal < 3000 && subtotal > 0 && (
  <p className="text-base sm:text-lg font-black text-blue-600 mt-1">
    ¡Pide S/ {(3000 - subtotal).toFixed(2)} más para envío GRATIS!
  </p>
)}

{/* SECCIÓN DE RECOMENDACIONES DE CANJE */}
  {user && recommendedCanjes.length > 0 && (
    <div className="bg-blue-50/50 rounded-3xl p-5 border border-blue-100 my-6">
      <div className="flex items-center gap-2 mb-3">
        <Star className="text-accent" size={20} fill="currentColor" />
        <p className="font-black text-dark">¡Tienes <span className="text-accent">{userPoints} puntos</span>!</p>
      </div>
      <p className="text-sm text-slate-600 mb-4">Te recomendamos estos canjes:</p>

      {/* Carrusel Compacto */}
      <div className="relative group">
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">

          {recommendedCanjes.map((product) => (
            <div key={product.id} className="min-w-[140px] bg-white rounded-2xl p-3 shadow-sm border border-slate-100 snap-start">
            {/*<div className="min-w-[120px] sm:min-w-[140px] flex-shrink-0 bg-white rounded-2xl p-2 sm:p-3 shadow-sm border border-slate-100 snap-start">*/}
<img src={product.img} alt={product.title} className="w-full h-16 sm:h-20 object-contain mb-1 sm:mb-2" />
  <h4 className="text-[10px] sm:text-[11px] font-bold line-clamp-1 mb-1">{product.title}</h4>
  <p className="text-accent font-black text-[10px] sm:text-xs mb-1 sm:mb-2">{product.points} pts</p>
              <button 
                onClick={() => {
                  setSelectedCanje(product);
                  setSelectedQuantity(1);
                  setSelectedColor(product.colors?.[0] || null);
                  setShowCanjeModal(true);
                }}
                className="w-full py-1 sm:py-1.5 bg-accent text-white text-[9px] sm:text-[10px] font-bold rounded-lg hover:bg-blue-600 transition-colors">
                Canjear
              </button>
            </div>
          ))}
        </div>
      </div>

      <Link to="/canjes" className="block text-center text-accent text-xs font-bold mt-2 hover:underline">
        Ver más en nuestro mercado de canjes
      </Link>
    </div>
  )}
                <div className="flex justify-between text-xl sm:text-2xl font-bold text-accent">
                  <span>Total</span>
        
                <span>S/ {(total || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
              {puntosUsados > 0 && (
  <div className="mt-8 p-4 bg-purple-100 rounded-2xl text-center border border-purple-300">
    <p className="text-purple-700 font-bold text-sm sm:text-lg">
      Usarás {puntosUsados} puntos en canjes
    </p>
  </div>
)}

{/* 2. MENSAJE DE ERROR SI EXCEDE LOS PUNTOS (CORREGIDO) */}
{puntosUsados > userPoints && (
  <motion.div 
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0, x: [-2, 2, -2, 2, 0] }}
    transition={{ duration: 0.5 }}
    className="mt-4 p-4 bg-red-50 border-2 border-red-500 rounded-2xl text-red-600 font-bold text-center"
  >
    <p>⚠️ Saldo insuficiente</p>
    <p className="text-sm">Excedes tus puntos por {puntosUsados - userPoints} pts</p>
  </motion.div>
)}

{puntosGanados > 0 && (
  <div className="mt-8 p-4 bg-blue-100 rounded-2xl text-center border border-blue-300">
<p className="text-blue-700 font-bold text-sm sm:text-lg">
  {user?.subscription === 'prime_pro' ? (
    <>
      ¡Ganarás {puntosGanados} puntos con esta compra!
      <span className="block text-sm text-gray-600 font-black">
        🚀 Triple de puntos gracias a tu Prime Pro
      </span>
    </>
  ) : user?.subscription === 'prime_basic' ? (
    <>
      ¡Ganarás {Math.round(puntosGanados)} puntos con esta compra!
      <span className="block text-sm text-gray-600 font-black">
        ✨ Ganas el doble de puntos gracias a tu Prime Basico
      </span>
    </>
  ) : (
    <>¡Ganarás {puntosGanados} puntos con esta compra!</>
  )}
</p>

  </div>
)}
              <div className="flex gap-4 mt-8 flex-col sm:flex-row">
                <Button variant="ghost" className="w-full text-base" onClick={() => navigate(-1)}>
                  Regresar
                </Button>
          <Button variant="primary" className="w-full text-base" onClick={handleSubmit}>
    Pagar con Mercado Pago
  </Button>
              </div>
            </motion.div>
          </div>

          {/* Confetti */}
          {showConfetti && (
            <AnimatePresence>
              {Array.from({ length: 150 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 bg-gradient-to-r from-accent to-blue-500 rounded-full shadow-lg"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: 0,
                  }}
                  initial={{ y: 0, opacity: 1, scale: 0.5 }}
                  animate={{ 
                    y: Math.random() * 800 + 600,
                    opacity: 0,
                    scale: 1,
                    rotate: Math.random() * 720,
                  }}
                  transition={{ duration: 3 + Math.random() * 2, delay: Math.random() * 0.5 }}
                />
              ))}
            </AnimatePresence>
          )}
          {/* Modal de Error – Profesional y motivador */}
  <AnimatePresence>
    {showError && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={() => setShowError(false)}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, rotate: -5 }}
          animate={{ scale: 1, y: 0, rotate: 0 }}
          exit={{ scale: 0.9, y: 20, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
            className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Flame size={48} className="text-orange-500" />
          </motion.div>

          <h2 className="text-3xl font-black text-dark mb-4">¡Faltan algunos datos!</h2>
          <p className="text-lg text-muted mb-6 leading-relaxed">
            Para completar tu compra, necesitamos que llenes todos los campos del formulario.  
            <span className="text-accent font-bold block mt-2">¡Estás a un paso de tu pedido!</span>
          </p>

          <Button 
            variant="primary" 
            className="w-full py-4 text-lg shadow-xl hover:shadow-2xl"
            onClick={() => setShowError(false)}
          >
            Completar Datos
          </Button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>

  {/* MODAL DE SELECCIÓN DE CANJE */}
<AnimatePresence>
  {showCanjeModal && selectedCanje && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-lg w-full relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-6">
          <button onClick={() => setShowCanjeModal(false)} className="text-slate-400 hover:text-dark">
            <ShoppingBag size={24} />
          </button>
        </div>

        <div className="flex flex-col items-center">
          <img src={selectedCanje.img} alt={selectedCanje.title} className="w-48 h-48 object-contain mb-6" />
          <h3 className="text-2xl font-black text-dark text-center mb-2">{selectedCanje.title}</h3>
          <p className="text-accent font-black text-xl mb-6">{selectedCanje.points * selectedQuantity} PUNTOS</p>

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

          {/* Selector de Cantidad */}
          <div className="flex items-center gap-6 mb-8 bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <button 
              onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-slate-100 font-bold text-lg sm:text-xl"
            >
              -
            </button>
            <span className="text-2xl font-black w-8 text-center">{selectedQuantity}</span>
            <button 
              onClick={() => setSelectedQuantity(selectedQuantity + 1)}
              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-slate-100 font-bold text-lg sm:text-xl"
            >
              +
            </button>
          </div>

          <div className="flex gap-4 w-full">
            <Button variant="ghost" className="flex-1" onClick={() => setShowCanjeModal(false)}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              className="flex-1 py-4 shadow-xl shadow-accent/30"
onClick={() => {
  const totalPointsNeeded = selectedCanje.points * selectedQuantity;
  if (userPoints >= totalPointsNeeded) {
    addToCart(selectedCanje, selectedQuantity, selectedColor || undefined, selectedCanje.points);
    setShowCanjeModal(false);
  } else {
    // En lugar de alert, activamos el modal de error
    setProductoInsuficiente(selectedCanje);
    setCantidadInsuficiente(selectedQuantity);
    setShowCanjeModal(false); // Cerramos el actual
    setShowInsufficient(true); // Abrimos el de "Te faltan puntos"
  }
}}
            >
              Confirmar Canje
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

  {/* Modal Puntos Insuficientes (Copiado de Canjes) */}
<AnimatePresence>
  {showInsufficient && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
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
        <div className="absolute top-4 right-6">
          <Flame size={48} className="text-yellow-300 drop-shadow-lg" />
        </div>
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
          <Star size={48} className="text-yellow-300" />
        </div>
        <h2 className="text-3xl font-black mb-4">
          ¡Casi lo tienes: {productoInsuficiente?.title}!
        </h2>
        <p className="text-lg mb-6 leading-relaxed">
  {productoInsuficiente ? (
    // Caso: Un solo producto desde el carrusel de recomendaciones
    <>Te faltan <span className="text-4xl font-black block my-2">
      {(productoInsuficiente.points * cantidadInsuficiente) - userPoints} pts
    </span> para este regalo.</>
  ) : (
    // Caso: Validación al pagar (Varios canjes acumulados en el carrito)
    <>Tu carrito tiene canjes por <span className="font-black">{puntosUsados} pts</span>, 
    pero solo tienes <span className="font-black">{userPoints} pts</span> disponibles. 
    <span className="text-sm block mt-2 opacity-90 italic">Por favor, elimina algunos canjes para continuar.</span></>
  )}
</p>
        <Button variant="primary" className="w-full py-4 text-lg bg-white text-red-600 hover:bg-white/90" onClick={() => setShowInsufficient(false)}>
          Entendido, ¡seguiré sumando!
        </Button>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
        </div>
      );
    };

    export default Checkout;