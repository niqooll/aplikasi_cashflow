import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material'; // Tambahkan IconButton
import MenuIcon from '@mui/icons-material/Menu'; // Import ikon hamburger
import useAuth from '../../hooks/useAuth';

// Navbar sekarang menerima props
const Navbar = ({ handleDrawerToggle }) => {
    const { logout } = useAuth();
    return (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
                {/* Tombol Hamburger hanya muncul di layar kecil (xs & sm) */}
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{ mr: 2, display: { md: 'none' } }} // Hanya tampil di bawah breakpoint 'md'
                >
                    <MenuIcon />
                </IconButton>

                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Aplikasi Cashflow
                </Typography>
                <Button color="inherit" onClick={logout}>Logout</Button>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;