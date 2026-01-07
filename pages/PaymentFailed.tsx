import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, CreditCard, MessageCircle } from 'lucide-react'; // Quitamos HelpCircle si no se usa
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const PaymentFailed = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen relative overflow-x-hidden flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-12 max-w-lg sm:max-w-xl lg:max-w-2xl w-full text-center relative z-10"
      >
        {/* Icono con SHAKE ligero para denotar error */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ 
            scale: 1,
            x: [0, -5, 5, -5, 5, 0] // El ligero movimiento de error
          }}
          transition={{ 
            scale: { delay: 0.2, type: "spring", stiffness: 500 },
            x: { delay: 0.6, duration: 0.4 } 
          }}
          className="w-24 sm:w-32 h-24 sm:h-32 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <XCircle size={80} className="hidden sm:block text-red-500" />
          <XCircle size={50} className="sm:hidden text-red-500" />
        </motion.div>

        <h1 className="text-3xl md:text-6xl sm:text-6xl font-black text-dark mb-6">
          Pago Rechazado
        </h1>

        <p className="text-lg sm:text-xl text-muted mb-8 leading-relaxed max-w-md mx-auto">
          No te preocupes, esto pasa a veces. Tu carrito sigue intacto y listo para cuando quieras intentarlo de nuevo.
        </p>

<div className="bg-slate-50 rounded-2xl p-5 sm:p-6 mb-10 max-w-lg mx-auto">
  <div className="flex items-center gap-3 text-left mb-4">
    <CreditCard className="text-accent" size={24} />
    <p className="font-semibold text-dark text-base sm:text-lg">Posibles causas:</p>
  </div>
  <ul className="text-muted text-left space-y-3 ml-8 sm:ml-10 text-sm sm:text-base">
    <li className="flex items-center gap-2">
      <div className="w-2 h-2 bg-red-400 rounded-full shrink-0" />
      Fondos insuficientes
    </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full" /> Datos de tarjeta incorrectos
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full" /> Tarjeta bloqueada por seguridad
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full" /> Límite diario alcanzado
            </li>
          </ul>
        </div>

<p className="text-base sm:text-lg text-muted mb-10 max-w-md mx-auto font-medium">
  Si el problema persiste o prefieres atención personalizada, nuestro equipo técnico está listo para ayudarte por WhatsApp.
</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
<Button 
      variant="primary" 
      className="flex-1 px-10 py-4 sm:py-5 text-lg shadow-2xl hover:shadow-accent/30 transition-shadow"
      onClick={() => navigate('/checkout')}
    >
      Reintentar Pago
    </Button>
    <Button 
      variant="ghost" 
      className="flex-1 px-10 py-3 sm:py-5 text-lg"
      onClick={() => navigate('/')}
    >
      Volver al Inicio
    </Button>
  </div>
  <motion.a
    href="https://wa.me/51999999999?text=Hola%20Xtreme%20Group,%20tuve%20un%20problema%20con%20mi%20pago%20y%20necesito%20ayuda."
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="flex items-center justify-center gap-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-200 transition-all mt-6"
  >
    <MessageCircle size={24} />
    Asistencia por WhatsApp
  </motion.a>
      </motion.div>
    </div>
  );
};

export default PaymentFailed;