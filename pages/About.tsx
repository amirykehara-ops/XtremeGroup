import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MapPin, Target, Eye, Building2, Globe, Users, Trophy } from 'lucide-react';

const About: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const yRange = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <div className="pt-28 pb-20 overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="px-6 max-w-[1200px] mx-auto mb-32">
        <div className="grid md:grid-cols-2 gap-16 items-center perspective-1000">
          <motion.div
            initial={{ opacity: 0, x: -100, rotateY: 10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100px" }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="h-2 bg-accent mb-8"
            />
            <h1 className="text-5xl md:text-7xl font-bold text-dark mb-8 leading-tight">
              Impulsando la <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-dark">Odontología del Futuro</span>
            </h1>
            <p className="text-xl text-muted mb-10 leading-relaxed max-w-lg">
              Xtreme Group Company lidera la importación y distribución de productos dentales en Perú, con un compromiso inquebrantable con la calidad y la innovación.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <motion.div 
                whileHover={{ scale: 1.05, translateY: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-dark text-white p-8 rounded-3xl shadow-xl relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:rotate-12 duration-500">
                    <Target size={100} />
                </div>
                <Target className="text-accent mb-4 relative z-10" size={32} />
                <h3 className="text-2xl font-bold mb-3 relative z-10">Misión</h3>
                <p className="text-slate-300 text-sm leading-relaxed relative z-10">Brindar acceso a las marcas más prestigiosas, garantizando calidad e innovación para el profesional moderno.</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05, translateY: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-accent text-white p-8 rounded-3xl shadow-xl relative overflow-hidden group"
              >
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:-rotate-12 duration-500">
                    <Eye size={100} />
                </div>
                <Eye className="text-white mb-4 relative z-10" size={32} />
                <h3 className="text-2xl font-bold mb-3 relative z-10">Visión</h3>
                <p className="text-blue-100 text-sm leading-relaxed relative z-10">Ser la empresa líder reconocida por su excelencia y aporte al desarrollo tecnológico en Perú.</p>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, delay: 0.2, type: "spring" }}
            className="relative"
            style={{ y: yRange }} // Parallax effect
          >
            <div className="absolute inset-0 bg-accent rounded-[3rem] rotate-6 opacity-10 blur-xl scale-105"></div>
            <img 
              src="images/centro.jpg" 
              alt="Local" 
              className="relative rounded-[3rem] shadow-2xl z-10 w-full h-auto object-cover border-4 border-white" 
            />
            
            {/* Floating Stats Cards */}
            <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-10 -left-10 bg-white p-6 rounded-2xl shadow-xl z-20 flex items-center gap-4 border border-slate-100"
            >
                <div className="p-3 bg-green-100 text-green-600 rounded-full">
                    <Trophy size={24} />
                </div>
                <div>
                    <div className="font-bold text-dark text-xl">#1 en Perú</div>
                    <div className="text-xs text-muted">Distribuidor Oficial</div>
                </div>
            </motion.div>

             <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -top-10 -right-5 bg-white p-6 rounded-2xl shadow-xl z-20 flex items-center gap-4 border border-slate-100"
            >
                <div className="p-3 bg-blue-100 text-accent rounded-full">
                    <Users size={24} />
                </div>
                <div>
                    <div className="font-bold text-dark text-xl">5k+ Clientes</div>
                    <div className="text-xs text-muted">Confían en nosotros</div>
                </div>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* Timeline / Journey */}
      <section className="bg-slate-50 py-32 px-6 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <div className="absolute top-20 left-20 w-64 h-64 bg-accent rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="text-center mb-20">
            <motion.span 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-accent font-bold tracking-widest uppercase text-sm mb-2 block"
            >
                Nuestra Historia
            </motion.span>
            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-6xl font-bold text-dark mb-4"
            >
                El Viaje de Xtreme Group
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { year: '2003', icon: <Globe />, title: 'El Origen', desc: 'Fundada el 17 de septiembre con una misión clara: transformar la odontología.', img: 'images/operando.png' },
              { year: 'Hoy', icon: <Building2 />, title: 'Showroom Premium', desc: 'Inauguramos espacios innovadores para que explores la tecnología antes de comprar.', img: 'images/showroom.png' },
              { year: 'Futuro', icon: <Target />, title: 'Centro Training', desc: 'Próxima apertura del centro de formación avanzada con simuladores.', img: 'images/centroc.png' },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 50, rotateX: 10 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.2, duration: 0.8 }}
                whileHover={{ y: -15, scale: 1.02 }}
                className="bg-white rounded-[2rem] overflow-hidden shadow-xl group cursor-default"
              >
                <div className="h-56 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity"></div>
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                  <div className="absolute bottom-4 left-4 z-20">
                     <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent text-white text-sm font-bold rounded-full shadow-lg">
                        {item.year}
                     </span>
                  </div>
                </div>
                <div className="p-8 relative">
                   <div className="absolute -top-8 right-8 w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-accent z-20 group-hover:rotate-12 transition-transform duration-300">
                       {item.icon}
                   </div>
                  <h3 className="text-2xl font-bold text-dark mb-3 group-hover:text-accent transition-colors">{item.title}</h3>
                  <p className="text-muted leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations - Staggered List */}
      <section className="py-24 px-6 max-w-[1000px] mx-auto">
        <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-3xl md:text-5xl font-bold text-dark mb-16 text-center"
        >
            Nuestras Ubicaciones
        </motion.h2>
        
        <div className="grid sm:grid-cols-2 gap-8">
           <motion.div 
             initial={{ x: -50, opacity: 0 }}
             whileInView={{ x: 0, opacity: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6 }}
             whileHover={{ scale: 1.02 }}
             className="bg-white p-10 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-slate-100"
           >
             <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-blue-50 text-accent rounded-2xl">
                  <Building2 size={28} />
                </div>
                <h3 className="text-2xl font-bold text-dark">Oficinas Principales</h3>
             </div>
             <ul className="space-y-6">
               {['Centro de Operaciones – Lima, Cercado', 'Oficinas Corporativas – Lima, San Isidro', 'Oficinas Administrativas – Lima, Emancipación'].map((loc, i) => (
                 <motion.li 
                    key={i} 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    className="flex items-start gap-4 text-muted group"
                >
                    <div className="mt-1 p-1 bg-slate-100 rounded-full group-hover:bg-accent group-hover:text-white transition-colors">
                        <MapPin size={16} />
                    </div>
                    <span className="group-hover:text-dark transition-colors">{loc}</span>
                 </motion.li>
               ))}
             </ul>
           </motion.div>

           <motion.div 
             initial={{ x: 50, opacity: 0 }}
             whileInView={{ x: 0, opacity: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6 }}
             whileHover={{ scale: 1.02 }}
             className="bg-white p-10 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-slate-100"
           >
             <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
                  <Building2 size={28} />
                </div>
                <h3 className="text-2xl font-bold text-dark">Almacenes</h3>
             </div>
             <ul className="space-y-6">
               {['Almacén Principal – Lima, Lurín', 'Almacén Satélite 1 – Lima, Los Olivos', 'Almacén Satélite 2 – Lima, Rímac'].map((loc, i) => (
                 <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    className="flex items-start gap-4 text-muted group"
                 >
                    <div className="mt-1 p-1 bg-slate-100 rounded-full group-hover:bg-green-500 group-hover:text-white transition-colors">
                        <MapPin size={16} />
                    </div>
                    <span className="group-hover:text-dark transition-colors">{loc}</span>
                 </motion.li>
               ))}
             </ul>
           </motion.div>
        </div>
      </section>

    </div>
  );
};

export default About;