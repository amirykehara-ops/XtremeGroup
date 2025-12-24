import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'small-primary' | 'small-ghost';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className = '', ...props }) => {
  const baseStyle = "font-bold rounded-2xl relative overflow-hidden flex items-center justify-center transition-all duration-300 font-sans z-10";
  
  let variantStyle = "";

  switch (variant) {
    case 'primary':
      variantStyle = "px-6 py-3 bg-accent text-white shadow-lg shadow-accent/30 hover:shadow-accent/50 hover:-translate-y-1";
      break;
    case 'ghost':
      variantStyle = "px-6 py-3 bg-transparent border-2 border-accent text-accent hover:text-white hover:bg-accent hover:border-transparent hover:shadow-lg shadow-accent/20 hover:-translate-y-1";
      break;
    case 'small-primary':
      variantStyle = "px-4 py-2 text-sm bg-accent text-white shadow-md shadow-accent/20 hover:shadow-accent/40 hover:-translate-y-0.5";
      break;
    case 'small-ghost':
      variantStyle = "px-4 py-2 text-sm bg-transparent border border-accent text-accent hover:text-white hover:bg-accent hover:border-transparent hover:-translate-y-0.5";
      break;
  }

return (
  <button
    className={`${baseStyle} ${variantStyle} ${className}`}
    {...props}
  >
    <motion.span
      whileTap={{ scale: 0.95 }}
      className="relative z-10 flex items-center justify-center w-full h-full"
    >
      {children}
    </motion.span>

    {/* Gradient overlay for primary buttons */}
    {(variant === 'primary' || variant === 'small-primary') && (
      <div className="absolute inset-0 bg-gradient-to-r from-accent-dark to-accent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    )}
  </button>
);

};

export default Button;