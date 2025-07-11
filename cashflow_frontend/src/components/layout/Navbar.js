import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import useAuth from '../../hooks/useAuth';

const Navbar = () => {
    const { logout } = useAuth();
    return (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Aplikasi Cashflow
                </Typography>
                <Button color="inherit" onClick={logout}>Logout</Button>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;