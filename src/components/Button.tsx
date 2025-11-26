import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "py-3 px-6 rounded-xl font-bold transition-all transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-md";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-indigo-600 dark:hover:bg-indigo-500",
    secondary: "bg-secondary text-white hover:bg-emerald-600",
    danger: "bg-danger text-white hover:bg-red-600",
    outline: "border-2 border-primary text-primary bg-transparent hover:bg-indigo-50 dark:hover:bg-gray-800 dark:text-indigo-400 dark:border-indigo-400"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};