import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id?: string;
  email: string;
  points: number;
  name?: string;
  phone?: string;
  address?: string;
  referralCode?: string;
  level?: 'Bronze' | 'Silver' | 'Gold';
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

  // 1. CARGA INICIAL: Usaremos siempre 'currentUser' para la sesión activa
  useEffect(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

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
    const newUser = { ...user, ...updatedUserData };
    
    // Si cambiaron los puntos, recalculamos el nivel por si acaso
    if (updatedUserData.points !== undefined) {
      const p = updatedUserData.points;
      newUser.level = p >= 1000 ? 'Gold' : p >= 500 ? 'Silver' : 'Bronze';
    }

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
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    // Al loguear, también nos aseguramos que esté en la lista global
    updateUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('cart');
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