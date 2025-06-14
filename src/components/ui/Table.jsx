import React from 'react';

const Table = ({ children, className = '', ...props }) => {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-sm text-left ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

const TableHeader = ({ children, className = '', ...props }) => {
  return (
    <thead className={`text-xs uppercase bg-white bg-opacity-20 ${className}`} {...props}>
      <tr>
        {children}
      </tr>
    </thead>
  );
};

const TableColumn = ({ children, className = '', ...props }) => {
  return (
    <th className={`px-6 py-3 text-white font-medium ${className}`} {...props}>
      {children}
    </th>
  );
};

const TableBody = ({ children, className = '', ...props }) => {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
};

const TableRow = ({ children, className = '', ...props }) => {
  return (
    <tr className={`border-b border-white border-opacity-10 hover:bg-white hover:bg-opacity-10 ${className}`} {...props}>
      {children}
    </tr>
  );
};

const TableCell = ({ children, className = '', ...props }) => {
  return (
    <td className={`px-6 py-4 text-white ${className}`} {...props}>
      {children}
    </td>
  );
};

export { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell };