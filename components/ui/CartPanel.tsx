import React from 'react';
import { motion } from 'framer-motion';
import { X, Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import Button from './Button';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';  // ← Añade este import

interface CartPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartPanel: React.FC<CartPanelProps> = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, removeFromCart, clearCart, cartCount } = useCart();
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalSoles = cart.reduce((sum, item) => sum + (item.pointsCost > 0 ? 0 : item.product.price * item.quantity), 0);
const totalPuntos = cart.reduce((sum, item) => sum + (item.pointsCost || 0) * item.quantity, 0);
  const navigate = useNavigate();  
  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 0.5 : 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black z-40"
      />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 overflow-y-auto"
      >
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-center">
            <ShoppingBag size={28} className="text-accent" />
            Tu Carrito ({cartCount})
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 flex-1">
          {cart.length === 0 ? (
            <p className="text-center text-muted py-20">Tu carrito está vacío</p>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                  <div 
                    key={`${item.product.id}-${item.color || 'default'}`} 
                    className={`rounded-2xl p-4 ${item.pointsCost > 0 ? 'bg-purple-50 border border-purple-300' : 'bg-slate-50'}`}
                  >
                  
                  <div className="flex items-start gap-4">
                    <img src={item.product.img} alt={item.product.title} className="w-20 h-20 object-cover rounded-xl" />
                    <div className="flex-1">
                      <h3 className="font-bold text-dark">{item.product.title}</h3>
                      {item.color && <p className="text-sm text-muted">Color: {item.color}</p>}
{item.pointsCost > 0 ? (
  <>
    <p className="text-accent font-bold text-purple-600">S/. 0.00</p>
    <p className="text-sm text-purple-700 font-medium mt-1">
      Canje por {item.pointsCost * item.quantity} pts
    </p>
  </>
) : (
  <p className="text-accent font-bold">
    S/ {item.product.price.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
  </p>
)}
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.product.id, item.color)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.color, -1)}
                        className="p-2 hover:bg-slate-200 rounded-full"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="text-lg font-bold w-10 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.color, 1)}
                        className="p-2 hover:bg-slate-200 rounded-full"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t bg-white">
            <div className="flex justify-between text-2xl font-bold mb-6">
              <span>Total</span>
<span className={totalSoles > 0 ? 'text-accent' : 'text-purple-600'}>
    {totalSoles > 0 && totalPuntos > 0 ? (
      <>
        S/ {totalSoles.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} + <span className="text-purple-600">{totalPuntos} pts</span>
      </>
    ) : totalSoles > 0 ? (
      `S/ ${totalSoles.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ) : totalPuntos > 0 ? (
      `${totalPuntos} pts`
    ) : (
      'S/. 0.00'
    )}
  </span>
            </div>
            <Button variant="primary" className="w-full mb-3" onClick={
                () =>{
                onClose();
                 navigate('/checkout')}}>
            Proceder al Checkout
            </Button>
            <Button variant="ghost" className="w-full" onClick={clearCart}>
              Vaciar Carrito
            </Button>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default CartPanel;