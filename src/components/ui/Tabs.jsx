import React from 'react';

const Tabs = ({ children, selectedKey, onSelectionChange, className = '', ...props }) => {
  return (
    <div className={`w-full ${className}`} {...props}>
      <div className="flex space-x-1 bg-white bg-opacity-20 backdrop-blur-md rounded-lg p-1">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              isSelected: child.key === selectedKey,
              onSelect: () => onSelectionChange(child.key)
            });
          }
          return child;
        })}
      </div>
    </div>
  );
};

const Tab = ({ title, isSelected, onSelect, ...props }) => {
  const baseClasses = 'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 text-center cursor-pointer';
  const selectedClasses = 'bg-white text-gray-900 shadow-sm';
  const unselectedClasses = 'text-white hover:bg-white hover:bg-opacity-20';
  
  const classes = `${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`;

  return (
    <button className={classes} onClick={onSelect} {...props}>
      {title}
    </button>
  );
};

export { Tabs, Tab };