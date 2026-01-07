import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileDown, CheckCircle, Share2, ShoppingBag, Flame, Star, Minus, Plus, ChevronDown } from 'lucide-react';
import { CATALOG_PRODUCTS } from '../constants'; // Para mostrar las recomendaciones
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useUser } from '../contexts/UserContext';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { clearCart, cart } = useCart();
  const { user, login, updateUser } = useUser();

  const [summary, setSummary] = useState({
    points: 0,
    total: 0,
    earned: 0,
    spent: 0
  });
  const [displayPoints, setDisplayPoints] = useState(0);
  const [animatedPoints, setAnimatedPoints] = useState(0); 
  const [showCanjeModal, setShowCanjeModal] = useState(false);
  const [showInsufficient, setShowInsufficient] = useState(false);
const [productoInsuficiente, setProductoInsuficiente] = useState(null);
const [cantidadInsuficiente, setCantidadInsuficiente] = useState(1);
// Los otros (selectedCanje, showCanjeModal, etc.) ya los tienes
const [selectedCanje, setSelectedCanje] = useState(null);
const [selectedQuantity, setSelectedQuantity] = useState(1);
const [selectedColor, setSelectedColor] = useState(null);// El número que se mueve

useEffect(() => {
  const rawEarned = localStorage.getItem('lastPurchasePoints');
  const rawSpent = localStorage.getItem('lastPurchaseSpentPoints');
  const rawTotal = localStorage.getItem('lastPurchaseTotal');

  const earned = Number(rawEarned || '0');
  const spent = Number(rawSpent || '0');
  const total = Number(rawTotal || '0');

  // EL CAMBIO: Verificar que el usuario esté cargado y existan puntos pendientes
  if (user && (earned > 0|| spent > 0|| total > 0)) {
    // 1. Actualizamos los puntos globalmente usando tu función de UserContext
    const nuevoPuntajeGlobal = (user.points || 0) + earned - spent;
    updateUser({ points: nuevoPuntajeGlobal });

    // 2. Lógica de guardado de orden (lo que ya tenías) [cite: 259-261]
    const newOrder = {
      id: localStorage.getItem('lastPurchaseOrderId') || Math.floor(100000 + Math.random() * 900000).toString(),
      date: new Date().toLocaleDateString('es-PE', { 
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
      }),
      total: total,
      status: 'pending',
      pointsEarned: earned,
      pointsSpent: spent, // <-- Nuevo
      items: cart.map(item => ({
        id: item.product.id.toString(),
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        img: item.product.img
      }))
    };

    const existingOrdersJSON = localStorage.getItem(`orders_${user.email}`);
    const existingOrders = existingOrdersJSON ? JSON.parse(existingOrdersJSON) : [];
    localStorage.setItem('lastPurchaseOrderId', newOrder.id);
    localStorage.setItem('last_purchase_time', new Date().getTime().toString());
    localStorage.setItem('last_purchase_user', user.email);
    window.dispatchEvent(new Event('storage')); // Avisa al Navbar al instante
    localStorage.setItem(`orders_${user.email}`, JSON.stringify([newOrder, ...existingOrders]));
    
    // 3. Actualizamos la UI local [cite: 263]
    const diferenciaNeta = earned - spent;
    setSummary({ 
  points: earned - spent, 
  total: total, 
  earned: earned, 
  spent: spent 
});
    setDisplayPoints(diferenciaNeta);

    // 4. Limpieza vital para evitar duplicidad al recargar [cite: 264]
    localStorage.removeItem('lastPurchasePoints');
    localStorage.removeItem('lastPurchaseSpentPoints');
    localStorage.removeItem('lastPurchaseTotal');
    clearCart();
  }
}, [user]); // IMPORTANTE: Cambiar [] por [user]// [] asegura que solo se ejecute UNA vez al cargar

  // 2. ACTUALIZAR USUARIO (Cuando el usuario esté disponible)
    // Verificamos que el usuario exista Y que tengamos puntos para sumarle
  useEffect(() => {
  if (displayPoints > 0) {
    let start = 0;
    const end = displayPoints;
    const duration = 1500; // 1.5 segundos durará la subida
    const increment = end / (duration / 16); // 60fps aprox

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setAnimatedPoints(end);
        clearInterval(timer);
      } else {
        setAnimatedPoints(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }
}, [displayPoints]);

  // Confetti épico
  const confetti = React.useMemo(() => { return Array.from({ length: 50 }).map((_, i) => (
    <motion.div
      key={i}
      className="absolute w-3 h-3 bg-gradient-to-r from-accent to-blue-500 rounded-full shadow-lg"
      style={{
        left: `${Math.random() * 100}%`,
        top: '-10%',
      }}
      initial={{ y: -100, opacity: 0 }}
      animate={{
        y: window.innerHeight + 100,
        opacity: [0, 1, 0.8, 0],
        scale: [0.5, 1.3, 0.8],
        rotate: Math.random() * 720,
      }}
      transition={{
        duration: 4 + Math.random() * 4,
        delay: Math.random() * 0.8,
        ease: "easeOut"
      }}
    />
  ));
  }, []);

  const handleShare = async () => {
  const shareData = {
    title: '¡Soy cliente Xtreme!',
    text: `¡Acabo de ganar ${displayPoints} puntos en Xtreme Group! 🚀 Mi nuevo nivel es ${user?.points >= 1000 ? 'Gold 🏆' : user?.points >= 500 ? 'Silver 🥈' : 'Bronze 🥉'}.`,
    url: window.location.origin,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(`${shareData.text} Visítanos en: ${shareData.url}`);
      alert('¡Copiado al portapapeles para compartir!');
    }
  } catch (err) {
    console.log('Error al compartir', err);
  }
};

