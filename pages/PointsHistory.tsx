import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import { PlusCircle, MinusCircle, Calendar, Trophy, Star } from 'lucide-react';

interface PointAdjustment {
  date: string;
  pointsChange: number;
  reason: string;
  displayDate?: string;
}

const PointsHistory: React.FC = () => {
  const { user } = useUser();
  const [adjustments, setAdjustments] = useState<PointAdjustment[]>([]);

 useEffect(() => {
  const loadHistory = () => {
    if (!user) {
      setAdjustments([]);
      return;
    }

    const savedUsers = localStorage.getItem('all_users');
    if (savedUsers) {
      try {
        const users = JSON.parse(savedUsers);
        const currentUser = users.find((u: any) => u.email === user.email);
        
        if (currentUser?.pointsHistory && currentUser.pointsHistory.length > 0) {
          // Ordenamos del más reciente al más antiguo
          const sorted = [...currentUser.pointsHistory].sort((a, b) => {
            const parseDate = (dateStr: string) => {
              if (dateStr.includes('T')) {
                return new Date(dateStr).getTime();
              } else {
                const parts = dateStr.split(',')[0].trim().split('/');
                if (parts.length === 3) {
                  return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
                }
                return 0;
              }
            };
            return parseDate(b.date) - parseDate(a.date);
          });

          const formatted = sorted.map(adj => {
            let displayDate = 'Fecha inválida';
            
            if (adj.date.includes('T')) {
              displayDate = new Date(adj.date).toLocaleDateString('es-PE', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
            } else {
              const parts = adj.date.split(',')[0].trim().split('/');
              if (parts.length === 3) {
                const dateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                displayDate = dateObj.toLocaleDateString('es-PE', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                });
                if (adj.date.includes(',')) {
                  displayDate += ', ' + adj.date.split(',')[1].trim();
                }
              }
            }

            return { ...adj, displayDate };
          });

          setAdjustments(formatted);
        } else {
          setAdjustments([]);
        }
      } catch (e) {
        console.error('Error leyendo historial', e);
        setAdjustments([]);
      }
    }
  };

  // Cargar al inicio
  loadHistory();

  // Escuchar cambios en localStorage (cuando el admin ajusta)
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'all_users') {
      loadHistory();
    }
  };

  window.addEventListener('storage', handleStorageChange);

  // Limpiar listener
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
}, [user]);
  if (!user) {
    return (
      <div className="pt-28 pb-20 px-6 text-center">
        <p className="text-2xl text-muted">Inicia sesión para ver tu historial</p>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-accent mb-4 text-center">
          Historial de Puntos
        </h1>
        <p className="text-lg sm:text-xl text-muted max-w-xl mx-auto">
          Todos los movimientos manuales en tu cuenta XTREME
        </p>
      </motion.div>

      <div className="space-y-6">
        <AnimatePresence>
          {adjustments.length > 0 ? (
            adjustments.map((adj, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 hover:shadow-accent/20 transition-all"
              >
                {/* Icono + / - */}
                <div className={`p-4 sm:p-5 rounded-3xl shadow-inner ${adj.pointsChange > 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
  {adj.pointsChange > 0 ? 
    <PlusCircle className="text-emerald-600" size={32} /> : 
    <MinusCircle className="text-red-600" size={32} />
  }
</div>

                {/* Info principal */}
                <div className="flex-1">
                  <p className={`text-2xl sm:text-3xl font-black ${adj.pointsChange > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {adj.pointsChange > 0 ? '+' : ''}{Math.abs(adj.pointsChange)} puntos
                  </p>
                  <p className="text-base sm:text-lg text-muted mt-2 font-medium">
                    {adj.reason}
                  </p>
                </div>

                {/* Fecha */}
                <div className="text-center sm:text-right mt-4 sm:mt-0">
  <Calendar size={20} className="text-muted mx-auto mb-2" />
  <p className="text-xs sm:text-sm font-bold text-dark max-w-[140px] mx-auto sm:mx-0">{adj.displayDate}</p>
  </div>


              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Trophy size={80} className="text-accent mx-auto mb-6 opacity-50" />
              <p className="text-xl sm:text-2xl text-muted">Aún no hay ajustes manuales</p>
<p className="text-base sm:text-lg text-muted mt-4 max-w-md mx-auto">Los movimientos aparecerán aquí cuando el admin los realice</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PointsHistory;