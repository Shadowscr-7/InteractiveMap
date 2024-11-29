"use client";

import React, { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Toolbar,
  Tooltip,
} from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddBoxIcon from "@mui/icons-material/AddBox";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";

const drawerWidth = 240;

interface SidebarProps {
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    {
      title: "STP1710",
      icon: <SettingsApplicationsIcon />, // Icono de gestión
      options: [
        { label: "Nuevo Pedido", icon: <AddBoxIcon /> },
        { label: "Clientes", icon: <PeopleIcon /> },
        { label: "Pedidos", icon: <AssignmentIcon /> },
      ],
    },
  ];

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isCollapsed ? 80 : drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isCollapsed ? 80 : drawerWidth,
          transition: "width 0.3s",
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: "auto" }}>
        <List>
          {menuItems.map((menu) => (
            <Box key={menu.title}>
              <Tooltip
                title={isCollapsed ? menu.title : ""}
                placement="right"
                arrow
              >
                <ListItemButton onClick={handleMenuToggle}>
                  <ListItemIcon>{menu.icon}</ListItemIcon>
                  {!isCollapsed && (
                    <ListItemText primary={menu.title} sx={{ ml: 2 }} />
                  )}
                  {!isCollapsed &&
                    (menuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
                </ListItemButton>
              </Tooltip>
              <Collapse in={menuOpen} timeout="auto" unmountOnExit>
                {menu.options.map((option) => (
                  <Tooltip
                    key={option.label}
                    title={isCollapsed ? option.label : ""}
                    placement="right"
                    arrow
                  >
                    <ListItem disablePadding>
                      <ListItemButton>
                        <ListItemIcon>{option.icon}</ListItemIcon>
                        {!isCollapsed && (
                          <ListItemText primary={option.label} />
                        )}
                      </ListItemButton>
                    </ListItem>
                  </Tooltip>
                ))}
              </Collapse>
            </Box>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
