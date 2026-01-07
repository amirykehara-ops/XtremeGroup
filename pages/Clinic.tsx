  import React, { useState, useEffect } from 'react';
  import { motion, AnimatePresence } from 'framer-motion';
  import { Filter, Search, ChevronRight, Package, Truck, Tag, ArrowDownUp, Star } from 'lucide-react';
  import { PRODUCTS } from '../constants';
  import Button from '../components/ui/Button';
  import Modal from '../components/ui/Modal';
  import { Product } from '../types'
  import { Link } from 'react-router-dom';  // ← ESTA LÍNEA ES LA CLAVE
  import { useUser } from '../contexts/UserContext';
  import { getUserBenefits, getSubscriptionColor} from '../constants'; // ← Añade esta línea

const Clinic: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // --- NUEVA LÓGICA DINÁMICA ---
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = () => {
      const saved = localStorage.getItem('admin_products');
      if (saved) {
        setAllProducts(JSON.parse(saved));
      } else {
        // Fallback inicial si no hay nada en memoria
        setAllProducts(PRODUCTS);
      }
    };

    loadProducts();

    // Escuchar cambios si el Admin está abierto en otra pestaña
    window.addEventListener('storage', loadProducts);
    return () => window.removeEventListener('storage', loadProducts);
  }, []);
  // -----------------------------

  // Filtros avanzados
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('relevance');
  const [availability, setAvailability] = useState('any');
  const [priceRange, setPriceRange] = useState(100);
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const { user } = useUser();

  // NUEVA LÓGICA DE SUSCRIPCIÓN
