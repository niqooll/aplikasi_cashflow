import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4A90E2', // Warna biru yang lebih modern
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f4f6f8', // Warna latar belakang yang sedikit abu-abu
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8, // Sedikit membulatkan sudut
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)', // Bayangan yang lebih lembut
        }
      }
    }
  }
});

export default theme;