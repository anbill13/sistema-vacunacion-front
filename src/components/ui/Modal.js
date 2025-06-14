import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, children, size = 'md', className = '', ...props }) => {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'auto';
      };
    }
    // If modal is not open, ensure overflow is auto
    document.body.style.overflow = 'auto';
    return undefined;
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl'
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div 
        className={`
          modern-modal w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden
          animate-modalSlideIn ${className}
        `}
        {...props}
      >
        {children}
      </div>
    </div>
  );
};

const ModalHeader = ({ children, onClose, className = '', ...props }) => {
  return (
    <div className={`p-6 border-b border-opacity-20 flex justify-between items-center ${className}`} {...props}>
      <div className="modal-title font-bold text-xl">{children}</div>
      {onClose && (
        <button 
          onClick={onClose}
          className="modal-close-btn"
          aria-label="Cerrar"
        >
          <span>×</span>
        </button>
      )}
    </div>
  );
};

const ModalBody = ({ children, className = '', ...props }) => {
  return (
    <div className={`p-6 overflow-y-auto ${className}`} {...props}>
      {children}
    </div>
  );
};

const ModalFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`p-6 border-t border-opacity-20 flex justify-end gap-3 ${className}`} {...props}>
      {children}
    </div>
  );
};

export { Modal, ModalHeader, ModalBody, ModalFooter };