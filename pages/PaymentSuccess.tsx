import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileDown, CheckCircle, Share2 } from 'lucide-react'; // Añadimos FileDown
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
  const [animatedPoints, setAnimatedPoints] = useState(0); // El número que se mueve

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
      id: Math.floor(100000 + Math.random() * 900000).toString(),
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
          className="w-32 h-32 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle size={80} className="text-accent" />
        </motion.div>

        <h1 className="text-5xl md:text-6xl font-black text-dark mb-6">
          ¡Pago Exitoso!
        </h1>

        <p className="text-xl text-muted mb-6">
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
      <span className="text-6xl md:text-7xl drop-shadow-lg">⭐</span>
    </motion.div>
    
{/* Verificamos si hubo movimiento de puntos en el resumen */}
{(summary.earned > 0 || summary.spent > 0) ? (
    <div>
    <p className="text-2xl md:text-3xl font-black text-accent tabular-nums">
      {summary.points >= 0 
        ? `¡Balance: +${animatedPoints} puntos!` 
        : `¡Balance: ${animatedPoints} puntos!`}
    </p>

    <div className="flex gap-4 mt-2 text-sm font-medium text-muted justify-center">
      <span className="text-green-600">+{summary.earned} ganados</span>
      <span className="text-red-500">-{summary.spent} canjeados</span>
    </div>

    <motion.p 
      className="text-lg text-muted mt-4 bg-slate-50 border border-slate-100 px-6 py-2 rounded-full"
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
      className="text-lg text-muted mt-4 bg-slate-50 border border-slate-100 px-6 py-2 rounded-full shadow-sm"
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

        <p className="text-lg text-muted mb-12">
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
      className="px-10 py-5 text-lg shadow-2xl hover:shadow-accent/30 transition-shadow flex-1"
      onClick={() => navigate('/equipamiento')}
    >
      Seguir Comprando
    </Button>
    <Button 
      variant="ghost" 
      className="px-10 py-5 text-lg flex-1"
      onClick={() => navigate('/')}
    >
      Ir al Inicio
    </Button>
  </div>
</div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;