import React from 'react';

const Card = ({ children, className = '', isPressable = false, onPress, ...props }) => {
  // Cambiamos el fondo para que use variables CSS en lugar de un color fijo
  const baseClasses = 'bg-opacity-25 backdrop-blur-md border border-opacity-20 rounded-xl shadow-lg';
  const pressableClasses = isPressable ? 'cursor-pointer hover:scale-105 transition-transform duration-200' : '';
  
  const classes = `${baseClasses} ${pressableClasses} ${className}`.trim();

  const handleClick = () => {
    if (isPressable && onPress) {
      onPress();
    }
  };

  return (
    <div className={classes} onClick={handleClick} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`p-4 border-b border-opacity-20 ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardBody = ({ children, className = '', ...props }) => {
  return (
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardBody };