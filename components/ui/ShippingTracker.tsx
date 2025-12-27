import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, CheckCircle, X } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useUser } from '../../contexts/UserContext';

const ShippingTracker: React.FC = () => {
  const { cart } = useCart();
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  // Solo mostrar si es Prime Basic y hay items
  if (user?.subscription !== 'prime_basic' || cart.length === 0) return null;

  const subtotal = cart.reduce((sum, item) => {
    return item.pointsCost > 0 ? sum : sum + item.product.price * item.quantity;
  }, 0);

  const GOAL = 3000;
  const progress = Math.min((subtotal / GOAL) * 100, 100);
  const remaining = Math.max(GOAL - subtotal, 0);

  return (
    <div className="fixed bottom-32 right-8 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-80 bg-white rounded-3xl shadow-2xl border border-blue-100 p-5 overflow-hidden relative"
          >
            {/* Botón Cerrar */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent pointer-events-none" />

            <div className="relative z-10">
              {progress < 100 ? (
                <>
                  <div className="flex flex-col mb-3">
                    <span className="text-2x1 font-black text-accent uppercase mb-1">
                      Beneficio Envío Gratis
                    </span>
                    <span className="text-sm text-dark font-black mb-1">
                      S/ {subtotal.toLocaleString()} de S/ {GOAL}
                    </span>
                  </div>

                  {/* Barra de Progreso */}
                  <div className="relative h-3 bg-slate-100 rounded-full mb-3 shadow-inner">
                    <motion.div
                      className="absolute top-0 left-0 h-full bg-accent rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ type: "spring", stiffness: 50 }}
                    />
                    {/* Icono Mini Truck siguiendo la barra */}
                    <motion.div
                      className="absolute -top-1/2"
                      animate={{ left: `${progress}%` }}
                      style={{ x: "-50%" }}
                    >
                      <Truck size={24} className="text-accent fill-white" />
                    </motion.div>
                  </div>

                  <p className="text-[13px] text-slate-500 font-medium">
                    Agrega <span className="text-accent font-black">S/ {remaining.toFixed(2)}</span> más para no pagar envío.
                  </p>
                </>
              ) : (
                <motion.div 
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-3 py-1"
                >
                  <div className="bg-accent p-2 rounded-full shadow-lg">
                    <CheckCircle size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-accent font-black text-sm">¡ENVÍO GRATIS!</h3>
                    <p className="text-[10px] text-dark font-black uppercase mt-1">Suscripción<span className="text-[10px] text-accent font-black uppercase"> Prime Básica </span>Activa</p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ICONO DISPARADOR (Estilo idéntico a tu CartIcon) */}

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-accent text-white p-4 rounded-full shadow-2xl cursor-pointer hover:scale-110 transition-transform"
      >
        <motion.div
          animate={progress === 100 ? { rotate: [0, 10, -10, 0] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Truck size={38} />
        </motion.div>
        
        {/* Indicador de porcentaje sobre el icono */}
        <span className="absolute -top-4 -right-3 bg-red-500 text-white text-sm rounded-full w-10 h-10 flex items-center justify-center font-bold">
  {Math.round(progress)}%
</span>
      </motion.div>
    </div>
  );
};

export default ShippingTracker;