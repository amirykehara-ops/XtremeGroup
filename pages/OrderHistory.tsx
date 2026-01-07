import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import { useCart } from '../contexts/CartContext';
import { Package, Truck, CheckCircle, Clock, ChevronDown, ChevronUp, ShoppingBag, Gift, Link, Star, FileDown } from 'lucide-react';
import Button from '../components/ui/Button';
import { Product } from '../types'; // Asegúrate de importar tu tipo Product
import jsPDF from 'jspdf'; // <--- Añade esta
import autoTable from 'jspdf-autotable';

// Tipo de Order (alineado con tu web)
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
  isExchange?: boolean; // ← Nuevo: Para detectar canjes
  pointsUsed?: number;

}

const OrderHistory: React.FC = () => {
  const { user } = useUser();
  const { addToCart } = useCart();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'shipped' | 'delivered'>('all');
  const [orders, setOrders] = useState<Order[]>([]);

useEffect(() => {
  if (user) {
    // Leemos de la "bolsa global"
    const savedAllOrders = localStorage.getItem('all_orders');
    if (savedAllOrders) {
      const allOrders: Order[] = JSON.parse(savedAllOrders);

      // Filtramos solo los pedidos que pertenecen a este usuario
const myAllOrders = allOrders.filter((o: any) => 
  o.customerEmail === user.email || o.userEmail === user.email
);

// ← AQUÍ FILTRAMOS: solo los que NO son canjes
const myPurchases = myAllOrders.filter((o: Order) => !o.isExchange);

setOrders(myPurchases);
    }
  }
}, [user]);

  if (!user) {
    return (
      <div className="pt-28 pb-20 px-6 text-center">
        <p className="text-2xl text-muted">Inicia sesión para ver tu historial de pedidos</p>
      </div>
    );
  }

  const filteredOrders = orders.filter(order => 
    filter === 'all' || order.status === filter
  );

const getStatusIcon = (status: Order['status']) => {
  switch (status) {
    case 'pending': return <Clock className="text-orange-500" size={24} />;
    case 'shipped': return <Truck className="text-blue-500" size={24} />;
    case 'delivered': return <CheckCircle className="text-green-500" size={24} />;
    default: return <Package className="text-muted" size={24} />;
  }
};
  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregado';
    }
  };

  const handleBuyAgain = (item: OrderItem) => {
    // Crea un Product a partir del item (id, title, price, img – sin quantity)
    const product: Product = {  
      id: Number(item.id),
      title: item.title,
      price: item.price,
      img: item.img,
      // Añade otros campos de Product si son requeridos (ej: category: '', desc: '', etc.)
      category: 'Equipamiento', // Si es requerido, pon un default
      desc: '',
      specs: [],
      points: item.points || Math.floor(item.price / 10),
      ben:'',
      ind: '',
      stock: true // O lo que uses para points
    };

    // Añade al carrito el product con la quantity del item
    addToCart(product, item.quantity);
    alert(`${item.title} agregado al carrito nuevamente`);
  };

const downloadOrderPDF = (order: Order) => {
  const doc = new jsPDF();

  // Título grande en color accent
  doc.setFontSize(22);
  doc.setTextColor(20, 184, 166); // Tu color XTREME teal
  doc.text('XTREME GROUP - COMPROBANTE DE COMPRA', 14, 25);

  // Información básica
  doc.setFontSize(11);
  doc.setTextColor(80);
  doc.text(`Orden ID: #${order.id}`, 14, 35);
  doc.text(`Fecha: ${order.date}`, 14, 42);
  doc.text(`Cliente: ${user?.name || user?.email}`, 14, 49);
  doc.text(`Estado: ${getStatusText(order.status)}`, 14, 56);

  // Tabla de productos
  const tableData = order.items.map(item => [
    item.title,
    item.quantity,
    `S/. ${item.price.toLocaleString('es-PE')}`,
    `S/. ${(item.price * item.quantity).toLocaleString('es-PE')}`
  ]);

  autoTable(doc, {
    startY: 70,
    head: [['Producto', 'Cantidad', 'Precio Unit.', 'Subtotal']],
    body: tableData,
    headStyles: { fillColor: [20, 184, 166] }, // Siempre color XTREME
    styles: { fontSize: 10 },
  });

  // Total final
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(`TOTAL PAGADO: S/. ${order.total.toLocaleString('es-PE')}`, 14, finalY);
  doc.text(`PUNTOS GANADOS: +${order.pointsEarned} pts`, 14, finalY + 10);

  // Guardar
  doc.save(`Compra-Xtreme-${order.id}.pdf`);
};

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-3xl md:text-6xl sm:text-6xl font-black text-dark mb-4">
          Historial de Compras
        </h1>
        <p className="text-lg sm:text-xl text-muted max-w-xl mx-auto">Revisa tus compras, puntos ganados y vuelve a comprar fácilmente</p>
      </motion.div>

      {/* Filtros */}
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-10 lg:mb-12">
        {(['all', 'pending', 'shipped', 'delivered'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'primary' : 'ghost'}
            onClick={() => setFilter(f)}
            className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm sm:text-base"
          >
            {f === 'all' ? 'Todos' : getStatusText(f)}
          </Button>
        ))}
      </div>

      {/* Lista de pedidos */}
      <div className="space-y-8">
        <AnimatePresence>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-3xl shadow-2xl border border-slate-100 bg-white overflow-hidden transition-all"
              >
                {/* Header del pedido */}
                <div 
                  className="p-6 sm:p-8 cursor-pointer hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    <div className={`p-4 rounded-2xl shadow-inner ${order.isExchange ? 'bg-purple-100' : 'bg-slate-50'}`}>
                      {getStatusIcon(order.status)} {/* ← Antes decía order.status, ahora solo order */}
                    </div>
                  <div>
                  <p className="text-lg sm:text-xl font-bold text-dark">
  Orden #{order.id}
