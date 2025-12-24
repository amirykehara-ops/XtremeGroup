import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { PRODUCTS } from '../constants';
import { ChevronRight, Check, Search, X, ShoppingBag, Flame, ChevronDown } from 'lucide-react';
import { Product } from '../types';
import { useLocation } from 'react-router-dom';  
import { useCart } from '../contexts/CartContext';
import { useUser } from '../contexts/UserContext';
import AuthModal from '../components/ui/AuthModal';
import { getUserLevel } from '../constants'; // o '../constants/index' según tu estructura

const ProductDetail: React.FC = () => {
  const { login } = useUser();
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id || '0', 10);
  const location = useLocation();
  const { addToCart } = useCart();
  const { user } = useUser();  // ← AÑADE ESTA LÍNEA
  const [showRequireAuthModal, setShowRequireAuthModal] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  // 1. Buscamos el producto en AMBOS catálogos
  const allProducts = React.useMemo(() => {
    const map = new Map<number, Product>();
    
    // 1. Cargar productos base (estáticos)
    PRODUCTS.forEach(p => map.set(p.id, p));
    
    // 2. Cargar productos del Admin (dinámicos)
    const saved = localStorage.getItem('admin_products');
    if (saved) {
      const adminProducts: Product[] = JSON.parse(saved);
      adminProducts.forEach(p => map.set(p.id, p));
    }
    
    return Array.from(map.values());
  }, []);

  const product = allProducts.find(p => p.id === productId);

const userLevel = user ? getUserLevel(user.points || 0) : getUserLevel(0);
const discountPercent = userLevel.discount;
// Precio Black Friday (el de oferta que ya tienes, 1.8 es tu multiplicador original)
const blackFridayPrice = product.price;

