import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '../contexts/UserContext';
import Button from '../components/ui/Button';
import { getUserLevel } from '../constants';
import { Link } from 'react-router-dom';
import { Trophy, Star, Crown, Copy, CheckCircle, Gift, Zap, Shield, ArrowUpRight, User, Package } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

const UserProfile: React.FC = () => {
  const { user, updateUser } = useUser();

  const userPoints = user?.points || 0;
  const userLevel = getUserLevel(userPoints);
  const discountPercent = userLevel.discount;

  const nextLevelPoints = userLevel.name === 'Bronze' ? 500 : userLevel.name === 'Silver' ? 1000 : null;
  const progress = nextLevelPoints ? Math.min((userPoints / nextLevelPoints) * 100, 100) : 100;

  const benefits = {
    Bronze: ['5% descuento en todo', 'Acceso a ofertas flash', 'Soporte estándar'],
    Silver: ['10% descuento exclusivo', 'Envío gratis > S/500', 'Soporte prioritario', 'Acceso anticipado a lanzamientos'],
    Gold: ['15% descuento VIP', 'Envío gratis siempre', 'Soporte 24/7 dedicado', 'Regalos exclusivos', 'Invitaciones a eventos']
  }[userLevel.name];

  const [referralCode, setReferralCode] = useState(user?.referralCode || '');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user && !user.referralCode) {
      const newCode = uuidv4().slice(0, 8).toUpperCase();
      updateUser({ referralCode: newCode });
      setReferralCode(newCode);
    } else if (user?.referralCode) {
      setReferralCode(user.referralCode);
    }
  }, [user, updateUser]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || ''
    }
  });

  const onSubmit = (data: FormData) => {
    updateUser({ ...user, ...data });
    alert('¡Datos actualizados con éxito!');
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) {
    return (
      <div className="pt-28 pb-20 px-6 text-center">
        <p className="text-2xl text-muted">Inicia sesión para acceder a tu perfil exclusivo</p>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      {/* Hero Perfil */}
      <motion.div 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl md:text-6xl font-black text-dark mb-4">
          Bienvenido, <span className="text-accent">{user.name || user.email}</span>
        </h1>
        <p className="text-xl text-muted">Tu centro de fidelidad y beneficios exclusivos</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
{/* Nivel y Progreso – Tarjeta ULTRA PREMIUM Corregida */}
<motion.div 
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
  className="lg:col-span-2 bg-accent-dark rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.4)] border border-white/10 overflow-hidden relative group"
>
  {/* Capa 1: Fondo dinámico azul con movimiento (Original) */}
  <motion.div 
    animate={{ 
      background: [
        "radial-gradient(circle at 20% 20%, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%)",
        "radial-gradient(circle at 80% 80%, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%)",
        "radial-gradient(circle at 20% 20%, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%)"
      ] 
    }}
    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
    className="absolute inset-0 bg-gradient-to-br from-accent via-accent-dark to-black opacity-90"
  />

  {/* Capa 2: Brillo premium Glassmorphism (Original) */}
  <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] pointer-events-none" />

  {/* Capa 3: Animación de Rayo de luz (Original) */}
  <motion.div 
    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 w-[40%] h-full"
    animate={{ x: ['-150%', '350%'] }}
    transition={{ duration: 4, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
  />

  <div className="p-10 relative z-10">
    {/* FILA SUPERIOR: NIVEL Y PUNTOS */}
    <div className="flex items-center justify-between mb-10">
      <div>
        <h2 className="text-2xl text-white font-bold mb-6">Tu Estatus VIP</h2>
        
        <div className="flex items-center gap-6">
          <motion.div 
            animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-7xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          >
            {userLevel.name === 'Gold' ? <Crown className="text-yellow-400" size={72} /> : 
             userLevel.name === 'Silver' ? <Trophy className="text-slate-300" size={72} /> : 
             <Trophy className="text-orange-500" size={72} />}
          </motion.div>

          <div className="flex flex-col">
            <p className={`text-6xl font-black bg-gradient-to-r ${userLevel.color} bg-clip-text text-transparent filter drop-shadow-sm leading-none`}>
              {userLevel.name}
            </p>
            <p className="text-lg text-white font-bold flex items-center gap-2 mt-2">
              <span className="h-2 w-2 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]" />
              {discountPercent}% Descuento Exclusivo
            </p>
          </div>
        </div>
      </div>

      <div className="text-accent bg-white px-6 py-4 rounded-2xl shadow-[0_0_10px_rgba(255,255,255,0.3)]">
        <p className="text-lg text-accent font-black mb-1 text-center">Puntos Totales</p>
        <motion.p 
          className="text-6xl font-black text-accent text-center drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {userPoints}
        </motion.p>
      </div>
    </div>

    

            {/* Barra de progreso premium */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-white font-medium mb-3">
                <span>Nivel actual</span>
                <span>{nextLevelPoints ? `Siguiente: ${userLevel.name === 'Bronze' ? 'Silver' : 'Gold'}` : 'Nivel máximo'}</span>
              </div>
              <div className="h-8 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  className="h-full bg-gradient-to-r from-accent to-accent-dark relative overflow-hidden"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 2, ease: "easeOut" }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse" />
                </motion.div>
              </div>
              <p className="text-center mt-3 text-white font-medium mb-8">
                {nextLevelPoints ? (
                  <span>Faltan <strong className="text-accent bg-white px-2 py-0.5 rounded-md shadow-[0_0_10px_rgba(255,255,255,0.3)]">{nextLevelPoints - userPoints}</strong> puntos para el siguiente nivel</span>
                ) : (
                  <span className="text-accent font-bold">¡Has alcanzado el nivel máximo! 🏆</span>
                )}
              </p>
            </div>

{/* Beneficios premium */}
<h3 className="text-2xl text-white font-bold mb-8">Beneficios Exclusivos</h3>

{/* Este es el grid de beneficios */}
<div className="grid md:grid-cols-2 gap-6">
  {benefits.map((benefit, i) => (
    <motion.div 
      key={i}
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + i * 0.1 }}
      className="flex items-center gap-4 bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-accent/10"
      whileHover={{ scale: 1.03, borderColor: 'rgb(59 130 246)' }}
    >
      <div className="h-12 w-12 bg-accent/20 rounded-2xl flex items-center justify-center">
        <Star size={24} className="text-accent" />
      </div>
      <p className="font-medium text-dark">{benefit}</p>
    </motion.div>
  ))}

  {/* BOTÓN CENTRADO: Lo metemos como un hijo del grid que ocupa toda la fila 
      o lo alineamos debajo de la primera columna */}
<div className="md:col-span-2 flex justify-center mt-10">
  <Link to="/order-history">
    <Button
      variant="primary"
      /* Mantenemos el centrado total y el gap */
      className="w-76 py-4 text-lg font-bold bg-accent hover:bg-accent-dark text-white rounded-xl shadow-xl shadow-accent/20 transition-all active:scale-95 flex items-center justify-center group"
    >
      {/* Contenedor del icono con animación y margen extra */}
      <motion.div
        whileHover={{ y: -5 }} // Salto sutil hacia arriba
        transition={{ type: "spring", stiffness: 300, damping: 10 }}
        className="flex items-center justify-center mr-3" // mr-4 da el espacio real que buscas
      >
        <Package size={28} />
      </motion.div>

      <span className="leading-none">Historial de Pedidos</span>
    </Button>
  </Link>
</div>
</div>
</div>
</motion.div>

        {/* Panel derecho – Código referido + Edición */}
<div className="space-y-8">
  {/* Código referido premium */}
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
    className="bg-gradient-to-br from-accent to-accent-dark rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden border border-white/10"
  >
    <motion.div 
      className="absolute inset-0 bg-white/10"
      animate={{ opacity: [0.1, 0.3, 0.1] }}
      transition={{ duration: 4, repeat: Infinity }}
    />

    <div className="relative z-10">
      <h3 className="text-2xl font-bold mb-6">Invita y Gana</h3>
      <p className="text-white/90 mb-6 text-lg">
        Comparte tu código y gana <strong>100 puntos</strong> por cada amigo que compre.
      </p>

      {/* Contenedor flex ajustado para evitar que se corte */}
      <div className="flex items-center gap-3 mb-6">
        <input 
          type="text"
          value={referralCode}
          readOnly
          className="min-w-0 flex-1 px-4 py-4 rounded-2xl bg-white/20 border border-white/30 text-white placeholder-white/50 text-lg font-bold text-center"
        />
<Button 
  variant="ghost" 
  onClick={copyReferral}
  /* bg-white forzado sin transparencias y eliminamos el efecto hover de fondo */
  className="shrink-0 w-16 h-16 bg-white hover:bg-white flex items-center justify-center rounded-2xl shadow-2xl p-0 transition-transform active:scale-95 border-none"
  style={{ backgroundColor: '#ffffff', opacity: 1 }} 
>
  {copied ? (
    <motion.div 
      initial={{ scale: 0.5, opacity: 0 }} 
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center justify-center"
    >
      <CheckCircle 
        size={44} // Tamaño extra grande para que se note
        className="text-black" // Negro como pediste
        strokeWidth={3} 
      />
    </motion.div>
  ) : (
    <Copy 
      size={36} // Tamaño grande para el estado inicial
      className="text-black" // Negro sólido todo el tiempo
      strokeWidth={2.5} 
    />
  )}
</Button>
      </div>

      {/* Mensaje de éxito tal cual lo tenías antes */}
      {copied && (
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white/90 font-medium text-xl"
        >
          ¡Código copiado!
        </motion.p>
      )}
    </div>
  </motion.div>


{/* Edición de datos – Versión PREMIUM Compacta */}
<motion.div 
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.6 }}
  className="bg-white rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden"
