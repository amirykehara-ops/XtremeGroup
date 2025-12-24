import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import { Gift, ChevronDown, FileDown } from 'lucide-react';
import Button from '../components/ui/Button';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  img: string;
  points: number;
}

interface Order {
  id: string;
  date: string;
  total: number;
  status: 'pending' | 'shipped' | 'delivered';
  items: OrderItem[];
  pointsEarned: number;
  isExchange: boolean;
  pointsUsed: number;
}

const ExchangeHistory: React.FC = () => {
  const { user } = useUser();
  const [expandedExchange, setExpandedExchange] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'shipped' | 'delivered'>('all');
  const [exchanges, setExchanges] = useState<Order[]>([]);

  useEffect(() => {
    if (user) {
      const savedAllOrders = localStorage.getItem('all_orders');
      if (savedAllOrders) {
        const allOrders: Order[] = JSON.parse(savedAllOrders);
        const myExchanges = allOrders.filter((o: any) => 
          (o.customerEmail === user.email || o.userEmail === user.email) && o.isExchange === true
        );
        setExchanges(myExchanges);  
      }
      
    }
  }, [user]);

  if (!user) {
    return (
      <div className="pt-28 pb-20 px-6 text-center">
        <p className="text-2xl text-muted">Inicia sesión para ver tu historial de canjes</p>
      </div>
    );
  }

  const downloadExchangePDF = (exchange: Order) => {
    const doc = new jsPDF();

    // Encabezado púrpura premium
    doc.setFontSize(22);
    doc.setTextColor(147, 51, 234); // Púrpura XTREME
    doc.text('XTREME GROUP - COMPROBANTE DE CANJE', 14, 25);

    doc.setFontSize(11);
    doc.setTextColor(80);
    doc.text(`Canje ID: #${exchange.id}`, 14, 35);
    doc.text(`Fecha: ${exchange.date}`, 14, 42);
    doc.text(`Cliente: ${user?.name || user?.email}`, 14, 49);
    doc.text(`Estado: Entregado`, 14, 56);

    // Tabla de premios canjeados
    const tableData = exchange.items.map(item => [
      item.title,
      item.quantity,
      'CANJE GRATIS',
      `${item.quantity * item.price} pts`
    ]);

    autoTable(doc, {
      startY: 70,
      head: [['Premio', 'Cantidad', 'Tipo', 'Puntos']],
      body: tableData,
      headStyles: { fillColor: [147, 51, 234] }, // Púrpura
      styles: { fontSize: 10 },
    });

    // Total puntos usados
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`PUNTOS CANJEADOS: ${exchange.pointsUsed} pts`, 14, finalY);

    doc.save(`Canje-Xtreme-${exchange.id}.pdf`);
  };

  const filteredExchanges = exchanges.filter(exchange => 
  filter === 'all' || exchange.status === filter
);

  return (
    <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl md:text-6xl font-black text-purple-600 mb-4">
          Historial de Canjes
        </h1>
        <p className="text-xl text-muted max-w-xl mx-auto">
          Revisa todos los premios que has canjeado con tus puntos XTREME
        </p>
   </motion.div>

{/* FILTROS AQUÍ – FUERA DEL TÍTULO */}
<div className="flex flex-wrap justify-center gap-4 mb-16">
  {(['all', 'pending', 'shipped', 'delivered'] as const).map((f) => (
    <Button
      key={f}
      variant={filter === f ? 'primary' : 'ghost'}
      onClick={() => setFilter(f)}
      className={`px-8 py-3.5 rounded-full font-black text-black transition-all ${
        filter === f 
          ? 'bg-gradient-to-r text-black shadow-xl' 
          : 'bg-slate-100 text-muted'
      }`}
    >
      {f === 'all' ? 'Todos' : 
       f === 'pending' ? 'Pendiente' : 
       f === 'shipped' ? 'Enviado' : 
       'Entregado'}
    </Button>
  ))}
</div>

      <div className="space-y-8">
        <AnimatePresence>
{filteredExchanges.length > 0 ? (
  filteredExchanges.map((exchange, index) => (
              <motion.div
                key={exchange.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-3xl shadow-2xl border border-purple-200 bg-gradient-to-r from-white to-purple-50/30 overflow-hidden transition-all"
              >
                {/* Header del canje */}
                <div 
                  className="p-8 cursor-pointer hover:bg-purple-50/50 transition-colors flex items-center justify-between gap-6"
                  onClick={() => setExpandedExchange(expandedExchange === exchange.id ? null : exchange.id)}
                >
                  <div className="flex items-center gap-6">
                    <div className="p-4 rounded-2xl bg-purple-100 shadow-inner">
                      <Gift className="text-purple-600" size={24} />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-dark">
                        Canje #{exchange.id}
                      </p>
                      <p className="text-muted">{exchange.date}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-black text-purple-600">
                      -{exchange.pointsUsed} pts
                    </p>
                        <div className="flex items-center gap-3 mt-2">
                        <p className="text-sm text-muted">Premio canjeado</p>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-black text-white shadow-md ${
                            exchange.status === 'delivered' ? 'bg-green-500' :
                            exchange.status === 'shipped' ? 'bg-blue-500' :
                            'bg-orange-500'
                        }`}>
                            {exchange.status === 'pending' ? 'Pendiente' :
                            exchange.status === 'shipped' ? 'Enviado' :
                            'Entregado'}
                        </span>
                        </div>
                  </div>

                  <motion.div 
                    animate={{ rotate: expandedExchange === exchange.id ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={24} className="text-muted" />
                  </motion.div>
                </div>

                {/* Detalle expandido */}
                <AnimatePresence>
                  {expandedExchange === exchange.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, type: "spring" }}
                      className="border-t border-purple-100 bg-purple-50/30 p-8 space-y-6"
                    >
                      <h3 className="text-xl font-bold text-dark mb-4">Premios canjeados</h3>
                      <div className="space-y-4">
                        {exchange.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-md border border-purple-100">
                            <img 
                              src={item.img} 
                              alt={item.title}
                              className="w-20 h-20 object-contain rounded-xl"
                            />
                            <div className="flex-1">
                              <p className="font-bold text-dark">{item.title}</p>
                              <p className="text-muted text-sm">Cantidad: {item.quantity}</p>
                              <p className="text-purple-600 font-bold mt-1">
                                {item.points ? item.quantity * item.points : 'Gratis'} pts
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-6 border-t border-purple-200 flex justify-end">
                        <Button 
                          variant="ghost" 
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadExchangePDF(exchange);
                          }}
                          className="flex items-center gap-2 border-2 border-purple-200 hover:border-purple-600 hover:text-purple-600 rounded-2xl px-6 py-3 transition-all font-bold"
                        >
                          <FileDown size={20} />
                          Descargar Comprobante
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Gift size={80} className="text-purple-400 mx-auto mb-6" />
              <p className="text-2xl text-muted">
      {filter === 'all' ? 'Aún no tienes canjes' : 'No hay canjes en este estado'}
    </p>
              <p className="text-muted mt-4">Gana puntos comprando y canjea premios exclusivos</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExchangeHistory;