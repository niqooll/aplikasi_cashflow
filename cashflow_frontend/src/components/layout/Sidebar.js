import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box } from '@mui/material';
import { NavLink } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SettingsIcon from '@mui/icons-material/Settings';

// Definisikan item menu sebagai array of objects
const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Transaksi', icon: <ReceiptIcon />, path: '/transactions' },
    { text: 'Pengaturan', icon: <SettingsIcon />, path: '/settings' },
];

// 1. Terima 'drawerWidth' sebagai props, dan hapus definisi const di sini
const Sidebar = ({ mobileOpen, handleDrawerToggle, drawerWidth }) => {
  
  const drawerContent = (
    <div>
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={NavLink} 
                to={item.path}
                onClick={mobileOpen ? handleDrawerToggle : null}
                sx={{
                    '&.active': {
                        backgroundColor: 'action.selected',
                        '& .MuiTypography-root, & .MuiSvgIcon-root': {
                            color: 'primary.main',
                            fontWeight: 'fontWeightBold',
                        }
                    }
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </div>
  );

  return (
    <Box
      component="nav"
      // 2. Gunakan 'drawerWidth' dari props di sini
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      aria-label="main navigation"
    >
      {/* SIDEBAR UNTUK MOBILE (Bisa Buka-Tutup) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          // 3. Gunakan 'drawerWidth' dari props di sini juga
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>
      
      {/* SIDEBAR UNTUK DESKTOP (Permanen) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          // 4. Dan di sini juga
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;