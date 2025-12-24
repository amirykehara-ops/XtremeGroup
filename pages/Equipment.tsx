import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ArrowUpRight, ArrowDownUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PRODUCTS } from '../constants';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Product } from '../types';
import { useUser } from '../contexts/UserContext';
import { getUserLevel } from '../constants'; // o '../constants/index' según tu estructura

const Equipment: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  // State for Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('relevance');
  const [availability, setAvailability] = useState('any');
  const [priceRange, setPriceRange] = useState(100);
  // Busca donde dice: const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
// Y reemplázalo por esto:

const allProducts = JSON.parse(localStorage.getItem('admin_products') || JSON.stringify(PRODUCTS));
const [visibleProducts, setVisibleProducts] = useState<Product[]>(allProducts);

  // NUEVO: Categoría seleccionada
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  // NUEVO: Paginación
  const [currentPage, setCurrentPage] = useState(1);
    const { user } = useUser();

  // Lógica de nivel y descuento (igual que en ProductDetail)

  const userLevel = user ? getUserLevel(user.points || 0) : getUserLevel(0);
  const discountPercent = userLevel.discount;
  const productsPerPage = 8; // Cambia aquí si quieres más o menos por página

  useEffect(() => {
    let filtered = allProducts.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAvailability = availability === 'any' ? true : (availability === 'stock' ? p.stock : !p.stock);
      const maxPrice = 10000 * (priceRange / 100);
      const matchesPrice = p.price <= maxPrice;

      // NUEVO: Filtro por categoría
      const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;

      return matchesSearch && matchesAvailability && matchesPrice && matchesCategory;
    });

    if (sortOption === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      filtered.sort((a, b) => b.price - b.price);
    }

    setVisibleProducts(filtered);
    setCurrentPage(1); // Resetear página al filtrar
  }, [searchQuery, sortOption, availability, priceRange, selectedCategory]);

  // Paginación
  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = visibleProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(visibleProducts.length / productsPerPage);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' });
  };


  return (
    <div className="pt-28 pb-20 px-6 max-w-[1400px] mx-auto min-h-screen">
      {/* Hero Section */}
      <div className="text-center mb-16 max-w-4xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-4xl md:text-6xl font-bold text-dark mb-6"
        >
          Equipamiento Profesional
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted text-lg mb-8"
        >
          Sillas, autoclaves, compresores, radiología y más. Soluciones integrales para clínicas y laboratorios con el respaldo de Xtreme Group.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <Button variant="primary" className="px-8" onClick={() => document.getElementById('products-grid')?.scrollIntoView({behavior: 'smooth'})}>
            Explorar Productos
          </Button>
          <Button variant="ghost" className="px-8">
            Solicitar Cotización
          </Button>
        </motion.div>
      </div>

      {/* NUEVA SECCIÓN: Explora por Categoría */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-dark">
          Explora por Categoría
        </h2>
        <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
          {['Todos', 'Motores Eléctricos', 'Lámparas', 'Implantes', 'Endo Motor', 'Fotocurado', 'Ultrasonidos', 'Mobiliario', 'Localizadores', 'Mantenimiento'].map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 shadow-md ${
                selectedCategory === cat
                  ? 'bg-accent text-white shadow-accent/40'
                  : 'bg-white text-dark border border-slate-200 hover:bg-accent hover:text-white hover:border-accent'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Filters Bar - Tu diseño original intacto */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 mb-12"
      >
        <div className="flex flex-col lg:flex-row gap-6 lg:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 items-center flex-1 w-full">
            <div className="relative w-full md:w-64">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar producto, marca..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all bg-slate-50 text-sm"
              />
            </div>
            <div className="relative w-full md:w-48">
               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                 <ArrowDownUp size={16} />
               </span>
               <select 
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-accent bg-slate-50 text-sm appearance-none cursor-pointer"
               >
                 <option value="relevance">Relevancia</option>
                 <option value="price-asc">Precio: Menor a Mayor</option>
                 <option value="price-desc">Precio: Mayor a Menor</option>
               </select>
            </div>
            <div className="w-full md:w-40">
               <select 
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-accent bg-slate-50 text-sm appearance-none cursor-pointer"
               >
                 <option value="any">Disponibilidad: Cualquiera</option>
                 <option value="stock">En Stock</option>
                 <option value="preorder">Pre-orden</option>
               </select>
            </div>
            <div className="w-full md:w-48 flex flex-col justify-center">
              <div className="flex justify-between text-xs text-muted mb-1">
                <span>Precio</span>
                <span>{priceRange === 100 ? 'Todos' : `< S/ ${(10000 * priceRange/100).toLocaleString()}`}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={priceRange} 
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-accent" 
              />
            </div>
          </div>
          <div className="text-center lg:text-right text-sm text-muted font-medium whitespace-nowrap pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 w-full lg:w-auto">
            <span className="inline-block bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-bold mr-2">
              {PRODUCTS.length} productos
            </span>
            Mostrando <strong className="text-dark">{visibleProducts.length}</strong> de <strong>{PRODUCTS.length}</strong>
          </div>
        </div>
      </motion.section>

      {/* Product Grid */}
      <div id="products-grid">
        <motion.div 
          layout 
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          <AnimatePresence>
            {currentProducts.length > 0 ? (
              currentProducts.map((product, i) => (
                <motion.div
                  layout
                  key={product.id}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "50px" }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  whileHover={{ y: -12, rotate: 1 }}
                  className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 hover:shadow-2xl hover:border-accent/20 group flex flex-col transition-all duration-300"
                >
                <div className="relative h-64 bg-slate-50 rounded-2xl overflow-hidden mb-5 flex items-center justify-center">
                  <img 
                    src={product.img} 
                    alt={product.title} 
                    className="max-w-[85%] max-h-[85%] object-contain group-hover:scale-110 transition-transform duration-500 ease-in-out" 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <div className="bg-white p-2.5 rounded-full shadow-lg text-accent hover:bg-accent hover:text-white transition-colors">
                      <ArrowUpRight size={20} />
                    </div>
                  </div>
                  {product.badge && (
                    <span className="absolute top-3 left-3 bg-accent text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide shadow-md">
                      {product.badge}
                    </span>
                  )}
                </div>
                  
                  <div className="flex-1 flex flex-col px-2">
                    <div className="text-xs font-bold text-accent uppercase tracking-wider mb-2">{product.category}</div>
                    <h3 className="text-lg font-bold text-dark mb-3 leading-tight hover:text-accent transition-colors line-clamp-2">
                      {product.title}
                    </h3>
                    
                    <div className="mt-auto pt-4 relative">
                      {/* Badge nivel – Encima del botón "Ver" (esquina inferior derecha) */}
                      {/* Badge y precio con descuento – Solo si hay sesión iniciada */}
                      {user && discountPercent > 0 && (
                        <div className="absolute bottom-0 right-0 mb-12 mr-2 z-10">
                          <motion.span 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className={`text-xs font-bold text-white px-3 py-1.5 rounded-full bg-gradient-to-r ${userLevel.color} shadow-lg`}
                          >
                            -{discountPercent}% {userLevel.name}
                          </motion.span>
                        </div>
                      )}

                      <div className="flex items-end justify-between">
                        <div>
                          <span className="text-xs text-muted block mb-0.5">Precio Online</span>
                          
                          {user && discountPercent > 0 ? (
                            <div>
                              <span className="text-base text-muted line-through opacity-70">
                                S/ {product.price.toLocaleString('es-PE') }
                              </span>
                              <motion.span 
                                className="block text-2xl font-black text-accent mt-1"
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                S/ {(product.price * (1 - discountPercent / 100)).toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                              </motion.span>
                            </div>
                          ) : (
                            <span className="text-2xl font-black text-accent">
                              S/ {product.price.toLocaleString('es-PE')}
                            </span>
                          )}
                        </div>

                        <Button 
                          variant="small-primary" 
                          className="rounded-xl px-5"
                          onClick={() => setSelectedProduct(product)}
                        >
                          Ver
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-32"
              >
                <div className="text-6xl mb-4">No results</div>
                <h3 className="text-xl font-bold text-dark mb-2">No se encontraron productos</h3>
                <p className="text-muted">Intenta ajustar tus filtros o búsqueda.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* NUEVA PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-16 mb-8">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-muted hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            className="px-4 py-2 text-sm font-medium text-muted hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}

      <Modal 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        product={selectedProduct} 
      />
    </div>
  );
};

export default Equipment;