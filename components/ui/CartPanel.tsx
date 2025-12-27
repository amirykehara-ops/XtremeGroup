import React , {useState} from 'react';
import { X, Trash2, Minus, Plus, ShoppingBag, Flame, Star } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';  // ← Añade este import
import { Product } from '../../types';


interface CartPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartPanel: React.FC<CartPanelProps> = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, removeFromCart, clearCart, cartCount } = useCart();
  const { user } = useUser();
const [showInsufficient, setShowInsufficient] = useState(false);
const [productoInsuficiente, setProductoInsuficiente] = useState<Product | null>(null);
const [cantidadInsuficiente, setCantidadInsuficiente] = useState(1);
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalSoles = cart.reduce((sum, item) => sum + (item.pointsCost > 0 ? 0 : item.product.price * item.quantity), 0);
const totalPuntos = cart.reduce((sum, item) => sum + (item.pointsCost || 0), 0);
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
  <div className="text-left">
    <p className="text-sm text-purple-700 font-medium">
      Canje por <span className="text-xl font-black text-purple-600">{item.pointsCost || 0} pts</span>
    </p>
  </div>
) : (
  <p className="text-accent font-bold">
    S/ {(item.product.price * item.quantity).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
  onClick={() => {
    if (item.pointsCost > 0) {
      // Calculamos costo por unidad correctamente
      const unitCost = item.pointsCost / item.quantity;
      const newQuantity = item.quantity - 1;

      if (newQuantity < 1) {
        removeFromCart(item.product.id, item.color);
        return;
      }

      const pointsNeeded = Math.round(unitCost * newQuantity); // redondeamos por si hay decimales
      if ((user?.points || 0) < pointsNeeded) {
        setProductoInsuficiente(item.product);
        setCantidadInsuficiente(newQuantity);
        setShowInsufficient(true);
        return;
      }
    }
    updateQuantity(item.product.id, item.color, -1);
  }}
  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
>
  <Minus size={16} />
</button>

<span className="text-lg font-bold w-10 text-center">{item.quantity}</span>

<button 
  onClick={() => {
    if (item.pointsCost > 0) {
      const unitCost = item.pointsCost / item.quantity;
      const newQuantity = item.quantity + 1;
      const pointsNeeded = Math.round(unitCost * newQuantity);

      if ((user?.points || 0) < pointsNeeded) {
        setProductoInsuficiente(item.product);
        setCantidadInsuficiente(newQuantity);
        setShowInsufficient(true);
        return;
      }
    }
    updateQuantity(item.product.id, item.color, 1);
  }}
  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
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
        {/* Modal Puntos Insuficientes en Carrito */}
<AnimatePresence>
  {showInsufficient && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
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
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          className="absolute top-4 right-6"
        >
          <Flame size={48} className="text-yellow-300 drop-shadow-lg" />
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
          className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md"
        >
          <Star size={48} className="text-yellow-300" />
        </motion.div>

        <h2 className="text-3xl font-black mb-4">
          ¡Casi lo tienes: {productoInsuficiente?.title || 'este premio'}!
          {cantidadInsuficiente > 1 && ` (x${cantidadInsuficiente})`}
        </h2>
        <p className="text-lg mb-6 leading-relaxed">
          Te faltan <span className="text-4xl font-black">
            {(productoInsuficiente ? (productoInsuficiente.points * cantidadInsuficiente) - (user?.points || 0) : 0)} pts
          </span> para canjear este premio.
        </p>
        <p className="text-lg mb-8 opacity-90">
          <span className="font-bold">¡Compra ahora</span> y desbloquéalo al instante. ¡Oferta limitada!
        </p>
        <Button 
          variant="primary" 
          className="w-full py-4 text-lg bg-white text-red-600 hover:bg-white/90" 
          onClick={() => {
            setShowInsufficient(false);
            navigate('/canjes');
          }}
        >
          Ir a Comprar y Ganar Puntos
        </Button>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
      </motion.div>
    </>
  );
};

export default CartPanel;