import React from 'react';
<<<<<<< HEAD
import {
  Table as NextUITable,
  TableHeader as NextUITableHeader,
  TableColumn as NextUITableColumn,
  TableBody as NextUITableBody,
  TableRow as NextUITableRow,
  TableCell as NextUITableCell
} from "@nextui-org/react";

const Table = ({ 
  children, 
  className = '', 
  isStriped = false,
  isCompact = false,
  removeWrapper = false,
  color = 'default',
  ...props 
}) => {
  return (
    <NextUITable 
      className={className}
      isStriped={isStriped}
      isCompact={isCompact}
      removeWrapper={removeWrapper}
      color={color}
      {...props}
    >
      {children}
    </NextUITable>
=======

const Table = ({ children, className = '', ...props }) => {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-sm text-left ${className}`} {...props}>
        {children}
      </table>
    </div>
>>>>>>> develop
  );
};

const TableHeader = ({ children, className = '', ...props }) => {
  return (
<<<<<<< HEAD
    <NextUITableHeader className={className} {...props}>
      {children}
    </NextUITableHeader>
=======
    <thead className={`text-xs uppercase bg-white bg-opacity-20 ${className}`} {...props}>
      <tr>
        {children}
      </tr>
    </thead>
>>>>>>> develop
  );
};

const TableColumn = ({ children, className = '', ...props }) => {
  return (
<<<<<<< HEAD
    <NextUITableColumn className={className} {...props}>
      {children}
    </NextUITableColumn>
=======
    <th className={`px-6 py-3 text-white font-medium ${className}`} {...props}>
      {children}
    </th>
>>>>>>> develop
  );
};

const TableBody = ({ children, className = '', ...props }) => {
  return (
<<<<<<< HEAD
    <NextUITableBody className={className} {...props}>
      {children}
    </NextUITableBody>
=======
    <tbody className={className} {...props}>
      {children}
    </tbody>
>>>>>>> develop
  );
};

const TableRow = ({ children, className = '', ...props }) => {
  return (
<<<<<<< HEAD
    <NextUITableRow className={className} {...props}>
      {children}
    </NextUITableRow>
=======
    <tr className={`border-b border-white border-opacity-10 hover:bg-white hover:bg-opacity-10 ${className}`} {...props}>
      {children}
    </tr>
>>>>>>> develop
  );
};

const TableCell = ({ children, className = '', ...props }) => {
  return (
<<<<<<< HEAD
    <NextUITableCell className={className} {...props}>
      {children}
    </NextUITableCell>
=======
    <td className={`px-6 py-4 text-white ${className}`} {...props}>
      {children}
    </td>
>>>>>>> develop
  );
};

export { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell };