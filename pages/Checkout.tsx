      import React, { useState, useEffect } from 'react';
      import { motion, AnimatePresence } from 'framer-motion';
      import { ChevronLeft, CheckCircle, ShoppingBag, Flame } from 'lucide-react';
      import Button from '../components/ui/Button';
      import { useCart } from '../contexts/CartContext';
      import { useUser } from '../contexts/UserContext';
      import { useNavigate, Link } from 'react-router-dom';
      import { initMercadoPago} from '@mercadopago/sdk-react';
      import { getUserBenefits} from '../constants'; // ← Esta línea falta
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
        const [shippingCost, setShippingCost] = useState<number>(0);
        const [showError, setShowError] = useState(false);
        const [finalTotal, setFinalTotal] = useState(0);
        const [products, setProducts] = useState<Product[]>([]);
        useEffect(() => {
        initMercadoPago('APP_USR-3d56d6e4-e2f3-4bb0-8c8f-74d675c540d1'); // ← Public Key del vendedor de prueba
      }, []); 
        const { cart, clearCart } = useCart();
        const { user, login } = useUser();
        const navigate = useNavigate();
        
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
  // Solo ganan puntos los productos que NO son canjes
  const isExchange = item.pointsCost && item.pointsCost > 0;
  return sum + (isExchange ? 0 : (Number(item.product.points) || 0) * item.quantity);
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
const totalAmount = subtotal + shippingCost;
  const pointsToEarn = puntosGanados;
  

  // Objeto de orden UNIFICADO
  const newOrder = {
    id: Math.random().toString(36).substr(2, 9).toUpperCase(),
    customerEmail: formData.email, // <--- Obligatorio para el ADMIN
    customerName: formData.name,   // <--- Obligatorio para el ADMIN
    userEmail: formData.email,     // <--- Obligatorio para el HISTORIAL
    date: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }),
    total: totalAmount,
    status: 'pending',
    items: cart.map(item => ({
      id: String(item.product.id),
      title: item.product.title,
      price: item.product.price,
      quantity: item.quantity,
      img: item.product.img,
      points: Number(item.product.points)
    })),
    pointsEarned: pointsToEarn
  };

  // --- PERSISTENCIA (La clave del éxito) ---
  
  // 1. Guardamos en la bolsa global (all_orders) para que el ADMIN lo vea
  const allOrdersRaw = localStorage.getItem('all_orders');
  const allOrders = allOrdersRaw ? JSON.parse(allOrdersRaw) : [];
  allOrders.unshift(newOrder); 
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
        <div className="pt-28 pb-20 px-6 max-w-[1400px] mx-auto min-h-screen relative">
          <Link to="/" className="flex items-center gap-2 text-accent mb-8 hover:text-dark transition-colors">
            <ChevronLeft size={20} />
            Volver al Inicio
          </Link>

          <motion.h1 
            className="text-4xl font-bold text-dark mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Checkout
          </motion.h1>

          <div className="grid lg:grid-cols-2 gap-12">
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
                  className="w-full p-4 border border-slate-200 rounded-2xl focus:border-accent focus:outline-none transition-colors"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-4 border border-slate-200 rounded-2xl focus:border-accent focus:outline-none transition-colors"
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Dirección Completa"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-4 border border-slate-200 rounded-2xl focus:border-accent focus:outline-none transition-colors"
                />
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full p-4 border border-slate-200 rounded-2xl focus:border-accent focus:outline-none transition-colors"
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
                  className="w-full p-4 border border-slate-200 rounded-2xl focus:border-accent focus:outline-none transition-colors"
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
  <p className="text-lg font-black text-blue-600 mt-1">
    ¡Pide S/ {(3000 - subtotal).toFixed(2)} más para envío GRATIS!
  </p>
)}
                <div className="flex justify-between text-2xl font-bold text-accent">
                  <span>Total</span>
        
                <span>S/ {(total || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
              {puntosUsados > 0 && (
  <div className="mt-8 p-4 bg-purple-100 rounded-2xl text-center border border-purple-300">
    <p className="text-purple-700 font-bold text-lg">
      Usarás {puntosUsados} puntos en canjes
    </p>
  </div>
)}

{puntosGanados > 0 && (
  <div className="mt-8 p-4 bg-blue-100 rounded-2xl text-center border border-blue-300">
    <p className="text-blue-700 font-bold text-lg">
      ¡Ganarás {puntosGanados} puntos con esta compra!
    </p>
  </div>
)}
              <div className="flex gap-4 mt-8">
                <Button variant="ghost" className="w-full" onClick={() => navigate(-1)}>
                  Regresar
                </Button>
          <Button variant="primary" className="w-full" onClick={handleSubmit}>
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
        </div>
      );
    };

    export default Checkout;