const downloadInvoice = () => {
  const doc = new jsPDF();
  
  // Encabezado Corporativo
  doc.setFontSize(22);
  doc.setTextColor(20, 184, 166); // Color de tu marca (Teal/Accent)
  doc.text('XTREME GROUP', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Equipamiento Odontológico Profesional', 14, 26);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 32);
  doc.text(`Cliente: ${user?.name || 'Cliente Xtreme'}`, 14, 38);

  // Tabla de productos
  const tableData = cart.map(item => [
    item.product.title,
    item.quantity,
    `S/. ${item.product.price.toFixed(2)}`,
    `S/. ${(item.product.price * item.quantity).toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: 45,
    head: [['Producto', 'Cant.', 'Precio Unit.', 'Subtotal']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [20, 184, 166] }
  });

  // Totales
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`TOTAL PAGADO: S/. ${summary.total.toFixed(2)}`, 14, finalY);
  doc.text(`PUNTOS GANADOS: ${displayPoints} pts`, 14, finalY + 7);

  doc.save(`Comprobante-Xtreme-${Math.floor(Math.random() * 10000)}.pdf`);
  
};
const handleCanjeDirecto = (product, quantity, color) => {
  if (!user || user.points < (product.points * quantity)) {
    alert("No tienes puntos suficientes");
    return;
  }

  // 1. Obtener el ID de la orden que acabamos de hacer
  const lastOrderId = localStorage.getItem('lastPurchaseOrderId');
  const ordersKey = `orders_${user.email}`;
  const allOrders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
  
  // 2. Buscar la orden en la lista
  const orderIndex = allOrders.findIndex(o => o.id === lastOrderId);

  if (orderIndex !== -1) {
    // 3. Añadir el item a la orden con una marca de "CANJE POST-PAGO"
    const canjeItem = {
      id: `POST-${product.id}-${Date.now()}`,
      title: `${product.title} (Canje Post-Venta)`,
      price: 0, // Es un canje
      quantity: quantity,
      img: product.img,
      color: color,
      isCanje: true
    };

    allOrders[orderIndex].items.push(canjeItem);
    
    // 4. Guardar cambios para el Admin
    localStorage.setItem(ordersKey, JSON.stringify(allOrders));
    // También actualizar la lista GLOBAL para el Admin
    const adminOrdersRaw = localStorage.getItem('all_orders');
    const adminOrders = adminOrdersRaw ? JSON.parse(adminOrdersRaw) : [];
    const adminOrderIndex = adminOrders.findIndex(o => o.id === lastOrderId);
    if (adminOrderIndex !== -1) {
      adminOrders[adminOrderIndex].items.push(canjeItem);
      localStorage.setItem('all_orders', JSON.stringify(adminOrders));
    }
    // 5. Restar puntos al usuario y cerrar
    const cost = product.points * quantity;
    updateUser({ points: user.points - cost });
    
    setShowCanjeModal(false);
    alert("¡Increíble! Hemos añadido este regalo a tu pedido actual. El administrador lo verá junto a tus otros productos.");
  }
};

  return (
    <div className="pt-28 pb-20 px-6 max-w-[1400px] mx-auto min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Confetti */}
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-[100] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          exit={{ opacity: 0 }}
        >
          {confetti}
        </motion.div>
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center relative z-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
          className="w-24 sm:w-32 h-24 sm:h-32 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle size={80} className="hidden sm:block text-accent" />
          <CheckCircle size={50} className="sm:hidden text-accent" />
        </motion.div>

        <h1 className="text-3xl md:text-6xl sm:text-6xl font-black text-dark mb-6">
          ¡Pago Exitoso!
        </h1>

        <p className="text-lg sm:text-xl text-muted mb-6">
          Tu compra de <span className="font-bold text-accent">S/ {summary.total.toFixed(2)}</span> ha sido procesada correctamente.
        </p>

{displayPoints > 0 ? (
  <motion.div
    initial={{ y: 10, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.5 }}
    className="flex flex-col items-center justify-center mb-10"
  >
    {/* Estrella con Zoom constante y ligero + Pop al finalizar */}
    <motion.div
      className="mb-4"
      animate={{ 
        // El zoom constante (scale: [1, 1.1, 1]) + el Pop final si ya terminó el conteo
        scale: animatedPoints === displayPoints ? [1, 1.4, 1] : [1, 1.08, 1],
        filter: animatedPoints === displayPoints ? ["brightness(1)", "brightness(1.5)", "brightness(1)"] : "brightness(1)"
      }}
      transition={{ 
        // El pulso constante dura 2 segundos y se repite siempre
        duration: animatedPoints === displayPoints ? 0.5 : 2, 
        repeat: animatedPoints === displayPoints ? 0 : Infinity,
        ease: "easeInOut"
      }}
    >
      <span className="text-4xl md:text-7xl sm:text-7xl drop-shadow-lg">⭐</span>
    </motion.div>
    
{/* Verificamos si hubo movimiento de puntos en el resumen */}
{(summary.earned > 0 || summary.spent > 0) ? (
    <div>
    <p className="text-lg md:text-3xl sm:text-3xl font-black text-accent tabular-nums">
      {summary.points >= 0 
        ? `¡Balance: +${animatedPoints} puntos!` 
        : `¡Balance: ${animatedPoints} puntos!`}
    </p>

    <div className="flex gap-4 mt-2 text-sm font-medium text-muted justify-center">
      <span className="text-green-600">+{summary.earned} ganados</span>
      <span className="text-red-500">-{summary.spent} canjeados</span>
    </div>

    <motion.p 
      className="text-base sm:text-lg text-muted mt-4 bg-slate-50 border border-slate-100 px-6 py-2 rounded-full"
    >
      Tu nuevo puntaje: <span className="font-bold text-accent">{user?.points}</span>
    </motion.p>
    </div>
 
) : (
  <p className="text-xl text-muted mb-10">¡Gracias por tu compra!</p>
)}
    {/* Nivel actual con Fade In al final */}
    <motion.p 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
      className="text-base sm:text-lg text-muted mt-4 bg-slate-50 border border-slate-100 px-6 py-2 rounded-full shadow-sm"
    >
      Plan Actual: <span className="font-black text-dark">
        {user?.subscription === 'prime_pro' ? 'Prime Pro' : user?.subscription === 'prime_basic' ? 'Prime Básico' : 'Regular'}
      </span>
    </motion.p>
  </motion.div>
) : (
  <p className="text-xl text-muted mb-10">
    ¡Gracias por tu compra!
  </p>
)}
{/* SECCIÓN DE CANJE POST-VENTA */}
<div className="mt-10 mb-12 p-4 sm:p-6 bg-gradient-to-br from-accent/5 to-blue-50 rounded-3xl border border-accent/20">
  <h3 className="text-xl sm:text-2xl font-black text-dark mb-2 flex items-center justify-center gap-2">
    <Flame className="text-orange-500" fill="currentColor" /> 
    ¡Aprovecha tus puntos ahora!
  </h3>
  <p className="text-muted mb-6">Añade un regalo a tu pedido actual sin pagar envío extra:</p>
  
  <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
    {CATALOG_PRODUCTS.filter(p => p.points <= user?.points + 10)
  .sort((a, b) => b.points - a.points)
  .slice(0, 5).map((product) => (
      <div 
        key={product.id}
        className="min-w-[200px] bg-white p-4 rounded-2xl shadow-md border border-slate-100"
      >
        <img src={product.img} className="w-20 h-20 mx-auto object-contain mb-2" />
        <p className="font-bold text-sm line-clamp-1">{product.title}</p>
        <p className="text-accent font-black text-sm mb-3">{product.points} pts</p>
        <Button 
          variant="primary" 
          className="w-full py-2 text-xs"
          onClick={() => {
            setSelectedCanje(product);
            setSelectedQuantity(1);
            setSelectedColor(product.colors?.[0] || null);
            setShowCanjeModal(true);
          }}
        >
          Canjear ya
        </Button>
        
      </div>
    ))}
  </div>
</div>
        <p className="text-base sm:text-lg text-muted mb-12">
          En breve recibirás la confirmación por email. ¡Sigue acumulando puntos para ofertas exclusivas!
        </p>
        

{/* BUSCA: <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8"> */}
{/* REEMPLAZA TODO ESE DIV POR ESTE BLOQUE: */}

{/* BUSCA EL BLOQUE DE BOTONES QUE ACABAMOS DE CREAR Y REEMPLÁZALO POR ESTE: */}

<div className="space-y-4 mt-8">
  <div className="flex flex-col sm:flex-row gap-3 justify-center">
    {/* BOTÓN DE COMPARTIR */}
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleShare}
      className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white font-black px-8 py-4 rounded-2xl shadow-xl transition-all"
    >
      <Share2 size={20} />
      Compartir
    </motion.button>

    {/* BOTÓN DE DESCARGAR PDF */}
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={downloadInvoice}
      className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-dark font-black px-8 py-4 rounded-2xl shadow-lg hover:border-accent transition-all"
    >
      <FileDown size={20} className="text-accent" />
      Descargar PDF
    </motion.button>
  </div>

  <div className="flex flex-col sm:flex-row gap-4 justify-center">
    <Button 
      variant="primary" 
      className="px-10 py-4 sm:py-5 text-lg shadow-2xl hover:shadow-accent/30 transition-shadow flex-1"
      onClick={() => navigate('/equipamiento')}
    >
      Seguir Comprando
    </Button>
    <Button 
      variant="ghost" 
      className="px-10 py-4 sm:py-5 text-lg flex-1"
      onClick={() => navigate('/')}
    >
      Ir al Inicio
    </Button>
  </div>
</div>
      </motion.div>
 {/* MODAL DE SELECCIÓN DE CANJE (DISEÑO PREMIUM) */}
<AnimatePresence>
  {showCanjeModal && selectedCanje && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
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
          <p className="text-accent font-black text-xl mb-6 uppercase tracking-tighter">
            {selectedCanje.points * selectedQuantity} PUNTOS
          </p>

          {/* Selector de color dinámico */}
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
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronDown size={24} />
                </div>
              </div>
            </div>
          )}

          {/* Selector de Cantidad */}
          <div className="flex items-center gap-6 mb-8 bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <button 
              onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
              className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-slate-100 font-bold text-xl"
            > - </button>
            <span className="text-2xl font-black w-8 text-center">{selectedQuantity}</span>
            <button 
              onClick={() => setSelectedQuantity(selectedQuantity + 1)}
              className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-slate-100 font-bold text-xl"
            > + </button>
          </div>

          <div className="flex gap-4 w-full">
            <Button variant="ghost" className="flex-1" onClick={() => setShowCanjeModal(false)}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              className="flex-1 py-4 shadow-xl shadow-accent/30 font-black"
              onClick={() => {
                const totalPointsNeeded = selectedCanje.points * selectedQuantity;
                if ((user?.points || 0) >= totalPointsNeeded) {
                  // Ejecutamos la lógica de inyectar a la orden que creamos antes
                  handleCanjeDirecto(selectedCanje, selectedQuantity, selectedColor || selectedCanje.colors?.[0]);
                } else {
                  setProductoInsuficiente(selectedCanje);
                  setCantidadInsuficiente(selectedQuantity);
                  setShowCanjeModal(false);
                  setShowInsufficient(true);
                }
              }}
            >
              ¡LO QUIERO!
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

{/* MODAL PUNTOS INSUFICIENTES (IGUAL A CANJES) */}
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
            {(productoInsuficiente?.points || 0) * cantidadInsuficiente - (user?.points || 0)} pts
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
    </div>
  );
};

export default PaymentSuccess;