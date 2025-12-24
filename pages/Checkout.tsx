      import React, { useState, useEffect } from 'react';
      import { motion, AnimatePresence } from 'framer-motion';
      import { ChevronLeft, CheckCircle, ShoppingBag, Flame } from 'lucide-react';
      import Button from '../components/ui/Button';
      import { useCart } from '../contexts/CartContext';
      import { useUser } from '../contexts/UserContext';
      import { useNavigate, Link } from 'react-router-dom';
      import { initMercadoPago} from '@mercadopago/sdk-react';


      const districts = [
        'Lima Centro', 'Miraflores', 'San Isidro', 'Surco', 'La Molina', 'Barranco', 'San Borja', // Cerca (10 soles)
        'Lince', 'Jesús María', 'Pueblo Libre', 'Magdalena', 'San Miguel', 'Callao', 'Surquillo', // Medio (15 soles)
        'Ate', 'Chorrillos', 'Comas', 'Independencia', 'Villa El Salvador', 'Villa María del Triunfo', // Lejos (20 soles)
        'San Juan de Lurigancho', 'San Juan de Miraflores', 'San Martín de Porres', 'Carabayllo', 'Puente Piedra' // Muy lejos (25 soles)
      ];

      const getShippingCost = (district: string) => {
        if (['Lima Centro', 'Miraflores', 'San Isidro', 'Surco', 'La Molina', 'Barranco', 'San Borja'].includes(district)) return 10;
        if (['Lince', 'Jesús María', 'Pueblo Libre', 'Magdalena', 'San Miguel', 'Callao', 'Surquillo'].includes(district)) return 15;
        if (['Ate', 'Chorrillos', 'Comas', 'Independencia', 'Villa El Salvador', 'Villa María del Triunfo'].includes(district)) return 20;
        return 25; // El resto
      };

      const Checkout: React.FC = () => {
        const [showError, setShowError] = useState(false);
        const [finalTotal, setFinalTotal] = useState(0);
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
        const [shippingCost, setShippingCost] = useState(0);
        const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        const total = subtotal + shippingCost;
        const [showSuccess, setShowSuccess] = useState(false);
        const [showConfetti, setShowConfetti] = useState(false);     

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
          const { name, value } = e.target;
          setFormData(prev => ({ ...prev, [name]: value }));
          if (name === 'district') {
            setShippingCost(getShippingCost(value));
          }
        };

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

  const pointsToEarn = cart.reduce((sum, item) => sum + (Number(item.product.points) || 0) * item.quantity, 0);
  const totalAmount = subtotal + shippingCost;

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
  localStorage.setItem('lastPurchasePoints', pointsToEarn.toString());
  localStorage.setItem('lastPurchaseTotal', totalAmount.toString());

  // --- MERCADO PAGO ---
// --- MERCADO PAGO ---
const items = cart.map(item => ({
  id: String(item.product.id),
  title: String(item.product.title).substring(0, 250),
  unit_price: Number(Number(item.product.price).toFixed(2)),
  quantity: Number(item.quantity),
  currency_id: 'PEN'
}));

// AGREGAR EL COSTO DE ENVÍO COMO UN ITEM ADICIONAL
if (shippingCost > 0) {
  items.push({
    id: "shipping-cost",
    title: `Costo de Envío: ${formData.district}`,
    unit_price: Number(shippingCost.toFixed(2)),
    quantity: 1,
    currency_id: 'PEN'
  });
}

try {
  const response = await fetch('/api/create-preference', { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }), // Aquí ya va el envío incluido
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

        
        {/*// Suma puntos al usuario
      if (user) {
        const updatedUser = { ...user, points: (user.points || 0) + pointsEarned };
        login(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }

      clearCart();
      setShowSuccess(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000); */}
      
        

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
                {cart.map(item => (
                  <div key={item.product.id} className="flex justify-between text-muted">
                    <span>{item.product.title} x {item.quantity}</span>
                    <span>S/ {(item.product.price * item.quantity).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                ))}
                <div className="border-t pt-4 flex justify-between font-bold">
                  <span>Subtotal</span>
                  <span>S/ {subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Envío ({formData.district || 'Pendiente'})</span>
                  <span>S/ {shippingCost.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-accent">
                  <span>Total</span>
                  <span>S/ {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="ghost" className="w-full" onClick={() => navigate(-1)}>
                  Regresar
                </Button>
          <Button variant="primary" className="w-full" onClick={handleSubmit}>
    Pagar con Mercado Pago
  </Button>
              </div>
            </motion.div>
          </div>

          {/* Modal de Felicitación 
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle size={40} className="text-accent" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-4">¡Compra Finalizada!</h2>
                <p className="text-muted mb-4">
                    Tu pedido de S/ {finalTotal.toLocaleString()} está en camino. 
                    <span className="text-accent font-bold">¡Ganas {earnedPoints} puntos extra!</span>
                    </p>
                <p className="text-accent font-bold mb-6">¡Sigue comprando para más ofertas exclusivas!</p>
                <Button variant="primary" className="w-full max-w-xs mx-auto mt-6 py-4 text-lg shadow-2xl" onClick={() => {
                    setShowSuccess(false);
                    navigate('/equipamiento')}}>
                  Ver Más Productos
                </Button>
              </motion.div>
            </motion.div>
          )}*/}

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