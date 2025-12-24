import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import CartPanel from './CartPanel';

const CartIcon: React.FC = () => {
  const { cartCount, clearCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleLogout = () => {
      clearCart();
    };
    window.addEventListener('logout', handleLogout);
    return () => window.removeEventListener('logout', handleLogout);
  }, [clearCart]);

  if (cartCount === 0) return null;

  return (
    <>
      {/* Icono del carrito */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="fixed bottom-8 right-8 z-50 flex items-center justify-center cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <motion.div
          className="relative bg-accent text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ShoppingCart size={36} />
          <motion.span
            className="absolute -top-2 -right-2 bg-red-500 text-white text-sm rounded-full w-8 h-8 flex items-center justify-center font-bold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
          >
            {cartCount}
          </motion.span>
        </motion.div>
      </motion.div>

      {/* Panel del carrito */}
      <CartPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default CartIcon;