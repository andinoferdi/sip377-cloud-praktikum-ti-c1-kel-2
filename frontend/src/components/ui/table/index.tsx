import React, { ReactNode } from "react";

type TableProps = {
  children: ReactNode; // Table content (thead, tbody, etc.)
  className?: string;};

type TableHeaderProps = {
  children: ReactNode; // Header row(s)
  className?: string;};

type TableBodyProps = {
  children: ReactNode; // Body row(s)
  className?: string;};

type TableRowProps = {
  children: ReactNode; // Cells (th or td)
  className?: string;};

type TableCellProps = {
  children: ReactNode; // Cell content
  isHeader?: boolean; // If true, renders as <th>, otherwise <td>
  className?: string;};

const Table: React.FC<TableProps> = ({ children, className }) => {
  return <table className={`min-w-full  ${className}`}>{children}</table>;
};

const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => {
  return <thead className={className}>{children}</thead>;
};

const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
  return <tbody className={className}>{children}</tbody>;
};

const TableRow: React.FC<TableRowProps> = ({ children, className }) => {
  return <tr className={className}>{children}</tr>;
};

const TableCell: React.FC<TableCellProps> = ({
  children,
  isHeader = false,
  className,
}) => {
  const CellTag = isHeader ? "th" : "td";
  return <CellTag className={` ${className}`}>{children}</CellTag>;
};

export { Table, TableHeader, TableBody, TableRow, TableCell };