// Precio final = Black Friday - descuento nivel
const discountedPrice = blackFridayPrice * (1 - discountPercent / 100);
  // 2. Si no existe → 404
  if (!product) {
    return (
      <div className="pt-28 pb-20 px-6 max-w-[1400px] mx-auto text-center min-h-screen">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-dark mt-20"
        >
          Producto no encontrado
        </motion.h2>
      </div>
    );
  }

  const fromRoute = location.state?.from as 'clinica' | 'equipamiento' | undefined;

  const breadcrumbCategory = fromRoute === 'clinica' ? 'Clínica' : 'Equipamiento';
  const relatedProductsArray = PRODUCTS; // ← Siempre usas PRODUCTS, no hay problema

  // 4. Estado del color (ahora sí es seguro usar product)
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors?.[0] || 'Azul Eléctrico'
  );
  const [lightboxOpen, setLightboxOpen] = useState(false); 
  const [lightboxImage, setLightboxImage] = useState('');

  const openLightbox = (imgSrc: string) => {
    setZoom(1); // Reset zoom when opening
    setPosition({ x: 0, y: 0 });
    setLightboxImage(imgSrc);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxImage('');
  };

  if (!product) {
    return (
      <div className="pt-28 pb-20 px-6 max-w-[1400px] mx-auto min-h-screen text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-dark mt-20"
        >
          Producto no encontrado
        </motion.h2>
      </div>
    );
  }

  const pdfUrl = `/manuales/manual-${product.id}.pdf`; // PDFs en public/manuales/
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
    const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleMouseLeave = () => {
    setDragging(false);
  };


  // Generar nombre seguro para imágenes adicionales
  const baseImgName = product.img.split('/').pop()?.replace('.jpg', '') || 'product';

  return (
    <div className="pt-28 pb-20 px-6 max-w-[1400px] mx-auto min-h-screen">
      {/* Breadcrumb */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-2 text-sm text-muted mb-8 flex-wrap"
      >
        <Link to="/" className="hover:text-accent transition-colors">Inicio</Link>
        <ChevronRight size={14} />
    <Link to={breadcrumbCategory === 'Clínica' ? '/clinica' : '/equipamiento'} className="hover:text-accent transition-colors">
    {breadcrumbCategory}
    </Link>
        <ChevronRight size={14} />
        <span className="text-dark font-medium">{product.title}</span>
      </motion.nav>

      {/* Sección Principal */}
      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* Imagen Principal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <img 
            src={product.img} 
            alt={product.title}
            className="w-full h-auto rounded-3xl shadow-xl object-cover"
          />
          {product.badge && (
            <span className="absolute top-4 left-4 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
              {product.badge}
            </span>
          )}
        </motion.div>

        {/* Info del Producto */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-dark mb-4">{product.title}</h1>
            
            <motion.div 
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.4 }}
  className="mb-12 flex flex-col gap-6"  // ← Jerarquía vertical, gap para espacio armonioso
>
  {/* Black Friday – Mantiene impacto principal con animaciones */}
  <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-600 text-white px-8 py-8 rounded-3xl shadow-2xl relative overflow-hiddenw-full md:w-[485px]">
    {/* Fuego animado – Dinámico */}
    <motion.div 
      className="absolute top-1 right-8 "
      animate={{ y: [20, 30, 20] }}
      transition={{ duration: 0.6, repeat: Infinity }}
    >
      <Flame size={48} className="absolute right-8 top-1/2 -translate-y-1 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)] z-0" />
    </motion.div>
    {/* Precio tachado */}
    <div className="text-lg opacity-80 line-through mb-2">
      Precio Regular: S/ {(product.price * 1.8).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </div>

    <div className="flex items-baseline gap-4">
      <span className="text-sm uppercase font-black tracking-wider animate-pulse">
        BLACK FRIDAY
      </span>

      <motion.span 
        className="text-3xl font-black"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.6 }}
      >
        S/. {product.price.toLocaleString('es-PE', { minimumFractionDigits: 2, 
    maximumFractionDigits: 2 })}
      </motion.span>

      <motion.span 
        className="absolute right-5 top-1/2 -translate-y-1/2 bg-yellow-400 text-black px-5 py-2 rounded-full text-lg font-black shadow-lg"
        initial={{ scale: 0 }}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 0.6, delay: 0.8, repeat: Infinity, repeatDelay: 3 }}
      >
        -{Math.floor(100 - (product.price / (product.price * 1.8)) * 100)}% OFF
      </motion.span>
    </div>

    <div className="text-sm mt-3 font-bold tracking-wider animate-pulse">
      Oferta por tiempo limitado • ¡Solo hoy!
    </div>
  </div>
  </motion.div>

            {/* Descuento por nivel + Precio final – Unificado, con fondo azul fuerte y brillo */}
            {user && discountPercent > 0 ? (

              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 25, delay: 0.8 }}
                className="-mt-4 max-w-2xl w-full max-w-lg rounded-3xl shadow-xl border-2 border-accent overflow-hidden relative"
              >
                {/* Fondo azul fuerte con degradado (similar al botón carrito) */}
                <div className="bg-gradient-to-br from-accent to-accent-dark p-5 border-b border-accent-dark/50 relative overflow-hidden">
                  {/* Brillo animado cada cierto tiempo (cada 5 segundos) */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
                  />

                  <div className="relative z-10 flex items-center justify-between gap-6">
                    <motion.div 
                      animate={{ scale: [1, 1.04, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="inline-block"
                    >
                      <span className="text-lg font-medium text-white/90">
                        Precio Exclusivo 
                      </span>
                      <span className={`bg-gradient-to-r ${userLevel.color} text-white px-3 py-1.5 rounded-md text-lg font-black shadow-md ml-2`}>
                        {userLevel.name}
                      </span>
                    </motion.div>

                    <div className="text-right">
                      <p className="text-sm text-white/90 font-medium">Ahorras extra</p>
                      <motion.p 
                        className="text-2xl font-black text-white"
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
                      >
                        S/. {(product.price - discountedPrice).toLocaleString('es-PE', { minimumFractionDigits: 2, 
    maximumFractionDigits: 2})}
                      </motion.p>
                    </div>
                  </div>
                </div>

                {/* Precio final – Animaciones avanzadas, impactante y adictivo */}
                <div className="p-6 text-center">
                  {/* "Tu precio final exclusivo" – Fade-in suave */}
                  <motion.p 
                    className="text-lg font-medium text-muted mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.1 }}
                  >
                    Tu Precio Final Exclusivo
                  </motion.p>

                  {/* Precio GIGANTE – Entrada explosiva + latido suave */}
                  <motion.div 
                    className="mb-3"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 250, damping: 18, delay: 1.3 }}
                  >
                    <motion.p 
                      className="text-4xl md:text-5xl lg:text-6xl font-black text-accent tracking-tight mb-4"
                      animate={{ scale: [1, 1.04, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                     S/ {discountedPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </motion.p>
                  </motion.div>

                  {/* "Black Friday + descuento" – Fade-in + hover lift */}
                  <motion.p 
                    className="text-xl font-bold text-dark opacity-90 mb-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.6 }}
                    whileHover={{ y: -3 }}
                  >
                    Black Friday + Descuento {userLevel.name}
                  </motion.p>

                  {/* Ahorro total – Pulse fuerte + entrada */}
                  <motion.p 
                    className="text-lg font-black text-accent mb-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ 
                      opacity: 1, 
                      scale: [1, 1.1, 1] // Fusionamos la entrada con el latido
                    }}
                    transition={{ 
                      opacity: { duration: 0.6, delay: 1.8 },
                      scale: { 
                        duration: 2, 
                        repeat: Infinity, 
                        repeatDelay: 3, 
                        delay: 1.8 
                      } 
                    }}
                  >
                    AHORRO TOTAL: S/ {(product.price * 1.8 - discountedPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </motion.p>

                  {/* Mensaje final – Fade-in suave + hover pulse */}
                  <motion.p 
                    className="text-sm text-muted italic"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 2 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    ¡Sigue acumulando puntos para más ahorros exclusivos!
                  </motion.p>
                </div>
                
              </motion.div>
              
            ) : null}
              {/* Mensaje motivador – Siempre visible, según nivel actual */}

              {user && (
              <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-8 bg-gradient-to-br from-slate-50 to-white rounded-3xl p-7 shadow-xl border-4 border-slate-100 text-center"
            >
              {user?.points >= 1000 ? (
                <p className="text-2xl font-black text-accent">
                  ¡Eres Gold 🏆 – Nivel máximo alcanzado!
                </p>
              ) : user?.points >= 500 ? (
                <p className="text-xl font-bold text-dark">
                  ¡Estás a <span className="text-accent font-black">{1000 - (user.points || 0)}</span> puntos de Gold 🏆!
                </p>
              ) : (
                <p className="text-xl font-bold text-dark">
                  ¡Estás a <span className="text-accent font-black">{500 - (user?.points || 0)}</span> puntos de Silver 🥈!
                </p>
              )}
              <p className="text-muted mt-3">
                Compra más para desbloquear descuentos exclusivos
              </p>
            </motion.div>
              )}
            <p className="text-muted mb-4 mt-8">Impuestos incluidos. Envío en 3 días hábiles.</p>
            <p className="text-muted mb-8 leading-relaxed">{product.desc}</p>
          </div>
          {/* Especificaciones – Diseño premium encima de cantidad */}
            <section className="my-8">
            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-dark mb-2 text-left"
            >
                Especificaciones Técnicas
            </motion.h2>
            <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
                className="bg-gradient-to-br from-slate-50 to-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12"
            >
                <div className="grid md:grid-cols-2 gap-6">
                {product.specs.map((spec, index) => (
                    <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 group"
                    >
                    <div className="mt-1 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
                        <Check size={18} className="text-accent group-hover:text-white transition-colors" />
                    </div>
                    <p className="text-muted text-base leading-relaxed group-hover:text-dark transition-colors">
                        {spec}
                    </p>
                    </motion.div>
                ))}
                </div>
            </motion.div>
</section>

{/* Opciones – Botón ligeramente más pequeño, label a la izquierda, botón centrado */}
<div className="flex flex-col gap-6 mb-12">
  <div className="flex items-center justify-start gap-6">  {/* Label a la izquierda */}
    <label className="text-lg font-semibold text-dark">Cantidad:</label>
    <input 
      type="number" 
      defaultValue={1} 
      min={1} 
      className="w-24 px-4 py-3 text-center border-2 border-slate-200 rounded-2xl focus:border-accent focus:outline-none transition-colors text-lg font-medium"
    />
  </div>
  {/* Color – 100% dinámico según los colores del producto */}
{product.colors && product.colors.length > 0 && (
  <div className="flex items-center gap-6">
    <label className="text-lg font-semibold text-dark min-w-32">Color:</label>
    <div className="relative">
      <select
        value={selectedColor}
        onChange={(e) => setSelectedColor(e.target.value)}
        className="appearance-none bg-white border-2 border-slate-200 rounded-2xl pl-12 pr-12 py-3 text-lg font-medium text-dark focus:border-accent focus:outline-none transition-colors cursor-pointer hover:border-accent/50"
      >
        {product.colors.map((color) => (
          <option key={color} value={color}>
            {color}
          </option>
        ))}
      </select>

      {/* Bolita de color – DINÁMICA según el color seleccionado */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <div 
          className="w-6 h-6 rounded-full shadow-md border-2 border-white"
          style={{
            backgroundColor: 
              selectedColor === 'Azul Eléctrico' ? '#0066FF' :
              selectedColor === 'Rojo Fuego' ? '#FF3333' :
              selectedColor === 'Verde Esmeralda' ? '#00C853' :
              selectedColor === 'Morado Premium' ? '#8E24AA' :
              selectedColor === 'Naranja Vibrante' ? '#FF6D00' :
              selectedColor === 'Amarillo Solar' ? '#FFD600' :
              selectedColor === 'Rosa Impacto' ? '#FF1744' :
              selectedColor === 'Turquesa Marino' ? '#00BFA5' :
              selectedColor === 'Gris Titanio' ? '#263238' :
              selectedColor === 'Dorado Luxe' ? '#FFA000' :
              '#666' // fallback
          }}
        />
      </div>

      {/* Flecha */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <ChevronDown size={20} className="text-slate-500" />
      </div>
    </div>
  </div>
)}
{/* BLOQUE PUNTOS – Animado, colorido y constante */}
<motion.div 
  className="mt-6 text-center"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.6 }}
>
  <motion.div 
    className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white px-8 py-4 rounded-full shadow-2xl text-xl font-bold tracking-wider"
    animate={{ 
      scale: [1, 1.05, 1],
      boxShadow: ["0 10px 30px rgba(0,0,0,0.3)", "0 20px 50px rgba(236,72,153,0.6)", "0 10px 30px rgba(0,0,0,0.3)"]
    }}
    transition={{ 
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    <motion.span 
      animate={{ rotate: [0, 10, -10, 0] }}
      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
      className="text-2xl"
    >
      ✨
    </motion.span>
    Puntos por tu Compra: +{product.points} pts
    <motion.span 
      animate={{ rotate: [0, -10, 10, 0] }}
      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2, delay: 0.3 }}
      className="text-2xl"
    >
      ✨
    </motion.span>
  </motion.div>
</motion.div>
  <div className="flex justify-center mt-8">  {/* Solo centra el botón */}
<Button 
  variant="primary" 
  className="w-fit px-8 py-4 text-lg font-bold shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
onClick={(e) => {
  e.stopPropagation();
  e.preventDefault();
  if (!user) {
    setShowRequireAuthModal(true);
  } else {
    // Lee el valor actual del input de cantidad
    const quantityInput = document.querySelector('input[type="number"]') as HTMLInputElement;
    const quantity = quantityInput ? Math.max(1, parseInt(quantityInput.value) || 1) : 1;

    // Crea una copia del product con precio descuento
    const discountedProduct = { ...product, price: discountedPrice };
    addToCart(discountedProduct, quantity, selectedColor);
    if (quantityInput) quantityInput.value = '1';
  }
}}
>
  <span className="relative z-20 flex items-center gap-2">
    <ShoppingBag size={20} />
    AÑADIR AL CARRITO
  </span>
            {/* Efecto pulse para incitar al clic */}
            <motion.div 
            className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100"
            initial={{ scale: 0 }}
            whileHover={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400 }}
            />
        </Button>
      </div>
      </div>

      {/* Compartir */}
          <div className="flex items-center gap-4 text-muted text-sm">
            <span className="font-medium">Compartir:</span>
            <a href="#" className="hover:text-accent transition-colors">Compartir 🔁</a>
            <a href="#" className="hover:text-accent transition-colors">Tuitear 𝕏</a>
            <a href="#" className="hover:text-accent transition-colors">Pinterest 𝓟</a>
          </div>
        </motion.div>
      </div>
{/* Políticas – Versión atractiva con iconos y animaciones */}
    <section className="my-16">
    <h2 className="text-2xl font-bold text-dark mb-8 text-center">Nuestras Garantías para Ti</h2>
    <div className="grid md:grid-cols-3 gap-8">
        {[
        { icon: "🔒", title: "Política de Seguridad", color: "from-blue-500 to-blue-600" },
        { icon: "🚚", title: "Política de Entrega", color: "from-green-500 to-emerald-600" },
        { icon: "↩️", title: "Política de Devolución", color: "from-purple-500 to-purple-600" }
        ].map((pol, i) => (
        <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, duration: 0.6 }}
            whileHover={{ y: -8, scale: 1.03 }}
            className="group relative bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden transition-all duration-300"
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${pol.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
            <div className="p-8 text-center">
            <div className="text-5xl mb-4">{pol.icon}</div>
            <h4 className="text-xl font-bold text-dark mb-3">{pol.title}</h4>
            <p className="text-muted text-sm leading-relaxed">
                Editar con el módulo de Información de seguridad y confianza para el cliente.
            </p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </motion.div>
        ))}
    </div>
    </section>

      {/* Detalles del Producto */}
      <section className="mb-16">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-dark mb-6"
        >
          Detalles del Producto
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted leading-relaxed text-lg"
        >
          {/* Aquí va tu descripción larga personalizada */}
          Esta es la descripción completa del producto. Puedes editarla directamente en el código o hacerla dinámica desde constants.ts. Incluye todos los detalles técnicos, beneficios, usos recomendados, certificaciones, etc.
        </motion.p>
      </section>

      {/* INDICACIONES Y BENEFICIOS – Diseño premium y animado */}
    <section className="my-20">
      <div className="grid md:grid-cols-2 gap-12">
        
        {/* INDICACIONES */}
        {product.ind && (
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-blue-50 to-white rounded-3xl p-10 shadow-xl border border-blue-100"
          >
            <h3 className="text-2xl font-bold text-accent mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
              </div>
              Indicaciones
            </h3>
            <p className="text-lg text-slate-700 leading-relaxed">
              {product.ind.split(' • ').map((item, i) => (
                <span key={i}>
                  {item.trim()}
                  {i < product.ind.split(' • ').length - 1 && <span className="text-accent"> • </span>}
                  <br />
                </span>
              ))}
            </p>
          </motion.div>
        )}

        {/* BENEFICIOS */}
        {product.ben && (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-gradient-to-br from-emerald-50 to-white rounded-3xl p-10 shadow-xl border border-emerald-100"
          >
            <h3 className="text-2xl font-bold text-emerald-600 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600/20 rounded-full flex items-center justify-center">
              </div>
              Beneficios
            </h3>
            <p className="text-lg text-slate-700 leading-relaxed">
              {product.ben.split(' • ').map((item, i) => (
                <span key={i}>
                  {item.trim()}
                  {i < product.ben.split(' • ').length - 1 && <span className="text-emerald-600"> • </span>}
                  <br />
                </span>
              ))}
            </p>
          </motion.div>
        )}
      </div>
    </section>
      {/* ================================================== */}
{/* 1. IMÁGENES DEL PRODUCTO */}
{/* ================================================== */}
<section className="my-24">
  <motion.h2 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    className="text-3xl md:text-4xl font-bold text-center mb-12 text-center"
  >
    Imágenes del Producto
  </motion.h2>

  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
    {[1, 2, 3, 4].map((i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay: i * 0.1 }}
        whileHover={{ scale: 1.05, y: -10 }}
        className="group relative rounded-3xl overflow-hidden shadow-2xl cursor-pointer"
        onClick={() => openLightbox(product.img)}
      >
        <img 
          src={product.img} 
          alt={`${product.title} - vista ${i}`}
          className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-6">
          <span className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl flex items-center gap-2">
            <Search size={20} className="text-accent" />
            <span className="text-sm font-bold">Ver en grande</span>
          </span>
        </div>
      </motion.div>
    ))}
  </div>
