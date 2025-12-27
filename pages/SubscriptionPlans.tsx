import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { 
  Check, X, Trophy, Crown, Lock, Truck, Zap, 
  Gift, Sparkles, ChevronRight, AlertCircle, 
  ShieldCheck, Rocket, Timer, Percent, CreditCard,
  ShoppingBag, Star, Heart, ZapOff, DollarSign, Users, BarChart3, User
} from 'lucide-react';
import AuthModal from '../components/ui/AuthModal';

// Partículas sutiles (idénticas a Home)
const Particle: React.FC<{ delay: number }> = ({ delay }) => (
  <motion.div
    className="absolute rounded-full bg-accent/20"
    style={{
      width: Math.random() * 15 + 5,
      height: Math.random() * 15 + 5,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }}
    animate={{
      y: [0, -120, 0],
      opacity: [0, 0.4, 0],
    }}
    transition={{
      duration: 10 + Math.random() * 5,
      repeat: Infinity,
      delay: delay,
      ease: "easeInOut"
    }}
  />
);

const InfoTooltip = ({ title, desc }: { title: string; desc: string }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative inline-block cursor-help"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="border-b border-dotted border-slate-400">{title}</span>
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-2xl z-50"
          >
            {desc}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SubscriptionPlans: React.FC = () => {
  const { user, updateUser } = useUser();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authType, setAuthType] = useState<'login' | 'register'>('login'); // Nuevo estado para cambiar entre login/register
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
  const [showLoginRequired, setShowLoginRequired] = useState(false);  // ← NUEVO

  useEffect(() => {
    // Solo mostramos el modal si el user está DEFINITIVAMENTE null
    // (no si está cargando)
    if (user === null) {
      // Pero esperamos un poquito a que localStorage cargue
      const timer = setTimeout(() => {
        if (!user) { // doble chequeo
          setShowLoginRequired(true);
        }
      }, 100); // 100ms es suficiente para que UserProvider cargue

      return () => clearTimeout(timer);
    } else {
      // Si ya hay user, aseguramos que el modal esté cerrado
      setShowLoginRequired(false);
    }
  }, [user]);

  const comparisonData = [
    { feature: "Descuento en Catálogo", regular: "5%", basic: "10%", pro: "20% VIP" },
    { feature: "Velocidad de Envío", regular: "Estándar", basic: "Prioritario", pro: "Same-Day (Mismo día)" },
    { feature: "Costo de Envío", regular: "S/ 10.00 - S/ 30.00", basic: "Gratis > S/300", pro: "Gratis TOTAL" },
    { feature: "Puntos por Compra", regular: "1x", basic: "2x", pro: "3x (Triple)" },
    {feature: "Descuento en Mercado de Canjes", regular: <X className="text-red-400 mx-auto" size={18}/>, basic: "5%", pro: "10%" },
    { feature: "Garantía Extendida", regular: "7 días", basic: "6 meses", pro: "12 meses" },
    { feature: "Puntos por Referido", regular: "10%", basic: "20%", pro: "30%" },
    { feature: "Acceso a Ofertas", regular: "Público", basic: "12h antes", pro: "48h antes + Stock Reservado" },
    { feature: "Precios por Volumen", regular: "Precio de Lista", basic: "Tarifa con descuento en Insumos seleccionados.", pro: "Tarifa Mayorista desbloqueada en TODO el catálogo."},
    { feature: "Gestión Inteligente", regular: <X className="text-red-400 mx-auto" size={18}/>,  basic: { title: "Monitor de Ahorros", desc: "Alertas de reposición y ahorro real." }, pro: { title: "Optimización de Negocio", desc: "Data avanzada y reportes contables." } }
  ];

  const plans = [   
    {
      id: 'regular',
      name: 'Regular',
      price: 0,
      description: 'Acceso básico para compradores ocasionales.',
      color: 'bg-white text-dark border-slate-200',
      icon: <Lock size={40} className="text-slate-500" />,
      btnText: 'Plan Actual',
      btnVariant: 'ghost' as const
    },
    {
      id: 'basic',
      name: 'Prime Básico',
      price: 350,
      description: 'Optimiza tus compras mensuales y ahorra en envíos.',
      color: 'bg-white text-dark border-accent ring-4 ring-accent/10',
      icon: <Trophy size={40} className="text-accent" />,
      btnText: 'Mejorar a Básico',
      btnVariant: 'primary' as const, 
      badge: 'Más Popular'
    },
    {
      id: 'pro',
      name: 'Prime Pro',
      price: 800,
      description: 'El máximo nivel de ahorro, velocidad y exclusividad.',
      color: 'bg-gradient-to-br from-amber-50 to-yellow-50 text-dark border-amber-500',
      icon: <Crown size={40} className="text-amber-600" />,
      btnText: 'Hacerse Miembro Pro',
      btnVariant: 'primary' as const, 
      badge: 'Elite'
    }
  ];

// MODAL INICIAL: Elegir acción (Login, Registro o Invitado)
if (showLoginRequired) {
  return (
<AnimatePresence>
  {showLoginRequired && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => setShowLoginRequired(false)}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50, rotate: -10 }}
        animate={{ scale: 1, y: 0, rotate: 0 }}
        exit={{ scale: 0.8, y: 50, rotate: 10 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
          className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <User size={48} className="text-accent" />
        </motion.div>
        <h2 className="text-3xl font-black text-dark mb-4">¡Inicia Sesión Primero!</h2>
        <p className="text-muted mb-8 text-lg">
          Para adquirir una membresía, necesitas inciar sesión o registrarte. 
          <span className="text-accent font-bold"> ¡Regístrate y adquiere tu plan!</span>
        </p>

        {/* Dos botones funcionales */}
        <div className="flex flex-col gap-4">
          <Button 
            variant="primary" 
            className="w-full py-4 text-lg"
            onClick={() => {
              setShowLoginRequired(false);
              window.dispatchEvent(new Event('openLoginModal'));  // ← Evento global
            }}
          >
            Iniciar Sesión
          </Button>
          <Button 
            variant="ghost" 
            className="w-full py-4 text-lg"
            onClick={() => {
              setShowLoginRequired(false);
              window.dispatchEvent(new Event('openRegisterModal'));  // ← Evento global
            }}
          >
            Registrarse
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
  );
}
  return (
    <div className="pt-28 pb-20 px-6 max-w-[1400px] mx-auto min-h-screen relative overflow-hidden">
      {/* Partículas */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <Particle key={i} delay={i * 0.4} />
        ))}
      </div>

      {/* Hero */}
      <motion.section 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20 relative z-10"
      >
        <h1 className="text-5xl md:text-6xl font-black text-dark mb-6">
          Membresías <span className="text-accent">XTREME</span>
        </h1>
        <p className="text-xl text-muted max-w-3xl mx-auto mb-12">
          Diseñadas para quienes no esperan. Únete a miles de profesionales que ya han transformado su forma de comprar en nuestro marketplace.
        </p>
      </motion.section>

      {/* Planes */}
      <div className="grid md:grid-cols-3 gap-8 mb-20 relative z-10">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            onMouseEnter={() => setHoveredPlan(plan.id)}
            onMouseLeave={() => setHoveredPlan(null)}
            whileHover={{ y: -10 }}
            className={`relative p-8 bg-white rounded-3xl shadow-lg border-2 ${plan.color} flex flex-col`}
          >
            {plan.badge && (
              <span className={`absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white text-sm font-black px-6 py-2 rounded-full shadow-xl`}>
                {plan.badge}
              </span>
            )}
            
            <div className="text-center mb-8">
              <div className="inline-block p-6 bg-slate-50 rounded-3xl mb-6">
                {plan.icon}
              </div>
              <h3 className="text-3xl font-black text-dark mb-2">{plan.name}</h3>
              <p className="text-muted text-sm mb-6">{plan.description}</p>
              <p className="text-4xl font-black text-accent mb-2">
                S/ {plan.price}
              </p>
              <p className="text-muted">/año</p>
              {plan.price > 0 && (
                <p className="text-sm text-muted mt-2">
                  Equivale a S/ {(plan.price / 12).toFixed(2)} por mes
                </p>
              )}
            </div>

