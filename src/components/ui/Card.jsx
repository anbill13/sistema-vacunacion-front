import React from 'react';
<<<<<<< HEAD
import {
  Card as NextUICard,
  CardHeader as NextUICardHeader,
  CardBody as NextUICardBody,
  CardFooter as NextUICardFooter
} from "@nextui-org/react";

// Componentes de compatibilidad para mantener el código existente funcionando
const Card = ({ children, className = '', isPressable = false, onPress, ...props }) => {
  return (
    <NextUICard 
      className={className}
      isPressable={isPressable}
      onPress={onPress}
      {...props}
    >
      {children}
    </NextUICard>
=======

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
>>>>>>> develop
  );
};

const CardHeader = ({ children, className = '', ...props }) => {
  return (
<<<<<<< HEAD
    <NextUICardHeader className={className} {...props}>
      {children}
    </NextUICardHeader>
=======
    <div className={`p-4 border-b border-opacity-20 ${className}`} {...props}>
      {children}
    </div>
>>>>>>> develop
  );
};

const CardBody = ({ children, className = '', ...props }) => {
  return (
<<<<<<< HEAD
    <NextUICardBody className={className} {...props}>
      {children}
    </NextUICardBody>
  );
};

const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <NextUICardFooter className={className} {...props}>
      {children}
    </NextUICardFooter>
  );
};

export { Card, CardHeader, CardBody, CardFooter };
=======
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardBody };
>>>>>>> develop