const benefits = getUserBenefits(user?.subscription || 'regular');
const discountPercent = benefits.discount;
const badgeColor = getSubscriptionColor(user?.subscription || 'regular');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  const categories = ['Todos', 'Motores Eléctricos', 'Lámparas', 'Implantes', 'Endo Motor', 'Fotocurado', 'Ultrasonidos', 'Mobiliario', 'Localizadores', 'Mantenimiento'];

  // FILTRADO Y ORDENADO (Ahora usa 'allProducts' en lugar de 'PRODUCTS')
  const filteredProducts = React.useMemo(() => {
    let result = allProducts.filter(p => {
      const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory;
      const matchesSearch = searchQuery === '' || 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAvailability = availability === 'any' ? true : 
        (availability === 'stock' ? p.stock : !p.stock);
      const maxPrice = 10000 * (priceRange / 100);
      const matchesPrice = p.price <= maxPrice;

      return matchesCategory && matchesSearch && matchesAvailability && matchesPrice;
    });

    if (sortOption === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (sortOption === 'price-desc') result.sort((a, b) => b.price - a.price);

    return result;
  }, [allProducts, activeCategory, searchQuery, availability, priceRange, sortOption]);

    // Paginación
    const indexOfLast = currentPage * productsPerPage;
    const indexOfFirst = indexOfLast - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const goToPage = (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
        window.scrollTo({ top: 600, behavior: 'smooth' });
      }
    };

    const handleCategoryChange = (cat: string) => {
      setActiveCategory(cat);
      setCurrentPage(1);
    };

    const handleFilterChange = () => {
      setCurrentPage(1);
    };

    return (
      <div className="pt-28 pb-20 px-6 max-w-[1400px] mx-auto min-h-screen">
        {/* Hero - 100% original */}
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="bg-gradient-to-br from-blue-50 to-white rounded-[2.5rem] p-8 md:p-16 mb-16 shadow-2xl border border-blue-100 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden group"
        >
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
          />
          
          <div className="flex-1 relative z-10">
            <motion.span initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="inline-block px-4 py-1.5 bg-accent/10 text-accent font-bold text-xs rounded-full mb-6 tracking-widest uppercase">
              Catálogo Clínico
            </motion.span>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-dark mb-6 leading-tight">
              Insumos y Tecnología <br/><span className="text-accent">para tu Práctica</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="text-muted text-lg mb-10 max-w-xl leading-relaxed">
              Catálogo profesional con fichas técnicas detalladas y cotización directa. 
              Potencia tu clínica con el respaldo de Xtreme Group.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
              className="flex flex-wrap gap-4">
              <Button variant="primary" className="px-8 py-4 text-base">Descargar Catálogo</Button>
              <Button variant="ghost" className="px-8 py-4 text-base">Solicitar Asesoría</Button>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.8, rotate: 10 }} animate={{ opacity: 1, scale: 1, rotate: 3 }} transition={{ delay: 0.5, type: "spring" }} whileHover={{ scale: 1.02 }}
            className="w-full md:w-[400px] bg-white p-6 sm:p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 relative z-20">
            <div className="space-y-6">
              {/* Tus 3 tarjetas de beneficios - sin cambios */}
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shadow-sm shrink-0">
                  <Package size={24} />
                </div>
                <div>
                  <div className="font-bold text-dark text-lg">Stock Garantizado</div>
                  <div className="text-sm text-muted">Disponibilidad inmediata en almacenes.</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-accent shadow-sm shrink-0">
                  <Tag size={24} />
                </div>
                <div>
                  <div className="font-bold text-dark text-lg">Precios Mayoristas</div>
                  <div className="text-sm text-muted">Descuentos especiales por volumen.</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shadow-sm shrink-0">
                  <Truck size={24} />
                </div>
                <div>
                  <div className="font-bold text-dark text-lg">Envío Express</div>
                  <div className="text-sm text-muted">Entrega prioritaria a clínicas.</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-10">
          {/* Sidebar - Todos los filtros */}
          <motion.aside 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 sticky top-28">
              <div className="flex items-center gap-2 mb-6 text-dark font-bold text-lg border-b border-slate-100 pb-4">
                <Filter size={20} />
                <h3>Filtros</h3>
              </div>

              {/* Búsqueda */}
              <div className="relative mb-6">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar producto..." 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-accent bg-slate-50 text-sm"
                />
              </div>

              {/* Categorías */}
              <div className="space-y-2 mb-6">
                {categories.map((cat) => (
                  <motion.button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all flex justify-between items-center font-medium ${
                      activeCategory === cat 
                        ? 'bg-accent text-white shadow-md shadow-accent/20' 
                        : 'hover:bg-slate-50 text-muted hover:text-dark'
                    }`}
                  >
                    {cat === 'Todos' ? 'Todos' : cat}
                    {activeCategory === cat && <ChevronRight size={16} />}
                  </motion.button>
                ))}
              </div>

              {/* Ordenar */}
              <div className="relative mb-4">
                <ArrowDownUp size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  value={sortOption} 
                  onChange={(e) => {
                    setSortOption(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm appearance-none cursor-pointer"
                >
                  <option value="relevance">Relevancia</option>
                  <option value="price-asc">Precio: Menor a Mayor</option>
                  <option value="price-desc">Precio: Mayor a Menor</option>
                </select>
              </div>

              {/* Disponibilidad */}
              <select 
                value={availability} 
                onChange={(e) => {
                  setAvailability(e.target.value);
                  handleFilterChange();
                }}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm mb-4"
              >
                <option value="any">Cualquier disponibilidad</option>
                <option value="stock">En stock</option>
                <option value="preorder">Pre-orden</option>
              </select>

              {/* Rango de precio */}
              <div>
                <div className="flex justify-between text-xs text-muted mb-2">
                  <span>Precio máximo</span>
                  <span className="font-bold text-accent">
                    {priceRange === 100 ? 'Todos' : `S/ ${(10000 * priceRange/100).toLocaleString()}`}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={priceRange} 
                  onChange={(e) => {
                    setPriceRange(Number(e.target.value));
                    handleFilterChange();
                  }}
                  className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer accent-accent" 
                />
              </div>
            </div>
          </motion.aside>

          {/* Grid de productos */}
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center mb-8 gap-4">
              <h2 className="text-3xl font-bold text-dark">
                {activeCategory === 'Todos' ? 'Todos los productos' : activeCategory}
              </h2>
              <div className="text-muted font-medium bg-slate-100 px-4 py-1.5 rounded-full text-sm">
                {filteredProducts.length} resultados encontrados
              </div>
            </div>

            <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="wait">
                {currentProducts.length > 0 ? (
                  currentProducts.map((product, i) => (
      <motion.div
        layout
        key={product.id}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "50px" }}
        transition={{ delay: i * 0.1, duration: 0.5 }}
        whileHover={{ y: -10, rotate: 1 }}
        className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group"
      >
        <div className="h-52 p-6 bg-slate-50 flex items-center justify-center relative">
          <img 
            src={product.img} 
            alt={product.title} 
            className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-4 right-4 bg-white p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity">
            <Search size={16} className="text-accent" />
          </div>
        </div>

        <div className="p-6">
          <div className="text-xs font-bold text-accent uppercase tracking-wider mb-2">{product.category}</div>
          
          <h3 className="font-bold text-dark text-lg mb-2 line-clamp-2">
            {product.title}
          </h3>
          
          <p className="text-sm text-muted mb-6 line-clamp-2">{product.desc}</p>
          
          <div className="relative pt-4 border-t border-slate-50">
            {/* Badge nivel – Solo con sesión y descuento, esquina superior derecha */}
{user && discountPercent > 0 && (
  <div className="absolute top-4 right-4 z-10">
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`flex items-center gap-1.5 ${badgeColor} text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg`}
    >
      <Star size={14} />
      <span>-{discountPercent}% {benefits.name}</span>
    </motion.div>
  </div>
)}

            <div className="flex items-end justify-between">
              <div>
                <span className="text-xs text-muted block mb-0.5">Precio Online</span>
                
                {user && discountPercent > 0 ? (
                  <div>
                    <span className="text-base text-muted line-through opacity-70">
                      S/ {product.price.toLocaleString('es-PE')}
                    </span>
                    <motion.span 
                      className="block text-xl font-black text-accent mt-1"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      S/ {(product.price * (1 - discountPercent / 100)).toLocaleString('es-PE', { minimumFractionDigits: 0 })}
                    </motion.span>
                  </div>
                ) : (
                  <span className="text-xl font-black text-accent">
                    S/ {product.price.toLocaleString('es-PE')}
                  </span>
                )}
              </div>

              <Button 
                variant="small-primary" 
                className="rounded-xl px-4"
                onClick={() => setSelectedProduct(product)}
              >
                + Info
              </Button>
            </div>
          </div>  
        </div>
      </motion.div>
                  ))
                  
                  ) : (
                  <div className="col-span-full text-center py-20">
                    <p className="text-2xl text-muted mb-4">No se encontraron productos</p>
                    <p className="text-muted">Prueba con otros filtros</p>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* PAGINACIÓN */}
            {totalPages > 1 && (
              <div className="flex flex-wrap justify-center items-center gap-3 mt-16">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-muted hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => goToPage(i + 1)}
                    className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${
                      currentPage === i + 1
                        ? 'bg-accent text-white shadow-lg'
                        : 'text-muted hover:bg-accent/10 hover:text-accent'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-muted hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
        <Modal 
          isOpen={!!selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          product={selectedProduct} 
        />
      </div>
    );
  };

  export default Clinic;