<Button 
  variant={plan.btnVariant}
  className="w-full mt-auto py-4 text-lg font-black"
  onClick={() => {
  if (!user) {
  setShowLoginRequired(true);  // Usa el modal que ya tienes
  return;
}
    // Cambiamos la suscripción del usuario (solo para testing)
    const newSubscription = plan.id === 'regular' ? 'regular' : 
                           plan.id === 'basic' ? 'prime_basic' : 
                           'prime_pro';

    const today = new Date();
    const endDate = plan.id === 'regular' ? null : 
                    new Date(today.setFullYear(today.getFullYear() + 1)).toISOString();

    updateUser({
      subscription: newSubscription,
      subscriptionEndDate: endDate
    });

    alert(`¡Felicidades! Ahora eres ${plan.name}. El cambio se ha guardado permanentemente.`);
  }}
>
  {plan.btnText}
</Button>
          </motion.div>
        ))}
      </div>

      {/* Tabla Comparativa */}
      <section className="mb-20 max-w-6xl mx-auto">
        <h2 className="text-4xl font-black text-dark text-center mb-12">
          Compara los beneficios
        </h2>
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-6 text-left text-sm font-black text-muted uppercase">Beneficio</th>
                <th className="p-6 text-center text-sm font-black text-muted uppercase">Regular</th>
                <th className="p-6 text-center text-sm font-black text-accent uppercase">Prime Básico</th>
                <th className="p-6 text-center text-sm font-black text-amber-600 uppercase">Prime Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisonData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="p-6 font-bold text-dark">{row.feature}</td>
                  <td className="p-6 text-center text-muted">{row.regular}</td>
                  <td className="p-6 text-center text-dark font-bold">
                    {typeof row.basic === 'object' ? <InfoTooltip title={row.basic.title} desc={row.basic.desc} /> : row.basic}
                  </td>
                  <td className="p-6 text-center text-dark font-bold">
                    {typeof row.pro === 'object' ? <InfoTooltip title={row.pro.title} desc={row.pro.desc} /> : row.pro}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Por qué Prime - Versión Profesional Actualizada */}
<section className="mb-20">
  <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden">
    {/* Decoración sutil de fondo */}
    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full" />
    
    <div className="grid md:grid-cols-2 gap-16 items-center relative z-10">
      <div>
        <h2 className="text-5xl font-black mb-12 tracking-tighter">
          Tu clínica con el respaldo de <span className="text-accent italic">Prime Pro.</span>
        </h2>
        <div className="space-y-10">
        {[
          { 
            icon: <Zap size={28} />, // Definimos el tamaño aquí directamente
            title: "Abastecimiento Prioritario", 
            desc: "Acceso exclusivo a stock reservado de alta demanda y lanzamientos. Si un equipo es escaso, tú siempre tendrás el primer lugar en la fila." 
          },
          { 
            icon: <Users size={28} />, 
            title: "Sistema de Co-Inversión", 
            desc: "Tus referidos generan comisiones del 10% en puntos, permitiendo que tu red de contactos financie tus propios insumos." 
          },
          { 
            icon: <BarChart3 size={28} />, 
            title: "Dashboard de Rentabilidad", 
            desc: "Acceso a analítica avanzada que predice tu consumo y te sugiere compras por volumen para maximizar tu ahorro anual." 
          }
        ].map((item, i) => (
          <div key={i} className="flex gap-6 group">
            <div className="shrink-0 w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
              {item.icon}
            </div>
            <div>
              <h4 className="text-2xl font-black mb-2 tracking-tight">{item.title}</h4>
              <p className="text-slate-400 text-lg leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-accent to-blue-700 rounded-[2.5rem] p-12 shadow-2xl relative overflow-hidden">
        {/* Badge de impacto */}
        <div className="absolute -right-4 -top-4 bg-white/20 p-8 rounded-full blur-2xl" />
        
        <h3 className="text-3xl font-black mb-8 italic tracking-tighter">Impacto Financiero</h3>
        <p className="text-xl mb-10 leading-relaxed">
          Un miembro <strong className="text-amber-400 underline decoration-2 underline-offset-4">Prime Pro</strong> optimiza su flujo de caja en promedio 
          <strong className="text-5xl block mt-6 font-black tracking-tighter text-white uppercase">S/ 4,200</strong> 
          <span className="text-sm font-bold opacity-80 uppercase tracking-widest mt-2 block">Ahorro anual proyectado</span>
        </p>
        
        <div className="bg-slate-900/40 backdrop-blur-md p-8 rounded-3xl border border-white/10">
          <div className="flex items-center gap-2 text-amber-400 mb-3">
            <Sparkles size={18} />
            <p className="text-xs font-black uppercase tracking-[0.2em]">Próximo Stock VIP:</p>
          </div>
          <p className="text-2xl font-black text-white">
            Escáner Intraoral iTero Element 5D <br/>
            <span className="text-amber-300 text-lg">— Reserva prioritaria 72h</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
      {/* CTA Final */}
      <section className="text-center py-16 bg-slate-50 rounded-3xl shadow-lg">
        <h2 className="text-4xl font-black text-accent mb-6">ÚNETE A LA ÉLITE</h2>
        <p className="text-xl text-muted mb-8 max-w-2xl mx-auto">
          La inversión que se paga sola desde tu primera compra.
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-6">
          <Button variant="primary" className="px-12 py-5 text-xl font-black">
            Hacerme Prime Ahora
          </Button>
          <Button variant="ghost" className="px-12 py-5 text-xl font-black">
            Hablar con Asesor
          </Button>
        </div>
      </section>
    </div>
  );
};

export default SubscriptionPlans;