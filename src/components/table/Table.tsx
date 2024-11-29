"use client";

import React from "react";
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

interface TableProps {
  headers: string[]; // Array de strings para los encabezados
  data: Array<Record<string, any>>; // Array de objetos con datos
  title?: string; // Título opcional para la tabla
  actions?: boolean; // Indica si se deben mostrar acciones
  onEdit?: (row: Record<string, any>) => void; // Callback para editar
  onDelete?: (row: Record<string, any>) => void; // Callback para eliminar
  onView?: (row: Record<string, any>) => void; // Callback para visualizar
}

const Table: React.FC<TableProps> = ({
  headers,
  data,
  title,
  actions = false,
  onEdit,
  onDelete,
  onView,
}) => {
  return (
    <Box sx={{ marginTop: 2 }}>
      {title && (
        <Typography
          variant="h5"
          component="div"
          sx={{
            marginBottom: 2,
            fontWeight: "bold",
            color: "#3f51b5",
          }}
        >
          {title}
        </Typography>
      )}
      <TableContainer>
        <MuiTable>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              {actions && (
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    color: "#3f51b5",
                    textTransform: "uppercase",
                    padding: "10px",
                    borderBottom: "2px solid #e0e0e0",
                    textAlign: "center",
                  }}
                >
                  Acciones
                </TableCell>
              )}
              {headers.map((header, index) => (
                <TableCell
                  key={index}
                  sx={{
                    fontWeight: "bold",
                    color: "#3f51b5",
                    textTransform: "uppercase",
                    padding: "10px",
                    borderBottom: "2px solid #e0e0e0",
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                sx={{
                  "&:nth-of-type(odd)": {
                    backgroundColor: "#fafafa",
                  },
                  "&:hover": {
                    backgroundColor: "#f1f1f1",
                    cursor: "pointer",
                  },
                  transition: "background-color 0.2s ease",
                }}
              >
                {actions && (
                  <TableCell
                    sx={{
                      padding: "10px",
                      borderBottom: "1px solid #e0e0e0",
                      textAlign: "center",
                      whiteSpace: "nowrap",
                      display: "flex",
                      gap: 1,
                      justifyContent: "center",
                    }}
                  >
                    <IconButton
                      aria-label="view"
                      color="primary"
                      onClick={() => onView && onView(row)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      aria-label="edit"
                      color="secondary"
                      onClick={() => onEdit && onEdit(row)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      aria-label="delete"
                      color="error"
                      onClick={() => onDelete && onDelete(row)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                )}
                {headers.map((header, colIndex) => (
                  <TableCell
                    key={colIndex}
                    sx={{
                      padding: "10px",
                      borderBottom: "1px solid #e0e0e0",
                      fontSize: "14px",
                    }}
                  >
                    {row[header]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </MuiTable>
      </TableContainer>
    </Box>
  );
};

export default Table;
