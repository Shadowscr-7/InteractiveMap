'use client';

import React from 'react';
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';

interface TableProps {
  headers: string[]; // Array de strings para los encabezados
  data: Array<Record<string, any>>; // Array de objetos con datos
  title?: string; // Título opcional para la tabla
}

const Table: React.FC<TableProps> = ({ headers, data, title }) => {
  return (
    <TableContainer component={Paper} sx={{ marginTop: 2, padding: 2 }}>
      {title && (
        <Typography variant="h6" component="div" sx={{ marginBottom: 2 }}>
          {title}
        </Typography>
      )}
      <MuiTable>
        <TableHead>
          <TableRow>
            {headers.map((header, index) => (
              <TableCell key={index} sx={{ fontWeight: 'bold' }}>
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {headers.map((header, colIndex) => (
                <TableCell key={colIndex}>{row[header]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </MuiTable>
    </TableContainer>
  );
};

export default Table;
