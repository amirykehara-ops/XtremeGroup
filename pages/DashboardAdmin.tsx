  import React, { useState, useEffect } from 'react';
  import { motion, AnimatePresence } from 'framer-motion';
  import { useNavigate, Navigate } from 'react-router-dom';
  import { useUser } from '../contexts/UserContext';
  import Button from '../components/ui/Button';
  import { 
    BarChart3, Users, User, Package, Truck, FileText, Settings, 
    LogOut, Plus, Edit2, Trash2, ChevronDown, ChevronUp,
    Download, Search, CheckCircle2, Clock, PackageCheck, Trophy, Lock, Phone, Shield, MapPin, Zap, AlertCircle, CheckCircle
  } from 'lucide-react';
  import { PRODUCTS } from '../constants';
  import { Product } from '../types';
  import { CSVLink } from 'react-csv';
  import jsPDF from 'jspdf';
  import autoTable from 'jspdf-autotable';

  // --- INTERFACES ---
  interface AdminUser {
    id: string;
    email: string;
    name: string;
    points: number;
    level: 'Bronze' | 'Silver' | 'Gold';
    referralCode: string;
    phone: string;
    address: string;
    pointsHistory: { date: string; pointsChange: number; reason: string }[];
    subscription: 'regular' | 'prime_basic' | 'prime_pro'; // El tipo de plan
    subscriptionEndDate?: string;
  }

  interface AdminOrder {
    id: string;
    isExchange?: boolean;
    pointsUsed?: number;
    customerName?: string;
    customerEmail: string;
    date: string;
    total: number;
    status: 'pending' | 'shipped' | 'delivered';
    items: { id: string; title: string; price: number; quantity: number; img: string; }[];
    pointsEarned: number;
  }

  const InfoItem = ({ label, value, icon, color = "text-slate-600" }: any) => (
    <div className="flex flex-col">
      <span className="text-[9px] font-bold text-slate-300 uppercase leading-none mb-1">{label}</span>
      <span className={`text-xs font-bold flex items-center gap-1 ${color}`}>
        <span className="grayscale">{icon}</span> {value}
      </span>
    </div>
  );

  const ADMIN_EMAIL = 'admin';
  // Esta variable controla si el modal de creación está abierto o cerrado
  const DashboardAdmin: React.FC = () => {
    const { user, logout, updateUser } = useUser();
    const [activeSection, setActiveSection] = useState('estadisticas');
    // Alrededor de la línea donde están tus otros estados
  const [membershipFilter, setMembershipFilter] = useState<'all' | '1year' | '1month' | '1week' | '3days' | 'today'>('all');
    const getMembershipStats = () => {
    const now = new Date();
    
    // Función para calcular días restantes
    const getDaysLeft = (dateStr?: string) => {
      if (!dateStr) return 999;
const expiry = new Date(dateStr);
    const diffTime = expiry.getTime() - now.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };
    const expiring1Year = users.filter(u => u.subscription !== 'regular' && getDaysLeft(u.subscriptionEndDate) <= 365 && getDaysLeft(u.subscriptionEndDate) > 32);
    const expiring1Month = users.filter(u => u.subscription !== 'regular' && getDaysLeft(u.subscriptionEndDate) <= 32 && getDaysLeft(u.subscriptionEndDate) > 8);
    const expiring1Week = users.filter(u => u.subscription !== 'regular' && getDaysLeft(u.subscriptionEndDate) <= 8 && getDaysLeft(u.subscriptionEndDate) > 4);
    const expiring3Days = users.filter(u => u.subscription !== 'regular' && getDaysLeft(u.subscriptionEndDate) <= 4 && getDaysLeft(u.subscriptionEndDate) >= 2);
    const expiringToday = users.filter(u => u.subscription !== 'regular' && getDaysLeft(u.subscriptionEndDate) === 1);
    return {expiring1Year, expiring1Month, expiring1Week, expiring3Days, expiringToday };
    
  };
    // Estados de Datos
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    
    // Estados de UI
    const [expandedUser, setExpandedUser] = useState<string | null>(null);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isAddingProduct, setIsAddingProduct] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState<AdminUser | null>(null);
    {/* ESTADOS PARA MODALES */}
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [tempAdjustment, setTempAdjustment] = useState<{ change: number; reason: string } | null>(null);

  // Agrega estos estados arriba, con los otros useState

  // 1. CARGA DE DATOS CORREGIDA
    useEffect(() => {
      // Cargar Usuarios desde la llave correcta 'all_users'
      const savedUsers = localStorage.getItem('all_users');
      if (savedUsers && savedUsers !== "[]") {
        setUsers(JSON.parse(savedUsers));
      } else {
        // Si no hay nada, cargamos tu sesión para que no salga 0
        const sessionUser = localStorage.getItem('user');
        if (sessionUser) {
          const parsed = JSON.parse(sessionUser);
          const initial = [{ ...parsed, pointsHistory: [], subscription: 'regular' }];
          setUsers(initial);
          localStorage.setItem('all_users', JSON.stringify(initial));
        }
      }

      // Cargar Pedidos
      const savedOrders = localStorage.getItem('all_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));

      // Cargar Productos
      const savedProds = localStorage.getItem('admin_products');
      if (savedProds) setProducts(JSON.parse(savedProds));
      else setProducts(PRODUCTS);
    }, []);

    // 2. PERSISTENCIA ÚNICA (Solo una vez por cada dato)
    useEffect(() => {
      if (users.length > 0) {
        localStorage.setItem('all_users', JSON.stringify(users));
      }
    }, [users]);

    useEffect(() => {
      if (products.length > 0) {
        localStorage.setItem('admin_products', JSON.stringify(products));
      }
    }, [products]);

    const getStats = () => {
      // Sumamos el dinero de pedidos que NO sean canjes
      const totalMoney = orders
        ? orders.filter(o => !o.isExchange).reduce((sum, o) => sum + (o.total || 0), 0)
        : 0;

      // Conteo de usuarios reales
      const userCount = users.length;

      // Conteo de productos en stock
      const prodCount = products.length;

      // Membresías críticas (vencen pronto)
      const mStats = getMembershipStats();
      const criticalExpirations = mStats.expiringToday.length + mStats.expiring3Days.length;

      return { 
        total: totalMoney, 
        pending: orders ? orders.filter(o => o.status === 'pending').length : 0, 
        userCount, 
        prodCount,
        criticalExpirations 
      };
    };

    if (user?.email !== ADMIN_EMAIL) return <Navigate to="/" />;


    // 3. LÓGICA DE NEGOCIO (Tus funciones originales)
  const updateUserPoints = (userId: string, newPoints: number) => {
    setUsers((prev) => {
      const updatedUsers = prev.map((u) => {
        if (u.id === userId || u.email === userId) {
          const level: 'Bronze' | 'Silver' | 'Gold' = 
            newPoints >= 1000 ? 'Gold' : newPoints >= 500 ? 'Silver' : 'Bronze';
          return { ...u, points: newPoints, level };
        }
        return u;
      });

      // Guardamos en la "Base de Datos" global de usuarios
      // No necesitas hacer el setItem aquí manualmente porque el useEffect que 
  // pusimos arriba ya detecta el cambio en 'users' y lo guarda solo.
  // Solo asegúrate de actualizar el estado de React:
  setUsers(updatedUsers);
      
      // Solo si el Admin se está editando a sí mismo, actualizamos su sesión
      if (user && (userId === user.email || userId === user.id)) {
    updateUser({ points: newPoints });
  } 

      return updatedUsers;
    });
  };

    const changeOrderStatus = (orderId: string, newStatus: AdminOrder['status']) => {
    // 1. Actualizamos el estado local del Admin
    const updatedOrders = orders.map(o => 
      o.id === orderId ? { ...o, status: newStatus } : o
    );
    setOrders(updatedOrders);

    // 2. LO GUARDAMOS EN LA LISTA GLOBAL
    localStorage.setItem('all_orders', JSON.stringify(updatedOrders));
  };

    const deleteProduct = (id: number) => {
      if(window.confirm('¿Eliminar este producto?')) {
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    };

    const handleEditProduct = (e: React.FormEvent) => {
      
      e.preventDefault();
      if (!editingProduct) return;
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
      setEditingProduct(null);
    };

    // Añadir esta función debajo de handleEditProduct
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Obtenemos los valores de los inputs por su ID
    const title = (document.getElementById('new-title') as HTMLInputElement).value;
    const price = Number((document.getElementById('new-price') as HTMLInputElement).value);
    const category = (document.getElementById('new-category') as HTMLSelectElement).value;

    if (title && price) {
      const newProd: Product = {
        id: Date.now(),
        title,
        price,
        category,
        img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop', // Imagen genérica de equipo médico
        stock: true,
        desc: "Equipo de alta precisión para uso profesional.",
        ben: "Garantía Xtreme Group",
        ind: "Uso odontológico/médico",
        specs: ["Certificación internacional", "Garantía de 1 año"],
        points: Math.floor(price / 10),
        badge: "Nuevo"
      };

      const updated = [...products, newProd];
      setProducts(updated);
      // La persistencia ya la hace tu useEffect automáticamente, pero forzamos por seguridad:
      localStorage.setItem('admin_products', JSON.stringify(updated));
      setIsAddingProduct(false);
    } else {
      alert("Por favor rellena el título y el precio");
    }
  };

    // 4. REPORTES
    const generatePDF = () => {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('Xtreme Group - Reporte de Ventas', 14, 22);
      const tableData = orders.map(o => [o.id, o.customerEmail, o.date, `S/. ${o.total}`, o.status]);
      autoTable(doc, {
        head: [['ID', 'Usuario', 'Fecha', 'Total', 'Estado']],
        body: tableData,
        startY: 30,
      });
      doc.save('reporte-xtreme.pdf');
    };

    const getFilteredMemberships = () => {
    const { expiring1Year, expiring1Month, expiring1Week, expiring3Days, expiringToday } = getMembershipStats();
    
    // Si el filtro es 'all', mostramos todos los que tienen prime_pro
    // Si no, mostramos solo el grupo correspondiente
    switch (membershipFilter) {
      case '1year': return expiring1Year;
      case '1month': return expiring1Month;
      case '1week': return expiring1Week;
      case '3days': return expiring3Days;
      case 'today': return expiringToday;
      default: return users.filter(u => u.subscription);
    }
  };
  

    return (
      <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
        {/* SIDEBAR */}
        {/* --- MODAL PARA CREAR PRODUCTO (UBICACIÓN CORREGIDA) --- */}
  <AnimatePresence>
    {isAddingProduct && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl border border-slate-100"
        >
          <h2 className="text-2xl font-black text-dark mb-2">Nuevo Equipo</h2>
          <p className="text-muted text-sm mb-8">Registra un nuevo producto en el catálogo.</p>
          
          <form onSubmit={handleCreateProduct} className="space-y-5">
            <div>
              <label className="text-xs font-black text-accent uppercase tracking-widest ml-1 mb-2 block">Nombre del Producto</label>
              <input required id="new-title" type="text" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-accent outline-none transition-all font-bold" placeholder="Ej: Autoclave Pro v2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-accent uppercase tracking-widest ml-1 mb-2 block">Precio (S/)</label>
                <input required id="new-price" type="number" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-accent outline-none transition-all font-bold" placeholder="0.00" />
              </div>
              <div>
                <label className="text-xs font-black text-accent uppercase tracking-widest ml-1 mb-2 block">Categoría</label>
                <select id="new-category" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-accent outline-none transition-all font-bold">
                  <option>Motores Eléctricos</option>
                  <option>Lámparas</option>
                  <option>Mobiliario</option>
                  <option>Instrumental</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-10">
              <Button type="submit" variant="primary" className="flex-1 py-4 shadow-xl shadow-accent/20">
                Guardar Equipo
              </Button>
              <Button type="button" variant="ghost" onClick={() => setIsAddingProduct(false)} className="px-6">
                Cancelar
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col sticky top-20 h-[calc(100vh-5rem)]">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white font-bold"><User size={18} /></div>
              <span className="font-black text-dark text-lg">ADMIN PANEL</span>
            </div>
            <nav className="space-y-1">
  {[
    { id: 'estadisticas', icon: BarChart3, label: 'Resumen' },
    { id: 'usuarios', icon: Users, label: 'Usuarios' },
    { id: 'membresias', icon: Shield, label: 'Membresías' },
    { id: 'productos', icon: Package, label: 'Productos' },
    { id: 'pedidos', icon: Truck, label: 'Pedidos' },
    { id: 'reportes', icon: FileText, label: 'Reportes' },
  ].map(item => (
    <button
      key={item.id}
      onClick={() => setActiveSection(item.id)}
      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
        activeSection === item.id 
          ? 'bg-accent/10 text-accent shadow-sm' // Fondo suave para el activo
          : 'text-muted hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <item.icon size={18} /> 
        {item.label}
      </div>
      {/* Este puntito solo aparece si la sección está activa */}
      {activeSection === item.id && (
        <motion.div layoutId="activeDot" className="w-1.5 h-1.5 bg-accent rounded-full" />
      )}
    </button>
  ))}
            </nav>
          </div>
          <div className="mt-auto p-6 border-t">
            <button onClick={logout} className="flex items-center gap-3 text-sm font-bold text-red-500 w-full p-2 hover:bg-red-50 rounded-lg transition-all">
              <LogOut size={18} /> Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* CONTENIDO */}
        <main className="flex-1 p-8 pt-24">
          <header className="mb-8">
            <h1 className="text-2xl font-black text-dark capitalize">{activeSection}</h1>
            <p className="text-muted text-sm">Panel de control administrativo Xtreme Group</p>
          </header>

  {/* --- SECCIÓN: ESTADÍSTICAS --- */}
  {activeSection === 'estadisticas' && (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1 // Esto hace que las tarjetas aparezcan en cascada
          }
        }
      }}
      className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm text-muted mb-2"
    >
      <StatCard title="Ventas Totales" value={getStats().total} isCurrency icon={<BarChart3 />} color="text-blue-600" delay={0} />
      <StatCard title="Usuarios" value={getStats().userCount} icon={<Users />} color="text-emerald-600" delay={1} />
      <StatCard title="Pedidos Pendientes" value={getStats().pending} icon={<Clock />} color="text-orange-600" delay={2} />
      <StatCard title="Productos" value={getStats().prodCount} icon={<Package />} color="text-purple-600" delay={3} />
    <StatCard 
    title="Vence en < 1 Sem." 
    value={getStats().criticalExpirations} 
    icon={<AlertCircle />} 
    color="text-red-600" 
    delay={4} 
  />
    </motion.div>
  )}

          {/* --- SECCIÓN: USUARIOS (Xtreme Style & Logic Fix) --- */}
  {activeSection === 'usuarios' && (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08 } }
      }}
      className="space-y-4"
    >
      {users.map((u) => {
        const isExpanded = expandedUser === u.email; // Usamos email como ID único seguro

        return (
          <motion.div
            key={u.email}
            variants={{
              hidden: { x: -20, opacity: 0 },
              show: { x: 0, opacity: 1 }
            }}
            className={`group bg-white border transition-all duration-300 rounded-[2rem] overflow-hidden ${
              isExpanded ? 'border-blue-500 shadow-xl shadow-blue-100' : 'border-slate-100 shadow-sm hover:border-blue-200'
            }`}
          >
            {/* Cabecera del Usuario – XTREME Premium Style */}
            <div className="p-6 flex justify-between items-center">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-accent to-accent-dark rounded-3xl flex items-center justify-center font-black text-white text-2xl shadow-2xl shadow-accent/30">
                    {u.name[0].toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full shadow-lg" title="Usuario Activo"></div>
                </div>
                
                <div>
                  <h3 className="font-black text-dark text-xl flex items-center gap-3">
                    {u.name}
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-md ${
                      u.level === 'Gold' ? 'bg-gradient-to-r from-yellow-400 to-amber-600 text-white' :
                      u.level === 'Silver' ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-white' :
                      'bg-gradient-to-r from-orange-600 to-amber-700 text-white'
                    }`}>
                      {u.level}
                      {u.level === 'Gold' ? ' 🏆' : u.level === 'Silver' ? ' 🥈' : ' 🥉'}
                    </span>
                  </h3>
                  <p className="text-sm text-muted font-medium mt-1">{u.email}</p>
                </div>
              </div>

              <Button 
                variant={isExpanded ? "primary" : "ghost"}
                className={`h-12 px-8 rounded-3xl font-black text-sm transition-all duration-300 shadow-xl hover:shadow-accent/30 ${
                  isExpanded ? 'bg-gradient-to-r from-accent to-accent-dark hover:from-accent-dark hover:to-accent' : ''
                }`}
                onClick={() => setExpandedUser(isExpanded ? null : u.email)}
              >
                {isExpanded ? <Settings size={18} className="mr-2 animate-spin" /> : <ChevronDown size={18} className="mr-2" />}
                <motion.span 
                  animate={{ rotate: isExpanded ? 360 : 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {isExpanded ? 'Cerrar' : 'Gestionar'}
                </motion.span>
              </Button>
            </div>

            

  {/* --- PANEL DE GESTIÓN (Xtreme Premium Design) --- */}
  {/* MODAL PARA CREAR PRODUCTO */}

  <AnimatePresence>
    {isExpanded && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: 'auto', 
          opacity: 1,
          transition: { type: 'spring', damping: 25, stiffness: 120 } 
        }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-gradient-to-b from-slate-50 to-white border-t border-blue-100/50"
      >
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 relative overflow-hidden">
          {/* Decoración abstracta de fondo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          
            {/* LADO IZQUIERDO: CONTROL DE PUNTOS – Compacto, impactante y premium */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Header – Elegante y notorio */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-black text-accent uppercase tracking-widest flex items-center gap-3">
                <motion.div 
                  className="p-2.5 bg-gradient-to-r from-accent to-accent-dark rounded-2xl shadow-xl"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Trophy size={18} className="text-white" strokeWidth={3} />
                </motion.div>
                Puntos de Fidelidad
              </label>

              <motion.span 
                className="text-xs font-black text-white bg-gradient-to-r from-accent to-accent-dark px-4 py-1.5 rounded-full shadow-lg"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
              >
                MODO EDITOR
              </motion.span>
            </div>

            {/* Input de puntos – Compacto, refinado y con impacto sutil */}
            <div className="relative group">
              {/* Brillo sutil al focus */}
              <motion.div 
                className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-accent-dark/20 rounded-3xl blur-lg opacity-0 group-focus-within:opacity-70 transition-opacity duration-700"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              <div className="relative bg-white rounded-3xl border-4 border-slate-100 group-focus-within:border-accent shadow-xl transition-all duration-500">
                <motion.input 
                  type="number"
                  className="w-full bg-transparent px-8 py-3 text-lg md:text-xl font-black text-dark focus:ring-0 border-none outline-none"
                  value={u.points}
                  onChange={(e) => updateUserPoints(u.id || u.email, Number(e.target.value))}
                  whileFocus={{ scale: 1.02 }}
                />
                <motion.div 
                  className="absolute right-12 top-1/4 -translate-y-1 flex flex-col items-end"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  <span className="text-sm font-black text-accent tracking-widest">XTREME</span>
                  <span className="text-sm font-bold text-accent/70">POINTS</span>
                </motion.div>
              </div>
            </div>
  {/* AJUSTE MANUAL DE PUNTOS – ULTRA PREMIUM XTREME */}
  <div className="mt-8 p-8 bg-gradient-to-br from-accent/5 to-accent/10 rounded-3xl border border-accent/30 shadow-2xl">
    <h4 className="font-black text-accent text-2xl mb-6 flex items-center gap-4">
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <Trophy size={32} strokeWidth={3} />
      </motion.div>
      Ajuste Manual de Puntos
    </h4>

    <div className="space-y-6">
      <div>
        <label className="text-sm font-black text-accent uppercase tracking-wider mb-2 block">
          Cantidad de puntos
        </label>
        <p className="text-xs text-muted mb-2">Positivo = agregar • Negativo = quitar</p>
        <input 
          type="number" 
          id={`points-adjust-${u.email}`}
          placeholder="Ej: 100 o -50"
          className="w-full px-3 py-2 text-sm font-medium bg-white rounded-lg border border-slate-200 focus:border-accent outline-none shadow-sm transition-all"
        />
      </div>

      <div>
        <label className="text-sm font-black text-accent uppercase tracking-wider mb-2 block">
          Motivo del ajuste
        </label>
        <input 
          type="text" 
          id={`points-reason-${u.email}`}
          placeholder="Ej: Regalo por evento / Corrección de error"
          className="w-full px-3 py-2 text-sm font-medium bg-white rounded-lg border border-slate-200 focus:border-accent outline-none shadow-sm transition-all"
        />
      </div>

      <Button 
        variant="primary"
        className="w-full py-3 text-lg font-black bg-gradient-to-r from-accent to-accent-dark hover:from-accent-dark hover:to-accent shadow-2xl hover:shadow-accent/40 transition-all"
        onClick={() => {
          const pointsInput = document.getElementById(`points-adjust-${u.email}`) as HTMLInputElement;
          const reasonInput = document.getElementById(`points-reason-${u.email}`) as HTMLInputElement;
          
          const change = Number(pointsInput.value);
          const reason = reasonInput.value.trim();

          if (!change || change === 0 || !reason) {
            // Abre modal de error
            setShowErrorModal(true);
            return;
          }

          // Guarda datos temporales para el modal de confirmación
          setTempAdjustment({ change, reason });
          setShowConfirmModal(true);
        }}
      >
        <motion.span
          whileHover={{ scale: 1.05 }}
          className="flex items-center justify-center gap-3"
        >
          <Zap size={24} />
          Hacer Ajuste
        </motion.span>
      </Button>
    </div>
  </div>


  {/* MODAL DE ERROR – PREMIUM ROJO */}
  <AnimatePresence>
    {showErrorModal && (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[300] flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl border border-red-200 text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <AlertCircle size={80} className="text-red-500 mx-auto mb-6" />
          </motion.div>
          <h3 className="text-2xl font-black text-dark mb-4">Datos incompletos</h3>
          <p className="text-muted mb-8">Debes ingresar una cantidad de puntos (distinta de 0) y un motivo válido.</p>
          <Button 
            variant="ghost"
            className="mx-auto block w-full max-w-xs px-10 py-5 text-lg font-black text-dark border-4 border-slate-300 rounded-3xl shadow-2xl bg-white"
            onClick={() => setShowErrorModal(false)}
          >
            Entendido
          </Button>
        </motion.div>
      </div>
    )}
  </AnimatePresence>

  {/* MODAL DE CONFIRMACIÓN – PREMIUM */}
  <AnimatePresence>
    {showConfirmModal && tempAdjustment && (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[300] flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl p-10 max-w-lg w-full shadow-2xl border border-accent/30"
        >
          <h3 className="text-3xl font-black text-accent text-center mb-8">
            Confirmar Ajuste
          </h3>

          <div className="space-y-6 text-center">
            <p className="text-xl font-bold">
              {tempAdjustment.change > 0 ? 'Agregar' : 'Quitar'}{' '}
              <span className={`text-4xl ${tempAdjustment.change > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {Math.abs(tempAdjustment.change)}
              </span>{' '}
              puntos
            </p>
            <p className="text-lg text-muted italic">
              Motivo: "{tempAdjustment.reason}"
            </p>
          </div>

          <div className="flex gap-4 mt-10">
            <Button 
              variant="ghost" 
              className="flex-1 py-4 text-lg"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="primary"
              className="flex-1 py-4 text-lg font-black shadow-xl"
onClick={() => {
  const change = tempAdjustment.change;
  const reason = tempAdjustment.reason;

  // Creamos el nuevo registro de historial
  const newHistory = {
    date: new Date().toISOString(),
    pointsChange: change,
    reason: reason
  };

  // Calculamos el nuevo nivel
  const newPoints = u.points + change;
  const newLevel = newPoints >= 1000 ? 'Gold' : newPoints >= 500 ? 'Silver' : 'Bronze';

  // UN SOLO setUsers que actualiza TODO: puntos, level y historial
  setUsers(prev => prev.map(user => 
    user.email === u.email 
      ? { 
          ...user, 
          points: newPoints,
          level: newLevel,
          pointsHistory: [...(user.pointsHistory || []), newHistory]
        }
      : user
  ));

  // Actualizamos el contexto del usuario (para sincronización y tiempo real)
  if (user && u.email === user.email) {
  updateUser({
    points: newPoints,
    pointsHistory: [...(u.pointsHistory || []), newHistory]
  });
}

  // Limpiar inputs
  const pointsInput = document.getElementById(`points-adjust-${u.email}`) as HTMLInputElement;
  const reasonInput = document.getElementById(`points-reason-${u.email}`) as HTMLInputElement;
  if (pointsInput) pointsInput.value = '';
  if (reasonInput) reasonInput.value = '';

  setShowConfirmModal(false);
  setShowSuccessModal(true);
}}
            >
              Confirmar Ajuste
            </Button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>

  {/* MODAL DE ÉXITO – PREMIUM VERDE */}
  <AnimatePresence>
    {showSuccessModal && (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[300] flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-3xl p-12 max-w-md w-full shadow-2xl border border-emerald-200 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <CheckCircle size={100} className="text-emerald-500 mx-auto mb-6" />
          </motion.div>
          <h3 className="text-3xl font-black text-dark mb-4">¡Ajuste realizado!</h3>
          <p className="text-lg text-muted">Los puntos han sido actualizados correctamente.</p>
          <Button 
            variant="primary" 
            className="mx-auto block w-full max-w-xs mt-8 px-10 py-4 text-lg font-black bg-emerald-600 hover:bg-emerald-700"
            onClick={() => setShowSuccessModal(false)}
          >
            Cerrar
          </Button>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
            {/* Nota – Sutil y elegante */}
            <motion.p 
              className="text-sm text-muted font-medium italic text-center opacity-80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              * Los cambios se reflejarán instantáneamente en la wallet del usuario.
            </motion.p>

          </motion.div> 

          {/* LADO DERECHO: INFO CARD PREMIUM – XTREME Style */}
          <motion.div 
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-accent/20 relative z-10 overflow-hidden">
              {/* Header premium */}
              <div className="flex items-center justify-between mb-7 pb-5 border-b border-accent/10">
                <motion.h4 
                  className="font-black text-accent text-lg uppercase tracking-widest flex items-center gap-3"
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Lock size={24} className="text-accent" strokeWidth={3} />
                  Información
                </motion.h4>

                <motion.div className="flex gap-2">
                  <motion.div 
                    className="w-3 h-3 rounded-full bg-accent"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div 
                    className="w-3 h-3 rounded-full bg-accent/70"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div 
                    className="w-3 h-3 rounded-full bg-accent/40"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                  />
                </motion.div>
              </div>

              {/* Grid de info – Premium y vistoso */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-accent bg-accent/10 px-1 py-1 rounded-full shadow-sm">Línea Directa</span>
                    <span className="font-black text-dark text-sm">{u.phone || 'Sin número'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-accent bg-accent/10 px-1 py-1 rounded-full shadow-sm">Código Xtreme</span>
                    <span className="font-black text-accent text-sm">{u.referralCode}</span>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-accent bg-accent/10 px-1 py-1 rounded-full shadow-sm">Rango Actual</span>
                    <span className={`font-black text-sm flex items-center gap-2 ${
                      u.level === 'Gold' ? 'text-amber-600' :
                      u.level === 'Silver' ? 'text-gray-600' :
                      'text-orange-600'
                    }`}>
                      {u.level}
                      {u.level === 'Gold' ? '🏆' : u.level === 'Silver' ? '🥈' : '🥉'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-accent bg-accent/10 px-1 py-1 rounded-full shadow-sm">Ubicación</span>
                    <span className="font-black text-dark text-sm">{u.address?.split(',')[0] || 'Perú'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sombras decorativas premium */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-accent/10 to-accent-dark/10 blur-3xl -z-10 rounded-3xl"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
          </motion.div>
        );
      })}
    </motion.div>
  )}

  {activeSection === 'membresias' && (() => {
  // PASO CLAVE: Calculamos las estadísticas UNA sola vez aquí
  const stats = getMembershipStats();

  return (
    
    <div className="space-y-6">
      {/* RESUMEN RÁPIDO DE VENCIMIENTOS */}
      
      <div className="grid grid-cols-5 gap-4">
    {/* BOTÓN: VER TODOS */}
    <button 
      onClick={() => setMembershipFilter('all')}
      className={`p-4 rounded-2xl border transition-all ${membershipFilter === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-100'}`}
    >
      <p className="text-[10px] font-black uppercase">Todos los Planes</p>
      <p className="text-2xl font-black">{users.filter(u => u.subscription).length}</p>
    </button>
    {/* BOTÓN: 1 AÑO */}
    <button 
      onClick={() => setMembershipFilter('1year')}
      className={`p-4 rounded-2xl border transition-all ${membershipFilter === '1year' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 border-blue-100'}`}
    >
      <p className="text-[10px] font-black uppercase">Vence 1 Año</p>
      <p className="text-2xl font-black">{stats.expiring1Year?.length || 0}</p>
    </button>

    {/* BOTÓN: 1 MES */}
    <button 
      onClick={() => setMembershipFilter('1month')}
      className={`p-4 rounded-2xl border transition-all ${membershipFilter === '1month' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 border-blue-100'}`}
    >
      <p className="text-[10px] font-black uppercase">Vence 1 Mes</p>
      <p className="text-2xl font-black">{stats.expiring1Month?.length || 0}</p>
    </button>

    {/* BOTÓN: 1 SEMANA */}
    <button 
      onClick={() => setMembershipFilter('1week')}
      className={`p-4 rounded-2xl border transition-all ${membershipFilter === '1week' ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600 border-orange-100'}`}
    >
      <p className="text-[10px] font-black uppercase">Vence 1 Semana</p>
      <p className="text-2xl font-black">{stats.expiring1Week?.length || 0}</p>
    </button>

    {/* BOTÓN: 3 DÍAS */}
    <button 
      onClick={() => setMembershipFilter('3days')}
      className={`p-4 rounded-2xl border transition-all ${membershipFilter === '3days' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600 border-red-100'}`}
    >
      <p className="text-[10px] font-black uppercase">Vence 3 Días</p>
      <p className="text-2xl font-black">{stats.expiring3Days?.length || 0}</p>
    </button>

    {/* BOTÓN: HOY */}
    <button 
      onClick={() => setMembershipFilter('today')}
      className={`p-4 rounded-2xl border transition-all ${membershipFilter === 'today' ? 'bg-black text-white' : 'bg-slate-100 text-slate-800'}`}
    >
      <p className="text-[10px] font-black uppercase">Vence Hoy</p>
      <p className="text-2xl font-black">{stats.expiringToday?.length || 0}</p>
    </button>
  </div>

      {/* LISTADO DE SUSCRIPTORES */}
      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Usuario</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Suscripción</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Vencimiento</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {getFilteredMemberships().map(u => (
              <tr key={u.email} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-black text-dark text-sm">{u.name}</p>
                  <p className="text-xs text-muted font-medium">{u.email}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-accent/10 text-accent text-[10px] font-black px-3 py-1 rounded-full uppercase">
                    {u.subscription}
                  </span>
                </td>
                <td className="px-6 py-4">
    {u.subscriptionEndDate && u.subscription !== 'regular' ? (
      <div className="flex flex-col">
        {/* Fecha principal: Día/Mes/Año */}
        <p className="text-sm font-bold text-dark">
          {new Date(u.subscriptionEndDate).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })}
        </p>
        {/* Hora secundaria: 12:00 PM */}
        <p className="text-[10px] font-medium text-slate-400">
          {new Date(u.subscriptionEndDate).toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })}
        </p>
      </div>
    ) : (
      <p className="text-sm font-bold text-dark">No definida</p>
    )}
  </td>
                <td className="px-6 py-4">
                  <Button 
    variant="primary" 
    className="h-8 px-4 text-[10px] font-black"
    onClick={() => setEditingSubscription(u)} // <--- Esto activa el modal
  >
    EDITAR TIEMPO
  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
})()}

              {/* --- SECCIÓN: PRODUCTOS – XTREME Premium Admin Style --- */}
          {activeSection === 'productos' && (
            <div className="space-y-6">
              {/* Botón Nuevo Producto – Premium */}
              <div className="text-right">
                <Button 
                  variant="primary" 
                  className="px-8 py-3.5 text-base font-black shadow-xl hover:shadow-accent/30 transition-all"
                  onClick={() => setIsAddingProduct(true)}
                >
                  <Plus size={20} className="mr-2" strokeWidth={3} />
                  Nuevo Producto
                </Button>
              </div>

              {/* Grid de productos – Compacto y premium */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map(p => (
                  <motion.div
                    key={p.id}
                    whileHover={{ y: -8, scale: 1.03 }}
                    className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-accent/20 transition-all duration-400 border border-slate-100 overflow-hidden"
                  >
                    <div className="p-5 flex gap-5 items-center">
                      {/* Imagen */}
                      <motion.div 
                        className="relative flex-shrink-0"
                        whileHover={{ scale: 1.1 }}
                      >
                        <img 
                          src={p.img} 
                          alt={p.title}
                          className="w-20 h-20 rounded-3xl object-cover shadow-md"
                        />
                        {p.badge && (
                          <span className="absolute -top-2 -right-2 bg-gradient-to-r from-accent to-accent-dark text-white text-xs font-black px-3 py-1 rounded-full shadow-xl">
                            {p.badge}
                          </span>
                        )}
                      </motion.div>

                      {/* Info */}
                      <div className="flex-1">
                        <h4 className="font-black text-dark text-base mb-1 line-clamp-2">
                          {p.title}
                        </h4>
                        <p className="text-sm text-muted mb-2">{p.category}</p>
                        <p className="text-2xl font-black text-accent">
                          S/. {p.price.toLocaleString('es-PE')}
                        </p>
                      </div>

                      {/* Botones edición/eliminar */}
                      <div className="flex flex-col gap-3">
                        <motion.button 
                          onClick={() => setEditingProduct(p)}
                          className="p-3 bg-gradient-to-r from-accent to-accent-dark text-white rounded-2xl shadow-lg hover:shadow-accent/40 transition-all"
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Edit2 size={18} strokeWidth={3} />
                        </motion.button>
                        <motion.button 
                          onClick={() => deleteProduct(p.id)}
                          className="p-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl shadow-lg hover:shadow-red-500/40 transition-all"
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Trash2 size={18} strokeWidth={3} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
                {/* --- SECCIÓN: PEDIDOS – XTREME Premium Admin Style --- */}
          {activeSection === 'pedidos' && (
            <div className="space-y-8">
              {orders.map((o, i) => (
                <motion.div
                  key={o.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -8 }}
                  className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-accent/20 transition-all duration-500 border border-slate-100 overflow-hidden"
                >
                  <div className="p-6">
                    {/* Header del pedido */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <span className="text-xs font-black text-muted uppercase tracking-widest">
                          Orden #{o.id}
                        </span>
                    <h3 className="font-black text-dark text-xl mt-1">
                      {o.customerName || 'Cliente Xtreme'} 
                      {o.isExchange && (
    <span className="ml-3 bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full border border-purple-200 uppercase font-black">
      Regalo por Puntos
    </span>
  )}
                    </h3>
                    <p className="text-sm font-medium text-accent/80 flex items-center gap-1">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-lg text-slate-600 text-xs">Email:</span>
                      {o.customerEmail}
                    </p>
                        <p className="text-sm text-muted mt-1">
                          {o.date} • Total: 
  <span className={`font-black text-2xl ml-2 ${o.isExchange ? 'text-purple-600' : 'text-accent'}`}>
    {o.isExchange 
      ? `${o.pointsUsed} Puntos (Canje)` 
      : `S/. ${o.total.toLocaleString('es-PE')}`
    }
  </span>
                        </p>
                      </div>

                      {/* Selector de estado – Premium */}
  <div className="relative inline-block">
    <select 
      value={o.status} 
      onChange={(e) => changeOrderStatus(o.id, e.target.value as any)}
      className={`appearance-none font-black text-sm uppercase tracking-wider px-6 py-3 pr-12 rounded-full shadow-xl cursor-pointer outline-none transition-all ${
    o.isExchange 
      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
      : 'bg-gradient-to-r from-accent to-accent-dark text-white'
  }`}
    >
      <option value="pending" className="bg-white text-dark">Pendiente</option>
      <option value="shipped" className="bg-white text-dark">Enviado</option>
      <option value="delivered" className="bg-white text-dark">Entregado</option>
    </select>

    {/* Flecha personalizada para que se vea premium */}
    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
      <ChevronDown size={18} className="text-white" strokeWidth={3} />
    </div>
  </div>
                    </div>

                    {/* Items del pedido – Compactos y premium */}
                    <div className="flex flex-wrap gap-4">
                      {o.items.map((item, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{ scale: 1.05 }}
                          className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-3 shadow-md border border-slate-200 flex items-center gap-3"
                        >
                          <motion.img 
                            src={item.img} 
                            alt={item.title}
                            className="w-12 h-12 rounded-xl object-cover shadow"
                            whileHover={{ scale: 1.1 }}
                          />
                          <div>
                            <p className="font-black text-dark text-sm line-clamp-1">
                              {item.quantity}x {item.title}
                            </p>
                            <p className="text-xs text-muted">
                              S/. {item.price.toLocaleString('es-PE')}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          {/* --- SECCIÓN: REPORTES --- */}
          {activeSection === 'reportes' && (
            <div className="bg-white p-8 border border-slate-200 rounded-3xl text-center space-y-6">
              <div className="w-16 h-16 bg-blue-50 text-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Download size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-dark">Generar Reporte de Ventas</h2>
                <p className="text-sm text-muted">Descarga el historial completo de pedidos en formato PDF profesional.</p>
              </div>
              <div className="flex justify-center gap-4">
                <Button variant="primary" onClick={generatePDF}>Descargar PDF</Button>
                <CSVLink data={orders} filename="reporte-ventas-xtreme.csv">
                  <Button variant="ghost">Exportar CSV</Button>
                </CSVLink>
              </div>
            </div>
            
          )}
        </main>
  <AnimatePresence>
    {editingSubscription && (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-slate-100"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
              <Shield size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-dark leading-none">Gestionar Plan</h2>
              <p className="text-xs font-bold text-slate-400 mt-1">{editingSubscription.email}</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Selección de Plan */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Tipo de Plan</label>
              <div className="grid grid-cols-3 gap-2">
                {['regular', 'prime_basic', 'prime_pro'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setEditingSubscription({...editingSubscription, subscription: p as any})}
                    className={`py-3 rounded-2xl font-black text-xs transition-all border-2 ${editingSubscription.subscription === p ? 'border-accent bg-accent/5 text-accent' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                  >
                    {p.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

  {/* Fecha Manual */}
  <div>
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Fecha de Vencimiento</label>
    <input 
  type="date"
  // Establece el mínimo como 'Hoy' en formato YYYY-MM-DD
  min={new Date().toISOString().split('T')[0]} 
  value={editingSubscription.subscriptionEndDate?.split('T')[0] || ''}
  onChange={(e) => {
    // Cuando el usuario elige manualmente, le forzamos el final del día
    setEditingSubscription({
      ...editingSubscription,
      subscriptionEndDate: `${e.target.value}T23:59:59`
    });
  }}
      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-accent outline-none transition-all font-bold text-dark"
    />
  </div>

            {/* Botones de Acceso Rápido */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Accesos Rápidos</label>
              <div className="grid grid-cols-3 gap-2">
                {[
  { label: '+1 Mes', m: 1 },
  { label: '+3 Meses', m: 3 },
  { label: '+6 Meses', m: 6 }
].map((btn) => (
  <button
    key={btn.label}
    onClick={() => {
      const d = new Date();
      
      // 1. LIMPIEZA: Ponemos la hora a medianoche para evitar saltos de día por la zona horaria
      d.setHours(0, 0, 0, 0); 
      
      // 2. SUMAR MES: Ahora sumamos el mes con seguridad
      d.setMonth(d.getMonth() + btn.m);
      
      // 3. OBTENER SOLO FECHA: Extraemos YYYY-MM-DD
      const year = d.getFullYear();
      const month = String(d.getMonth()+1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      
      // 4. FIJAR VENCIMIENTO: Lo ponemos a las 11:59:59 PM de ese día exacto
      const finalDateISO = `${year}-${month}-${day}T23:59:59`; // Mediodía para evitar problemas de zona horaria
      
      setEditingSubscription({
        ...editingSubscription, 
        subscriptionEndDate: finalDateISO
      });
    }}
    className="py-3 bg-slate-800 text-white rounded-xl text-[10px] font-black hover:bg-accent transition-colors"
  >
    {btn.label}
  </button>
))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
  <Button 
    className="flex-1 py-4 shadow-xl shadow-accent/20"
    onClick={() => {
      // 1. Actualizamos la lista global de usuarios
      const updatedUsers = users.map(u => 
        u.email === editingSubscription?.email ? editingSubscription : u
      );
      setUsers(updatedUsers);
      localStorage.setItem('all_users', JSON.stringify(updatedUsers));

      // 2. ¡CLAVE! Si el admin se editó a sí mismo, actualizamos su sesión actual
      if (editingSubscription?.email === user?.email) {
        // Esto actualiza el context para que el Navbar cambie de inmediato
        updateUser(editingSubscription); 
        // Y actualizamos la persistencia de la sesión
        localStorage.setItem('user', JSON.stringify(editingSubscription));
      }

      // 3. Notificar a otras pestañas o componentes (Opcional pero recomendado)
      window.dispatchEvent(new Event('storage')); 
      
      setEditingSubscription(null);
    }}
  >
    GUARDAR CAMBIOS
  </Button>
            <Button variant="ghost" onClick={() => setEditingSubscription(null)} className="px-6 text-slate-400">
              CANCELAR
            </Button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
        {/* --- MODAL EDICIÓN PRODUCTO (Tú lógica original mejorada visualmente) --- */}
        {editingProduct && (
          <div className="fixed inset-0 bg-dark/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <motion.form 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              onSubmit={handleEditProduct}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-4"
            >
              <h2 className="text-xl font-black text-dark">Editar Producto</h2>
              <div className="space-y-3">
                <input 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  value={editingProduct.title}
                  onChange={e => setEditingProduct({...editingProduct, title: e.target.value})}
                  placeholder="Título"
                />
                <input 
                  type="number"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                  value={editingProduct.price}
                  onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                  placeholder="Precio"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" variant="primary" className="flex-1">Guardar Cambios</Button>
                <Button type="button" variant="ghost" onClick={() => setEditingProduct(null)}>Cancelar</Button>
              </div>
            </motion.form>
          </div>
        )}
      </div>
    );
  };

  // Componente pequeño para las tarjetas de stats
  const StatCard = ({ title, value, icon, color, isCurrency }: any) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
      let start = 0;
      const end = parseFloat(value) || 0;
      if (end === 0) return setDisplayValue(0);

      const duration = 1500;
      const frameRate = 1000 / 60;
      const totalFrames = Math.round(duration / frameRate);
      const increment = end / totalFrames;

      let currentFrame = 0;
      const timer = setInterval(() => {
        currentFrame++;
        start += increment;
        if (currentFrame >= totalFrames) {
          setDisplayValue(end);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, frameRate);

      return () => clearInterval(timer);
    }, [value]);

    

    return (
      <motion.div
        variants={{
          hidden: { y: 20, opacity: 0 },
          show: { y: 0, opacity: 1, transition: { type: 'spring', damping: 15 } }
        }}
        whileHover={{ y: -8 }}
        className="relative group cursor-pointer"
      >
        {/* Tarjeta con degradado oculto que aparece en hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-900 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-2xl shadow-blue-500/30" />
        
        {/* Contenido de la tarjeta */}
        <div className="relative bg-white group-hover:bg-transparent p-7 border border-slate-100 group-hover:border-transparent rounded-[2.5rem] transition-all duration-500">
          
          {/* Icono con fondo dinámico */}
          <div className={`w-14 h-14 rounded-2xl bg-slate-50 group-hover:bg-white/20 flex items-center justify-center mb-6 transition-all duration-500 ${color} group-hover:text-white`}>
            {React.cloneElement(icon, { size: 28, strokeWidth: 2.5 })}
          </div>
          
          <p className="text-[16px] font-black text-slate-400 group-hover:text-blue-100 uppercase tracking-[0.2em] mb-2 transition-colors">
            {title}
          </p>
          
          <div className="flex flex-col">
            <h2 className="text-3xl font-black text-slate-800 group-hover:text-white tracking-tighter transition-colors">
              {isCurrency ? `S/. ${displayValue.toLocaleString()}` : displayValue.toLocaleString()}
            </h2>
            
            {/* Línea decorativa que crece en hover */}
            <div className="w-8 h-1 bg-blue-600 group-hover:bg-white group-hover:w-full mt-3 rounded-full transition-all duration-500" />
          </div>

          {/* Círculo decorativo sutil en la esquina */}
          <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-slate-200 group-hover:bg-white/40 group-hover:animate-ping" />
          
        </div>
        
      </motion.div>
    );
    
  };

  export default DashboardAdmin;