import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { X } from 'lucide-react';

interface AuthModalProps {
  type: 'login' | 'register';
  onClose: () => void;
  onAuthSuccess?: (user: { email: string; points: number }) => void;
  login?: (user: { email: string; points: number }) => void;  // ← AÑADIR ESTO
}

const AuthModal: React.FC<AuthModalProps> = ({ type, onClose, onAuthSuccess, login }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
  // Validación común
  if (!email || !password) {
    setError('Completa email y contraseña');
    return;
  }

  // Validación extra para registro
  if (type === 'register') {
    if (!name || name.trim() === '') {
      setError('Ingresa tu nombre completo');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find((u: any) => u.email === email)) {
      setError('Este email ya está registrado');
      return;
    }

    const newUser = {
      email,
      password,
      points: 600,
      name: name.trim()
    // Limpia espacios
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Login automático después de registro
    login(newUser);
    onAuthSuccess?.(newUser);  // Usa opcional por si no se pasa
    onClose();
    return;
  }

  // LOGIN
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find((u: any) => u.email === email && u.password === password);

  if (!user) {
    setError('Email o contraseña incorrectos');
    return;
  }

  login(user);
  onAuthSuccess?.(user);
  onClose();
};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring' }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-dark">{type === 'login' ? 'Iniciar Sesión' : 'Registrarse'}</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {type === 'register' && (
        <input
            type="text"
            placeholder="Nombre Completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-2xl mb-4 focus:border-accent focus:outline-none transition-colors"
        />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded-2xl mb-4"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border rounded-2xl mb-6"
        />
        <Button variant="primary" className="w-full" onClick={handleSubmit}>
          {type === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default AuthModal;