import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  className = '', 
  color = 'primary', 
  size = 'md', 
  variant = 'solid',
  isIconOnly = false,
  disabled = false,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer border-0';
  
  const sizeClasses = {
    sm: isIconOnly ? 'w-8 h-8 text-sm' : 'px-3 py-1.5 text-sm',
    md: isIconOnly ? 'w-10 h-10 text-base' : 'px-4 py-2 text-base',
    lg: isIconOnly ? 'w-12 h-12 text-lg' : 'px-6 py-3 text-lg'
  };

  const colorClasses = {
    primary: variant === 'shadow' 
      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105' 
      : 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: variant === 'shadow'
      ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg hover:shadow-xl hover:scale-105'
      : 'bg-gray-600 text-white hover:bg-gray-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed';

  const classes = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${colorClasses[color]}
    ${disabled ? disabledClasses : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      className={classes}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;