</p>
                    <p className="text-muted text-sm sm:text-base">{order.date}</p>
                  </div>
                  </div>

<div className="text-left sm:text-right mt-4 sm:mt-0">
  <p className="text-xl sm:text-2xl font-black text-accent">
    S/. {order.total.toLocaleString('es-PE')}
  </p>
  <p className="text-xs sm:text-sm text-muted mt-2 flex items-center gap-2 justify-center sm:justify-end">
    <Gift size={16} className="text-accent" />
    +{order.pointsEarned} puntos ganados
  </p>
</div>

                  <motion.div 
                    animate={{ rotate: expandedOrder === order.id ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={24} className="text-muted" />
                  </motion.div>
                </div>

                {/* Detalle expandible */}
                <AnimatePresence>
                  {expandedOrder === order.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, type: "spring" }}
                      className="border-t border-slate-100 bg-slate-50/50 p-6 sm:p-8 space-y-6"
                    >
                      <h3 className="text-xl font-bold text-dark mb-4">Productos en este pedido</h3>
                      <div className="space-y-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex flex-col sm:flex-row items-start gap-4 bg-white rounded-2xl p-4 shadow-md border border-slate-100">
                            <img 
                              src={item.img}
                              alt={item.title}
                              className="w-20 h-20 object-contain rounded-xl self-center sm:self-start"
                            />
                            <div className="flex-1 text-left">
                              <p className="font-bold text-dark">{item.title}</p>
                              <p className="text-muted text-sm">Cantidad: {item.quantity}</p>
                              <p className="text-accent font-bold mt-1">
                                S/. {(item.price * item.quantity).toLocaleString('es-PE')}
                              </p>
                            </div>
                          {!order.isExchange && (
                            <Button 
                              variant="ghost"
                              onClick={() => handleBuyAgain(item)}
                              className="w-full sm:w-auto mt-4 sm:mt-0 px-4 py-2 text-sm"
                            >
                              Comprar de nuevo
                            </Button>
                          )}
                          </div>
                        ))}
                      </div>
                    {/* BUSCA: <div className="pt-6 border-t ..."> */}
                                      {/* REEMPLAZA EL BLOQUE DEL TOTAL FINAL POR ESTE: */}
                    <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-6">
  <div className="text-center sm:text-left">
    <span className="text-sm text-muted font-bold uppercase">
      {order.isExchange ? 'Puntos Canjeados' : 'Inversión Total'}
    </span>
    <span className={`text-xl sm:text-2xl font-black block mt-1 ${order.isExchange ? 'text-purple-600' : 'text-accent'}`}>
      {order.isExchange 
        ? `${order.pointsUsed} pts` 
        : `S/. ${order.total.toLocaleString('es-PE')}`
      }
    </span>
  </div>

  <Button 
    variant="ghost" 
    onClick={(e) => {
      e.stopPropagation();
      downloadOrderPDF(order);
    }}
    className="w-full sm:w-auto flex items-center justify-center gap-2 border-2 border-slate-300 hover:border-accent hover:text-accent rounded-2xl px-6 py-3 transition-all font-bold text-sm sm:text-base"
  >
    <FileDown size={18} />
    Descargar Comprobante PDF
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
              <Package size={80} className="text-muted mx-auto mb-6" />
              <p className="text-xl sm:text-2xl text-muted">No tienes pedidos aún</p>
<p className="text-base sm:text-lg text-muted mt-4 max-w-md mx-auto">
                Explora nuestro catálogo y realiza tu primera compra
              </p>
              <Link to="/equipamiento">
                <Button variant="primary" className="mt-8 px-8 py-4 text-lg">
                  Ir al Catálogo
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrderHistory;