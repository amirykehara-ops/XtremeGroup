import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ShieldCheck, Truck, CreditCard, PenTool, Star, Check} from 'lucide-react';
import Button from '../components/ui/Button';
import { PRODUCTS } from '../constants';
import Modal from '../components/ui/Modal';
import { Product } from '../types';
import { getUserBenefits, getSubscriptionColor } from '../constants';
import { Link } from 'react-router-dom';

const Particle: React.FC<{ delay: number }> = ({ delay }) => (
  <motion.div
    className="absolute rounded-full bg-accent/20"
    style={{
      width: Math.random() * 20 + 10,
      height: Math.random() * 20 + 10,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }}
    animate={{
      y: [0, -100, 0],
      x: [0, 50, -50, 0],
      opacity: [0.1, 0.3, 0.1],
    }}
    transition={{
      duration: 10 + Math.random() * 10,
      repeat: Infinity,
      delay: delay,
      ease: "linear"
    }}
  />
);

const Home: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Typewriter effect state
  const [textIndex, setTextIndex] = useState(0);
  const words = ["Transforma", "Innova", "Lidera"];
  const [currentWord, setCurrentWord] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    const handleTyping = () => {
      const fullWord = words[textIndex % words.length];
      
      if (isDeleting) {
        setCurrentWord(fullWord.substring(0, currentWord.length - 1));
        setTypingSpeed(50);
      } else {
        setCurrentWord(fullWord.substring(0, currentWord.length + 1));
        setTypingSpeed(150);
      }

      if (!isDeleting && currentWord === fullWord) {
        setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && currentWord === "") {
        setIsDeleting(false);
        setTextIndex(prev => prev + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentWord, isDeleting, typingSpeed, textIndex]);


 // 1. Crea un estado para los productos dinámicos
const [allProducts, setAllProducts] = useState<Product[]>([]);

useEffect(() => {
  const loadProducts = () => {
    const saved = localStorage.getItem('admin_products');
    setAllProducts(saved ? JSON.parse(saved) : PRODUCTS);
  };

  loadProducts();

  // Escucha cambios realizados en otras pestañas (el Admin)
  window.addEventListener('storage', loadProducts);
  return () => window.removeEventListener('storage', loadProducts);
}, []);

// 3. Ahora saca los "Equipos Estrella" de la lista dinámica
const featuredProducts = allProducts.slice(0, 4);
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex flex-col justify-center items-center overflow-hidden pt-20 pb-14">
        {/* Background Particles */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <Particle key={i} delay={i * 0.5} />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-white to-slate-50 opacity-80"></div>
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center z-10 relative mt-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-white/60 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/40 shadow-[0_20px_60px_rgba(0,102,204,0.15)]"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-accent mb-6 leading-tight tracking-tight">
              Tecnología Dental que <br />
              <span className="text-dark inline-block min-w-[3ch]">{currentWord}<span className="animate-pulse">|</span></span>
            </h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg md:text-xl text-muted mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Descubre los equipos dentales más avanzados con Xtreme Group. Soporte técnico, financiamiento y entrega en todo Perú.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button variant="primary" className="text-lg px-8">Explorar Equipos</Button>
              <Button variant="ghost" className="text-lg px-8">Contactar Experto</Button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-12 flex flex-col sm:flex-row justify-center gap-8 md:gap-16 text-center">
            
              {[
                { label: 'Marcas', val: '50+' },
                { label: 'Equipos', val: '100+' },
                { label: 'Satisfacción', val: '99%' }
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-3xl md:text-4xl font-extrabold text-accent">{stat.val}</div>
                  <div className="text-sm font-semibold text-muted uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Features Grid */}
      <section className="py-24 px-6 max-w-[1400px] mx-auto">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-dark mb-4"
          >
            Soluciones que Inspiran Confianza
          </motion.h2>
          <div className="h-1 w-24 bg-accent mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: ShieldCheck, title: "Calidad Certificada", desc: "Equipos con certificaciones internacionales CE e ISO." },
            { icon: Truck, title: "Entrega Nacional", desc: "Logística ágil con seguimiento en todo el Perú." },
            { icon: PenTool, title: "Soporte Técnico", desc: "Instalación y mantenimiento por especialistas." },
            { icon: CreditCard, title: "Financiamiento", desc: "Opciones de pago adaptadas a tu flujo de caja." },
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,102,204,0.15)" }}
              className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-slate-100 transition-all duration-300 group"
            >
              <div className="h-14 w-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-6 group-hover:scale-110 group-hover:bg-accent group-hover:text-white transition-all duration-300">
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-dark mb-3">{feature.title}</h3>
              <p className="text-muted leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <motion.h2 
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="text-3xl md:text-5xl font-bold text-dark mb-2"
              >
                Equipos Estrella
              </motion.h2>
              <p className="text-muted text-lg">Lo más solicitado por los profesionales.</p>
            </div>
            <Button variant="ghost" className="hidden md:flex">Ver Todo</Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product, i) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -12 }}
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group flex flex-col"
              >
                <div className="relative h-60 p-6 bg-slate-100 flex items-center justify-center overflow-hidden">
                  <motion.img 
                    src={product.img} 
                    alt={product.title}
                    className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                  {product.badge && (
                    <span className="absolute top-4 left-4 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      {product.badge}
                    </span>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="text-xs font-bold text-accent uppercase tracking-wider mb-2">{product.category}</div>
                  <h3 className="text-lg font-bold text-dark mb-2 line-clamp-2">{product.title}</h3>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="text-xl font-extrabold text-accent">S/ {product.price.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <button 
                      onClick={() => setSelectedProduct(product)}
                      className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 md:hidden flex justify-center">
            <Button variant="ghost">Ver Todo</Button>
          </div>
        </div>
      </section>

      {/* Value Block - UPDATED: Continuous Floating Animation */}
      <section className="py-32 px-6 bg-white overflow-hidden relative">
        <div className="max-w-[1200px] mx-auto">
           <div className="text-center mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-bold text-accent"
            >
              ¿Por Qué Elegir Xtreme Group?
            </motion.h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: "🔬", title: "Tecnología", text: "Certificada internacionalmente." },
              { icon: "👨‍⚕️", title: "Asesoría", text: "Guía experta para tu elección." },
              { icon: "🛡️", title: "Garantía", text: "Hasta 24 meses extendida." },
              { icon: "📦", title: "Entrega", text: "Programada a tu consultorio." }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="bg-accent text-white p-6 sm:p-8 rounded-3xl text-center relative shadow-xl shadow-accent/20"
                  initial={{ opacity: 0, y: 100 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  animate={{
                    y: [0, -15, 0]  // Animación flotante continua
                  }}
                  transition={{
                // Solo la animación continua (flotante)
                y: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.7
                },
                // La entrada (initial → whileInView) usa transition por defecto o puedes definirla separada
                opacity: { duration: 0.8, delay: i * 0.15 },
                // Para y en la entrada, Framer usa spring por defecto, pero puedes forzar:
                default: { 
                  duration: 0.8, 
                  delay: i * 0.15,
                  type: 'spring',
                  stiffness: 50
                }
              }}
                >
                <div className="text-5xl mb-6 drop-shadow-md">{item.icon}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-blue-100">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-blue-50 to-white relative overflow-hidden">
        <div className="max-w-[1000px] mx-auto text-center relative z-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-block mb-4"
          >
            <span className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-dark animate-pulse">
              TOKUYAMA DENTAL
            </span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-4xl font-bold text-dark mb-6 leading-tight"
          >
            Más de 100 años de experiencia nos respaldan.<br/>Somos más que una resina, <span className="text-accent">SOMOS INNOVACIÓN.</span>
          </motion.h2>
          
<motion.div 
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.4 }}
  whileHover={{ scale: 1.02 }}
  className="mt-12 bg-white p-4 rounded-3xl shadow-2xl transition-transform duration-500"
>
  <img 
    src="images/tokuyama.png" 
    alt="Tokuyama Banner" 
    className="w-full h-auto object-contain rounded-2xl"
  />
</motion.div>
        </div>
      </section>
            {/* SECCIÓN PREMIUM: Preview de Suscripciones XTREME PRIME */}
      <section className="py-32 px-6 bg-gradient-to-b from-white to-slate-50 overflow-hidden relative">
        {/* Partículas decorativas */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <Particle key={i} delay={i * 0.6} />
          ))}
        </div>

        <div className="max-w-[1400px] mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-7xl font-black text-dark mb-6">
              Membresías <span className="text-accent">XTREME PRIME</span>
            </h2>
            <p className="text-xl text-muted max-w-3xl mx-auto">
              Multiplica tus beneficios: descuentos exclusivos, puntos acelerados y ventajas VIP para profesionales como tú.
            </p>
          </motion.div>

          {/* Grid de 3 planes */}
          <div className="grid md:grid-cols-3 gap-10 mb-16">
            {[
              {
                name: 'Regular',
                badge: 'Acceso Básico',
                price: 'Gratis',
                discount: '5%',
                points: '1x',
                shipping: 'Envío: Estándar',
                color: 'from-gray-400 to-gray-600',
                recommended: false
              },
              {
                name: 'Prime Básico',
                badge: 'Más Popular',
                price: 'S/ 350',
                subprice: '/año',
                discount: '10%',
                points: '2x',
                shipping: 'Envío: Gratis > S/300',
                color: 'from-accent to-accent-dark',
                recommended: true
              },
              {
                name: 'Prime Pro',
                badge: 'Élite',
                price: 'S/ 800',
                subprice: '/año',
                discount: '20% VIP',
                points: '3x',
                shipping: 'Envío: Gratis TOTAL',
                color: 'from-yellow-400 to-amber-600',
                recommended: true
              }
            ].map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.8, type: "spring", stiffness: 100 }}
                whileHover={{ y: -15, scale: 1.03 }}
                className={`relative p-8 sm:p-10 rounded-3xl shadow-2xl border-2 flex flex-col transition-all duration-500 ${
                plan.recommended 
                  ? plan.name === 'Prime Pro' 
                    ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-amber-500 ring-4 sm:ring-8 ring-amber-200 sm:scale-105 z-10' 
                    : 'bg-gradient-to-br from-accent/10 to-white border-accent ring-4 sm:ring-8 ring-accent/20 sm:scale-105 z-10'
                  : 'bg-white border-slate-200'
              }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-accent text-white 
                px-4 py-1 sm:px-6 sm:py-2
                rounded-full text-xs sm:text-sm 
                font-black uppercase tracking-widest 
                shadow-2xl whitespace-nowrap">

                    {plan.badge}
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`inline-flex items-center gap-3 text-white px-6 py-3 rounded-full font-bold shadow-lg bg-gradient-to-r ${plan.color}`}>
                    <Star size={24} />
                    <span className="text-xl">{plan.name}</span>
                  </div>
                </div>

                <div className="text-center mb-10">
                  <p className="text-5xl font-black text-dark">
                    {plan.price}
                  </p>
                  {plan.subprice && <p className="text-muted mt-2">{plan.subprice}</p>}
                </div>

                <ul className="space-y-5 mb-12 flex-1">
                  <li className="flex items-center gap-4 text-dark">
                    <Check size={20} className="text-green-500" />
                    <span><strong>{plan.discount}</strong> Descuento</span>
                  </li>
                  <li className="flex items-center gap-4 text-dark">
                    <Check size={20} className="text-green-500" />
                    <span><strong>{plan.points}</strong> Puntos por compra</span>
                  </li>
                  <li className="flex items-center gap-4 text-dark">
                    <Check size={20} className="text-green-500" />
                    <span>{plan.shipping}</span>
                  </li>
                </ul>

                <Link to="/suscripciones" className="mt-auto">
                  <Button 
                    variant={plan.recommended ? "primary" : "ghost"}
                    className={`w-full py-5 text-lg font-black rounded-2xl ${
                      plan.recommended ? '' : 'border-2 border-accent hover:bg-accent hover:text-white'
                    }`}
                  >
                    {plan.name === 'Regular' ? 'Tu Plan Actual' : 'Elegir Plan'}
                    <ChevronRight size={20} className="ml-2" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* CTA Final de la sección */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <Link to="/suscripciones">
              <Button variant="primary" className="mx-auto flex items-center px-12 py-4 sm:py-6 text-xl sm:text-2xl font-black shadow-2xl shadow-accent/40">
                Descubre Todos los Beneficios PRIME
                <ChevronRight size={28} className="ml-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      {/* Newsletter */}
      <section className="py-24 px-6 bg-slate-900 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            ¿Listo para Modernizar tu Clínica?
          </motion.h2>
          <p className="text-slate-400 mb-8 text-lg">Obtén una cotización personalizada sin compromiso.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <input 
              type="email" 
              placeholder="Tu email profesional" 
              className="px-6 py-4 rounded-2xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-accent w-full max-w-sm"
            />
            <Button variant="primary">Enviar</Button>
          </div>
        </div>
      </section>

      <Modal 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        product={selectedProduct} 
      />
    </>
  );
};

export default Home;