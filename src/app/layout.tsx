'use client';

import React, { useState } from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import Header from '../components/dashboard/Header';
import Sidebar from '../components/dashboard/Sidebar';
import Footer from '../components/dashboard/Footer';
import './globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <html lang="en">
      <body>
        <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
          <CssBaseline />
          <Header onToggleSidebar={toggleSidebar} />
          <Box sx={{ display: 'flex', flexGrow: 1 }}>
            <Sidebar isCollapsed={isSidebarCollapsed} />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                padding: 3,
                marginTop: 8,
                width: isSidebarCollapsed ? 'calc(100% - 60px)' : 'calc(100% - 240px)',
                transition: 'width 0.3s',
              }}
            >
              {children}
            </Box>
          </Box>
          <Footer />
        </Box>
      </body>
    </html>
  );
}
