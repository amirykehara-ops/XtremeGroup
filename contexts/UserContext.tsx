import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';

interface User {
  id?: string;
  email: string;
  points: number;
  name?: string;
  phone?: string;
  address?: string;
  referralCode?: string;
  subscription: 'regular' | 'prime_basic' | 'prime_pro';
  subscriptionEndDate: string | null;

}

interface UserContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { clearCart: clearcart } = useCart();
  // 1. CARGA INICIAL: Usaremos siempre 'currentUser' para la sesión activa
  // 1. CARGA INICIAL + MIGRACIÓN AUTOMÁTICA A SUSCRIPCIONES
  useEffect(() => {
  let loadedUser: User | null = null;

  // 1. Intentamos cargar la sesión activa
  const current = localStorage.getItem('currentUser');
  if (current) {
    try {
      loadedUser = JSON.parse(current);
    } catch (e) {
      console.error('Error parseando currentUser', e);
      localStorage.removeItem('currentUser');
    }
  }

  // 2. Si no hay sesión activa, recuperamos del historial global
  if (!loadedUser) {
    const allUsers = JSON.parse(localStorage.getItem('all_users') || '[]');
    if (allUsers.length > 0) {
      // Tomamos el último usuario logueado (el más reciente)
      loadedUser = allUsers[allUsers.length - 1];
      if (loadedUser) {
        localStorage.setItem('currentUser', JSON.stringify(loadedUser));
      }
    }
  }

  // 3. Migración final: aseguramos subscription
  if (loadedUser) {
    if (!loadedUser.subscription) {
      loadedUser.subscription = 'regular';
      loadedUser.subscriptionEndDate = null;
    }
    setUser(loadedUser);
  }
}, []);

    // 2. MIGRACIÓN GLOBAL: Todos los usuarios en la base pasan a 'regular' si no tienen subscription
  useEffect(() => {
    // Ejecutamos solo una vez (no depende de nada)
    const migrateAllUsers = () => {
      const keys = ['all_users', 'users']; // Tus posibles claves
      let migrated = false;

      keys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            let users = JSON.parse(data);
            users = users.map((u: any) => {
              if (!u.subscription) {
                migrated = true;
                return {
                  ...u,
                  subscription: 'regular',
                  subscriptionEndDate: null
                };
              }
              return u;
            });
            localStorage.setItem(key, JSON.stringify(users));
          } catch (e) {
            console.error(`Error migrando ${key}`, e);
          }
        }
      });

      // Guardamos también en 'all_users' por si acaso (unificamos)
      if (migrated) {
        const finalUsers = JSON.parse(localStorage.getItem('all_users') || localStorage.getItem('users') || '[]');
        localStorage.setItem('all_users', JSON.stringify(finalUsers));
      }
    };

    migrateAllUsers();
  }, []); // [] = se ejecuta solo una vez al montar la app

  // 2. SINCRONIZACIÓN: Si el Admin cambia algo en 'all_users', la sesión se entera
  useEffect(() => {
    const syncData = () => {
      if (!user) return;
      // Buscamos en la base de datos global
      const dbUsers = JSON.parse(localStorage.getItem('all_users') || localStorage.getItem('users') || '[]');
      const myUpdatedData = dbUsers.find((u: any) => u.email === user.email);

      if (myUpdatedData && myUpdatedData.points !== user.points) {
        setUser(myUpdatedData);
        localStorage.setItem('currentUser', JSON.stringify(myUpdatedData));
      }
    };

    window.addEventListener('storage', syncData);
    window.addEventListener('focus', syncData); // Al volver a la pestaña, refresca
    return () => {
      window.removeEventListener('storage', syncData);
      window.removeEventListener('focus', syncData);
    };
  }, [user]);

  // 3. FUNCIÓN ÚNICA DE ACTUALIZACIÓN (Para canjes y edición)
  const updateUser = (updatedUserData: Partial<User>) => {
    if (!user) return;

    // A. Nuevo estado del usuario
        const newUser = {
      ...user,
      ...updatedUserData,
      // Aseguramos que subscriptionEndDate sea string o null
      subscriptionEndDate: updatedUserData.subscriptionEndDate ?? user.subscriptionEndDate
    };

    // B. Guardar sesión activa
    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    // C. ACTUALIZACIÓN CRÍTICA: Guardar en la lista global que lee el Admin y el Login
    const allUsers = JSON.parse(localStorage.getItem('all_users') || localStorage.getItem('users') || '[]');
    const updatedList = allUsers.map((u: any) => 
      u.email === newUser.email ? { ...u, ...newUser } : u
    );

    // Unificamos llaves: guardamos en ambas para que nadie se pierda
    localStorage.setItem('all_users', JSON.stringify(updatedList));
    localStorage.setItem('users', JSON.stringify(updatedList));
  };

const login = (userData: User) => {
  let finalUser = { ...userData };

  // FORZAMOS la búsqueda en all_users por email para recuperar el plan
  const allUsers = JSON.parse(localStorage.getItem('all_users') || '[]');
  const savedUser = allUsers.find((u: any) => u.email === finalUser.email);

  if (savedUser) {
    // Usamos los datos guardados (incluyendo subscription)
    finalUser = {
      ...finalUser,
      subscription: savedUser.subscription || 'regular',
      subscriptionEndDate: savedUser.subscriptionEndDate || null,
      points: savedUser.points || finalUser.points,
      // Puedes añadir más campos si quieres
    };
  } else {
    // Si no existe en all_users, ponemos regular
    finalUser.subscription = finalUser.subscription || 'regular';
    finalUser.subscriptionEndDate = finalUser.subscriptionEndDate || null;
  }

  // Guardamos todo
  setUser(finalUser);
  localStorage.setItem('currentUser', JSON.stringify(finalUser));

  // Actualizamos all_users por si acaso
  const existingIndex = allUsers.findIndex((u: any) => u.email === finalUser.email);
  if (existingIndex !== -1) {
    allUsers[existingIndex] = finalUser;
  } else {
    allUsers.push(finalUser);
  }
  localStorage.setItem('all_users', JSON.stringify(allUsers));
};

  const logout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('cart');
    clearcart();
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser debe usarse dentro de UserProvider');
  return context;
};