>
  {/* Acento superior sutil */}
  <div className="absolute top-0 left-0 w-full h-1 bg-accent" />

  <div className="flex items-center justify-between mb-6">
    <div>
      <h3 className="text-2xl font-bold text-dark">Mis Datos</h3>
      <p className="text-xs text-slate-400 font-medium">Actualiza tu información</p>
    </div>
    <User className="text-dark" size={40}/>
  </div>
  
  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
    <div className="grid grid-cols-1 gap-4">
      
      {/* Campo: Nombre - Título AZUL y Compacto */}
      <div className="flex flex-col gap-1.5 text-left">
        <label className="text-lg font-bold text-accent ml-1">
          Nombre completo
        </label>
        <input 
          {...register('name', { required: true })}
          defaultValue={ user.name} // Autollenado
          placeholder={user.name}
          className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-100 focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all text-dark outline-none font-medium"
        />
        {errors.name && <p className="text-red-500 text-xs mt-0.5 ml-2 font-bold uppercase">Requerido</p>}
      </div>

      {/* Campo: Email - Título AZUL y Compacto */}
      <div className="flex flex-col gap-1.5 text-left">
        <label className="text-lg font-bold text-accent ml-1">
          Email
        </label>
        <input 
          {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
          defaultValue={user.email} // Autollenado
          placeholder={user.email}
          className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-100 focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all text-dark outline-none font-medium"
        />
        {errors.email && <p className="text-red-500 text-xs mt-0.5 ml-2 font-bold uppercase">Email inválido</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Campo: Teléfono */}
        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-lg font-bold text-accent ml-1">
            Teléfono
          </label>
          <input 
            {...register('phone')}
            defaultValue={user?.phone || ""}
            placeholder="Teléfono"
            className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-100 focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all text-dark outline-none font-medium"
          />
        </div>

        {/* Campo: Dirección */}
        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-lg font-bold text-accent ml-1">
            Dirección
          </label>
          <input 
            {...register('address')}
            defaultValue={user?.address || ""}
            placeholder="Tu dirección"
            className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-100 focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all text-dark outline-none font-medium"
          />
        </div>
      </div>
    </div>

    <Button 
      type="submit" 
      variant="primary" 
      className="w-full py-4 text-lg font-bold bg-accent hover:bg-accent-dark text-white rounded-xl shadow-lg shadow-accent/20 transition-all active:scale-95 mt-2"
    >
      Guardar Cambios
    </Button>
  </form>
</motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;