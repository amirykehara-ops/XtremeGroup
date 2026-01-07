import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom'; 
import { X, Check } from 'lucide-react';
import { Product } from '../../types';
import Button from './Button';
import { useUser } from '../../contexts/UserContext';
import { getUserBenefits, getSubscriptionColor } from '../../constants';
 // ← Agrega esto

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

  // ← Agrega esto
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, product }) => {
  const navigate = useNavigate();
  // Prevent body scroll when modal is open
  const location = useLocation();
  const { user } = useUser();

// NUEVA LÓGICA DE SUSCRIPCIÓN
const benefits = getUserBenefits(user?.subscription || 'regular');
const discountPercent = benefits.discount;
const badgeColor = getSubscriptionColor(user?.subscription || 'regular');
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!product) return null;

  return (
    <AnimatePresence>
  {isOpen && (
    <>
      {/* Fondo oscuro */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-dark/80 backdrop-blur-sm z-[9999]"
      />

      {/* Contenedor centrado con Flexbox (la clave) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      >
        {/* El modal en sí */}
        <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-y-auto border border-accent/10 flex flex-col md:grid md:grid-cols-2">
          
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <X size={24} />
          </button>

          {/* === TODO EL CONTENIDO QUE YA TENÍAS (imagen + texto) === */}
          {/* Image Section */}
          <div className="bg-slate-50 p-8 flex items-center justify-center min-h-[300px] relative overflow-hidden">
            <div className="absolute inset-0 bg-accent/5 rounded-full blur-3xl scale-150 translate-x-10 translate-y-10"></div>
            <motion.img
              src={product.img}
              alt={product.title}
              className="relative z-10 max-w-full max-h-[300px] md:max-h-[400px] object-contain drop-shadow-xl"
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </div>

          {/* Content Section */}
          <div className="p-8 md:p-12 flex flex-col">
            <span className="inline-block px-3 py-1 bg-accent/10 text-accent font-bold text-xs rounded-full w-fit mb-4 uppercase tracking-wider">
              {product.category}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-dark mb-4 leading-tight">{product.title}</h2>
            <p className="text-muted text-base md:text-lg mb-6 leading-relaxed whitespace-pre-line">
              {product.desc}
            </p>

                                                    {/* Precio con descuento por nivel – Consistente con tu web, profesional y impactante */}
                          {user ? (
                            <div className="mt-6">
{/* PRECIO EXCLUSIVO PREMIUM – Mantiene tu estructura y colores, pero más impactante */}
<div className={`${badgeColor} rounded-2xl p-6 shadow-xl relative overflow-hidden border-2 border-white/20`}>
  {/* Brillo sutil animado */}
  <motion.div 
    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
    animate={{ x: ['-100%', '300%'] }}
    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
  />

  <div className="relative z-10 text-center">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.8 }}
    >
      <p className="text-sm sm:text-lg font-bold text-white/90 uppercase tracking-widest mb-auto">
        Precio Exclusivo
      </p>
      
      <p className="text-xl sm:text-3xl md:text-3xl font-black text-white drop-shadow-lg">
        {benefits.name}
      </p>

      <motion.p 
        className="text-2xl sm:text-3xl md:text-3xl font-extrabold text-white mt-2 drop-shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
      >
        S/. {(product.price * (1 - discountPercent / 100)).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </motion.p>
      </motion.div>
            </div>
          </div>


                            </div>
                          ) : (
                            <div className="mt-3">
                              <p className="text-sm text-muted font-black text-dark mb-2">Precio Online</p>
                              <p className="text-3xl text-accent md:text-4xl font-black">
                                S/. {product.price.toLocaleString('es-PE', { minimumFractionDigits: 0 })}
                              </p>
                            </div>
                          )}

            <div className="mt-6 mb-8">
              <h4 className="text-sm font-bold text-dark uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                Especificaciones
              </h4>
              <ul className="space-y-3">
                {product.specs.map((spec, index) => (
                  <li key={index} className="flex items-start text-muted text-sm md:text-base">
                    <Check size={18} className="text-green-500 mr-2 mt-0.5 shrink-0" />
                    {spec}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-4 mt-auto pt-4 md:pt-0">
              
              <Link 
                to={`/product/${product.id}`}
                className="flex-1"
                state={{ from: location.pathname.includes('clinica') ? 'clinica' : 'equipamiento' }}
                onClick={onClose}  // Cierra el modal al hacer clic
              >
                <Button variant="primary" className="w-full">
                  Ver Descripción Completa
                </Button>
              </Link>
            </div>
          </div>
          {/* === FIN DEL CONTENIDO === */}
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
  );
};

export default Modal;