</section>

{/* ================================================== */}
{/* 2. TABLAS COMPARATIVAS – GRÁFICAS SIMULADAS */}
{/* ================================================== */}
<section className="my-24 py-16 bg-gradient-to-b from-slate-50 to-white rounded-3xl">
  <motion.h2 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    className="text-3xl md:text-4xl font-bold text-center mb-12"
  >
    Comparativa Técnica
  </motion.h2>

  <div className="max-w-5xl mx-auto mt-12">
    <div className="grid md:grid-cols-3 gap-8">
      {/* Columna 1: Característica */}
      <div className="space-y-6">
        <h4 className="font-bold text-dark text-lg">Características</h4>
        {['Velocidad', 'Precisión', 'Batería', 'Peso', 'Garantía'].map((feat) => (
          <div key={feat} className="py-4 px-6 bg-white rounded-2xl shadow-md text-center font-medium">
            {feat}
          </div>
        ))}
      </div>

      {/* Columna 2: Tu producto (destacado) */}
      <div className="space-y-6">
        <h4 className="font-bold text-accent text-lg text-center">Xtreme {product.title.split(' ')[0]}</h4>
        {[
          { value: '30.000 RPM', color: 'bg-green-500' },
          { value: '±0.02 mm', color: 'bg-green-500' },
          { value: '12 horas', color: 'bg-green-500' },
          { value: '180g', color: 'bg-green-500' },
          { value: '24 meses', color: 'bg-green-500' }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1.05 }}
            className={`py-4 px-6 rounded-2xl text-white font-black text-center shadow-xl ${item.color}`}
          >
            {item.value}
          </motion.div>
        ))}
      </div>

      {/* Columna 3: Competencia */}
      <div className="space-y-6">
        <h4 className="font-bold text-slate-500 text-lg text-center">Competencia Media</h4>
        {['25.000 RPM', '±0.1 mm', '6 horas', '250g', '12 meses'].map((val, i) => (
          <div key={i} className="py-4 px-6 bg-slate-100 rounded-2xl text-center font-medium text-slate-600">
            {val}
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

{/* ================================================== */}
{/* GRÁFICOS COMPARATIVOS – Nivel DIOS */}
{/* ================================================== */}
<div className="mt-20 max-w-6xl mx-auto">
  <motion.h3 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    className="text-2xl md:text-3xl font-bold text-center mb-12 text-accent"
  >
    Análisis Técnico Visual
  </motion.h3>

  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

    {/* 1. Gráfico Circular – Precisión */}
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl p-8 shadow-2xl text-center"
    >
      <h4 className="font-bold text-lg mb-4">Precisión</h4>
      <div className="relative w-40 h-40 mx-auto">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10"/>
          <motion.circle 
            cx="50" cy="50" r="45" fill="none" stroke="#0066FF"
            strokeWidth="10" strokeDasharray="283" 
            initial={{ strokeDashoffset: 283 }}
            whileInView={{ strokeDashoffset: 283 * 0.02 }}  // 98% precisión
            transition={{ duration: 2, ease: "easeOut" }}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-black text-accent">98%</span>
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-600">vs 75% promedio competencia</p>
    </motion.div>

    {/* 2. Barras – Velocidad */}
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-3xl p-8 shadow-2xl text-center"
    >
      <h4 className="font-bold text-lg mb-4">Velocidad Máxima</h4>
      <div className="flex items-end justify-center gap-4 h-40">
        <motion.div 
          initial={{ height: 0 }}
          whileInView={{ height: "80%" }}
          transition={{ duration: 1.8, delay: 0.4 }}
          className="w-16 bg-slate-300 rounded-t-2xl"
        >
          <span className="text-xs text-slate-600 mt-2 block">25k</span>
        </motion.div>
        <motion.div 
          initial={{ height: 0 }}
          whileInView={{ height: "100%" }}
          transition={{ duration: 1.2, delay: 0.6 }}
          className="w-20 bg-gradient-to-t from-accent to-blue-600 rounded-t-2xl shadow-lg"
        >
          <span className="text-lg font-black text-white mt-2 block">30k RPM</span>
        </motion.div>
      </div>
      <p className="mt-4 text-sm text-slate-600">+20% más rápido</p>
    </motion.div>

    {/* 3. Línea – Duración Batería */}
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-3xl p-8 shadow-2xl text-center"
    >
      <h4 className="font-bold text-lg mb-4">Autonomía</h4>
      <div className="h-40 flex items-end justify-center">
        <svg viewBox="0 0 200 120" className="w-full">
          <polyline 
            fill="none" stroke="#e5e7eb" strokeWidth="4"
            points="20,100 60,85 100,60 140,30 180,20"
          />
          <motion.polyline 
            fill="none" stroke="#0066FF" strokeWidth="6"
            points="20,100 60,85 100,60 140,30 180,20"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 0.8 }}
          />
          <text x="180" y="15" className="text-2xl font-black text-accent">12h</text>
        </svg>
      </div>
      <p className="mt-4 text-sm text-slate-600">100% más autonomía</p>
    </motion.div>

    {/* 4. Dispersión – Peso vs Potencia */}
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6 }}
      className="bg-white rounded-3xl p-8 shadow-2xl text-center"
    >
      <h4 className="font-bold text-lg mb-4">Peso vs Potencia</h4>
      <div className="relative h-40">
        <svg viewBox="0 0 200 160" className="w-full">
          {/* Competencia */}
          <circle cx="60" cy="100" r="12" fill="#94a3b8" opacity="0.6"/>
          <circle cx="90" cy="80" r="15" fill="#94a3b8" opacity="0.6"/>
          <circle cx="140" cy="70" r="18" fill="#94a3b8" opacity="0.6"/>
          
          {/* Tu producto – DESTACADO */}
          <motion.circle 
            cx="160" cy="40" r="25" fill="#0066FF"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="drop-shadow-2xl"
          />
          <text x="160" y="30" className="text-sm font-bold text-white text-center">Xtreme</text>
        </svg>
      </div>
      <p className="mt-4 text-sm text-slate-600">El más ligero y potente</p>
    </motion.div>

  </div>
