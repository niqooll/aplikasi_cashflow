import React from 'react';
import { Card, CardContent, Typography, Box, Avatar, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';

// Kita bisa membuat style untuk Avatar dengan warna yang lebih lembut
const StyledAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.1), // Warna lebih transparan
  color: theme.palette.primary.main,
  width: 56,
  height: 56,
}));

const SummaryCard = ({ title, value, subtitle, icon }) => {
  return (
    // Menggunakan properti 'sx' untuk gradien dan hover effect
    <Card 
      sx={{ 
        height: '100%',
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.1)',
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <StyledAvatar>
            {icon}
          </StyledAvatar>
          <Box sx={{ ml: 2, flexGrow: 1 }}>
            <Typography color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
              {title}
            </Typography>
            <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;