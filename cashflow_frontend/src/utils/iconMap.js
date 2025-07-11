import React from 'react';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import CommuteIcon from '@mui/icons-material/Commute';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import SchoolIcon from '@mui/icons-material/School';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PetsIcon from '@mui/icons-material/Pets';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import HomeIcon from '@mui/icons-material/Home';

// Peta dari string ke Komponen Ikon
export const iconComponents = {
  FastfoodIcon: <FastfoodIcon />,
  CommuteIcon: <CommuteIcon />,
  ReceiptLongIcon: <ReceiptLongIcon />,
  TheaterComedyIcon: <TheaterComedyIcon />,
  ShoppingCartIcon: <ShoppingCartIcon />,
  HealthAndSafetyIcon: <HealthAndSafetyIcon />,
  SchoolIcon: <SchoolIcon />,
  FitnessCenterIcon: <FitnessCenterIcon />,
  PetsIcon: <PetsIcon />,
  CardGiftcardIcon: <CardGiftcardIcon />,
  HomeIcon: <HomeIcon />,
  MoreHorizIcon: <MoreHorizIcon />,
};

// Daftar nama ikon untuk ditampilkan di pilihan
export const availableIcons = Object.keys(iconComponents);