</div>

{/* ================================================== */}
{/* 3. CASOS DE USO – 3 IMÁGENES */}
{/* ================================================== */}
<section className="my-24">
  <motion.h2 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    className="text-3xl md:text-4xl font-bold text-center mb-12"
  >
    Casos de Uso Real
  </motion.h2>

  <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
    {[
      { title: "Endodoncia Avanzada", desc: "Tratamientos complejos con máxima precisión" },
      { title: "Clínicas Móviles", desc: "Portátil y potente en cualquier lugar" },
      { title: "Cirugía Estética", desc: "Resultados impecables en procedimientos delicados" }
    ].map((caso, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.2 }}
        whileHover={{ y: -12 }}
        className="group relative rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="h-80 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
          <img src={product.img} alt={caso.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <h3 className="text-2xl font-bold mb-2">{caso.title}</h3>
          <p className="text-lg opacity-90">{caso.desc}</p>
        </div>
      </motion.div>
    ))}
  </div>
</section>
        {/* Galería de Imágenes – con Lightbox funcional y atractivo */}
        <section className="my-20">
        <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold text-dark mb-10 text-center"
        >
            Vista Detallada del Producto
        </motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((num) => (
            <motion.div
                key={num}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: num * 0.1, type: "spring", stiffness: 80 }}
                whileHover={{ scale: 1.08, y: -12 }}
                className="group relative overflow-hidden rounded-3xl shadow-lg cursor-pointer"
                onClick={() => openLightbox(product.img)}  // ← Abre lightbox con la imagen principal
            >
                <img 
                src={product.img}
                alt={`${product.title} - Vista ${num}`}
                className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-125"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-6">
                <div className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 translate-y-8 group-hover:translate-y-0 transition-transform duration-500 border border-accent/20">
                    <Search size={22} className="text-accent" />
                    <span className="text-sm font-bold text-dark">Ampliar Imagen</span>
                </div>
                </div>
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-500 pointer-events-none" />
            </motion.div>
            )
            )}
        </div>
        </section>
          {/* ================================================== */}
    {/* PRODUCTOS RELACIONADOS – Igual que Equipamiento */}
    {/* ================================================== */}
    <section className="my-24">
      <motion.h2 
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="text-3xl md:text-4xl font-bold text-dark mb-12"
      >
        Productos Relacionados
      </motion.h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
        {relatedProductsArray
          .filter(p => p.id > product.id && p.id <= product.id + 5)  // ← Los 5 siguientes
          .map((related, i) => (
            <motion.div 
              key={related.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -12 }}
              className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group flex flex-col"
            >
              <Link 
                  to={`/product/${related.id}`} 
                  state={{ from: fromRoute || 'equipamiento' }} 
                  className="flex flex-col h-full"
                >
                <div className="relative h-60 p-6 bg-slate-100 flex items-center justify-center overflow-hidden">
                  <motion.img 
                    src={related.img} 
                    alt={related.title}
                    className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500"
                    whileHover={{ scale: 1.1 }}
                  />
                  {related.badge && (
                    <span className="absolute top-4 left-4 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      {related.badge}
                    </span>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="text-xs font-bold text-accent uppercase tracking-wider mb-2">
                    {related.category}
                  </div>
                  <h3 className="text-lg font-bold text-dark mb-2 line-clamp-2">
                    {related.title}
                  </h3>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="text-xl font-extrabold text-dark">
                      S/ {related.price.toLocaleString('es-PE')}
                    </span>
                    <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
      </div>
    </section>
      {/* Botón Descargar Manual */}
      <div className="text-center">
        <motion.a 
        href={pdfUrl} 
        download 
        className="inline-block bg-accent hover:bg-accent-dark text-white font-bold text-lg px-12 py-5 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
        >
        Descargar el Manual 📄
        </motion.a>
      </div>
      {/* Lightbox Modal – Pantalla completa, borde pegado */}
      {/* Lightbox Modal – Pantalla completa, imagen llena siempre */}
      {lightboxOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={closeLightbox}
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-0"  // p-0 para 0 márgenes
        >
          <motion.div
            key={lightboxImage}
            initial={{ scale: 0.4, opacity: 0, rotate: -15 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.4, opacity: 0, rotate: 15 }}
            transition={{ type: "spring", stiffness: 200, damping: 22, mass: 1.4 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-screen h-screen flex items-center justify-center"  // w-screen h-screen para full screen
          >
            <div 
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                cursor: dragging ? 'grabbing' : zoom > 1 ? 'grab' : 'default',
                transition: dragging ? 'none' : 'transform 0.3s ease-out'
              }}
              className="relative w-full h-full flex items-center justify-center group"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              <img 
                src={lightboxImage} 
                alt="Imagen ampliada del producto"
                className="w-full h-full object-contain"  // w-full h-full object-contain para llenar pantalla sin cortar
              />
            </div>
          </motion.div>

          {/* Botón cerrar – Fijo en esquina superior derecha */}
          <button
            onClick={closeLightbox}
            className="fixed top-4 right-4 bg-white/90 text-dark hover:bg-accent hover:text-white rounded-full p-3 shadow-xl transition-all duration-300 hover:scale-110 z-[10000]"
          >
            <X size={28} strokeWidth={2.5} />
          </button>

          {/* Botones Zoom – Abajo centrados */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur-md rounded-full px-5 py-3 shadow-2xl"
          >
            <button 
              onClick={(e) => {
                e.stopPropagation();
                const newZoom = Math.max(0.25, zoom - 0.25);
                setZoom(newZoom);
                if (newZoom === 1) setPosition({ x: 0, y: 0 });
              }}
              className="w-10 h-10 flex items-center justify-center text-2xl font-bold text-dark hover:text-accent transition-colors rounded-full hover:bg-slate-100"
            >
              −
            </button>
            <span className="text-base font-bold text-dark min-w-[4rem] text-center">
              {zoom.toFixed(2)}x
            </span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setZoom(Math.min(4, zoom + 0.25));
              }}
              className="w-10 h-10 flex items-center justify-center text-2xl font-bold text-dark hover:text-accent transition-colors rounded-full hover:bg-slate-100"
            >
              +
            </button>
          </div>
        </motion.div>
      )}
{showRequireAuthModal && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={() => setShowRequireAuthModal(false)}
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center"
      onClick={(e) => e.stopPropagation()}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <ShoppingBag size={40} className="text-accent" />
      </motion.div>

      <h2 className="text-2xl font-bold text-dark mb-4">
        ¡Inicia sesión para añadir al carrito!
      </h2>
      <p className="text-muted mb-8">
        Necesitas estar registrado para guardar productos en tu carrito.
      </p>

      <div className="flex flex-col gap-4">
        <Button 
          variant="primary" 
          className="w-full py-4 text-lg"
          onClick={() => {
            setShowRequireAuthModal(false);
            setShowLogin(true);  // ← Abre el AuthModal de login
          }}
        >
          Iniciar Sesión
        </Button>
        <Button 
          variant="ghost" 
          className="w-full py-4 text-lg"
          onClick={() => {
            setShowRequireAuthModal(false);
            setShowRegister(true);  // ← Abre el AuthModal de registro
          }}
        >
          Crear Cuenta
        </Button>
        <button 
          onClick={() => setShowRequireAuthModal(false)}
          className="text-sm text-muted hover:text-dark transition-colors mt-2"
        >
          Continuar sin añadir al carrito
        </button>
      </div>
    </motion.div>
  </motion.div>
)}

{/* MODALES DE AUTENTICACIÓN REALES */}
{showLogin && (
  <AuthModal 
    type="login" 
    onClose={() => setShowLogin(false)} 
    onAuthSuccess={() => {
      setShowLogin(false);}} 
  login={login}
  />
)}

{showRegister && (
  <AuthModal 
    type="register" 
    onClose={() => setShowRegister(false)} 
    onAuthSuccess={() => setShowRegister(false)} 
    login={login}
  />
)}

    </div>
  );
};

export default ProductDetail;