import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import { Gift, Star, ChevronDown, PackageCheck } from 'lucide-react';

const CanjeHistory: React.FC = () => {
  const { user } = useUser();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem('all_orders');
      if (saved) {
        const all = JSON.parse(saved);
        // FILTRO: Solo los que tienen isExchange: true
        setOrders(all.filter((o: any) => (o.customerEmail === user.email || o.userEmail === user.email) && o.isExchange));
      }
    }
  }, [user]);

  return (
    <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-black text-dark mb-4">Mis <span className="text-purple-600">Canjes</span></h1>
        <p className="text-xl text-muted">Premios obtenidos con tu esfuerzo y puntos acumulados</p>
      </motion.div>

      <div className="space-y-8">
        {orders.length > 0 ? orders.map((order, index) => (
          <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
            className="rounded-3xl shadow-2xl border border-purple-200 bg-gradient-to-r from-white to-purple-50/30 overflow-hidden"
          >
            <div className="p-8 cursor-pointer flex items-center justify-between" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
              <div className="flex items-center gap-6">
                <div className="p-4 rounded-2xl bg-purple-100"><Gift className="text-purple-600" size={24} /></div>
                <div>
                  <p className="text-xl font-bold text-dark">Canje de Premio</p>
                  <p className="text-muted text-sm">{order.date}</p>
                </div>
              </div>
              <div className="text-right flex items-center gap-8">
                <div>
                  <p className="text-2xl font-black text-purple-600">-{order.pointsUsed} pts</p>
                  <p className="text-sm text-purple-500 font-bold flex items-center justify-end gap-1"><Star size={14}/> Premio Reclamado</p>
                </div>
                <motion.div animate={{ rotate: expandedOrder === order.id ? 180 : 0 }}><ChevronDown className="text-muted" /></motion.div>
              </div>
            </div>

            {expandedOrder === order.id && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="border-t border-purple-100 bg-white/50 p-8 space-y-6 overflow-hidden">
                <div className="space-y-4">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-md border border-purple-50">
                      <img src={item.img} alt={item.title} className="w-20 h-20 object-contain" />
                      <div>
                        <p className="font-black text-dark text-lg">{item.title}</p>
                        <p className="text-purple-600 font-bold">Costo de canje: {item.points} puntos</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t border-purple-100 flex justify-between items-center">
                   <div className="flex items-center gap-2 text-purple-700 font-black uppercase text-sm">
                      <PackageCheck size={20} /> Estado: Listado para entrega
                   </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )) : (
          <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
             <Gift size={60} className="mx-auto text-slate-300 mb-4" />
             <p className="text-slate-400 font-black italic">Aún no has realizado canjes.</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default CanjeHistory;