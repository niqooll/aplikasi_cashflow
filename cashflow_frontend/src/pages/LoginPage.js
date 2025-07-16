import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom'; // Ganti nama Link agar tidak konflik
import useAuth from '../hooks/useAuth';
import { 
    TextField, Button, Container, Typography, Box, Alert, 
    Paper, Avatar, CssBaseline, Link // Tambahkan komponen baru
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'; // Tambahkan ikon gembok

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      // Menampilkan pesan error yang lebih spesifik jika ada dari backend
      const errorMsg = err.response?.data?.msg || 'Gagal login. Periksa kembali email dan password Anda.';
      setError(errorMsg);
      console.error(err);
    }
  };

  return (
    // Container utama yang mengisi seluruh layar dan menengahkan konten
    <Container component="main" maxWidth={false} sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
    }}>
        <CssBaseline />
        {/* Paper berfungsi sebagai kartu untuk form login */}
        <Paper 
            elevation={6} 
            sx={{
                padding: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                maxWidth: '400px', // Batas lebar form
                width: '100%',
            }}
        >
            <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
                Sign In
            </Typography>

            {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
            
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                <TextField 
                    margin="normal" required fullWidth id="email"
                    label="Alamat Email" name="email" autoComplete="email"
                    autoFocus value={email} onChange={(e) => setEmail(e.target.value)}
                />
                <TextField 
                    margin="normal" required fullWidth name="password"
                    label="Password" type="password" id="password"
                    autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
                />
                <Button 
                    type="submit" fullWidth variant="contained" 
                    sx={{ mt: 3, mb: 2 }}
                >
                    Sign In
                </Button>
                <Box sx={{ textAlign: 'center' }}>
                    <Link component={RouterLink} to="/register" variant="body2">
                        {"Belum punya akun? Daftar di sini"}
                    </Link>
                </Box>
            </Box>
        </Paper>
    </Container>
  );
};

export default LoginPage;