import React, { useEffect, useState, useCallback } from 'react';
import { Grid, Typography, Box, CircularProgress, Alert } from '@mui/material';
import SummaryCard from '../components/dashboard/SummaryCard';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SavingsIcon from '@mui/icons-material/Savings';
import BudgetProgress from '../components/dashboard/BudgetProgress';
import CategoryPieChart from '../components/dashboard/CategoryPieChart';
import useAuth from '../hooks/useAuth';
import api from '../api';

const DashboardPage = () => {
  const { summaryData, fetchSummaryData, authLoading } = useAuth();
  const [pieData, setPieData] = useState([]);
  const [pieLoading, setPieLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshData = useCallback(async () => {
    setError('');
    try {
      setPieLoading(true);
      await fetchSummaryData(); 
      const res = await api.get('/dashboard/pie-chart');
      setPieData(res.data);
    } catch (err) {
        console.error("Gagal memuat data dashboard", err);
        setError('Gagal memuat sebagian data dashboard.');
    } finally {
        setPieLoading(false);
    }
  }, [fetchSummaryData]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  if (authLoading || !summaryData || pieLoading) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
        </Box>
    );
  }
  
  const formatRupiah = (number) => `Rp ${parseFloat(number ?? 0).toLocaleString('id-ID')}`;

  return (
    <Box>
      <Typography 
        variant="h4" 
        gutterBottom
        sx={{ 
          fontWeight: 'bold',
          mb: { xs: 3, sm: 4 }, // Jarak bawah yang konsisten
          fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } // Ukuran font responsif
        }}
      >
        Dashboard
      </Typography>

      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
      
      {/* ====================================================== */}
      {/* BAGIAN KARTU RINGKASAN (RESPONSIVE) */}
      {/* ====================================================== */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Di layar HP (xs), setiap kartu akan memakan 12 kolom (lebar penuh) */}
        {/* Di layar tablet (sm), setiap kartu akan memakan 6 kolom (setengah lebar) */}
        {/* Di layar desktop (md), setiap kartu akan memakan 3 kolom (seperempat lebar) */}
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Pemasukan Bulan Ini"
            value={formatRupiah(summaryData.total_income)}
            icon={<AttachMoneyIcon fontSize="large"/>}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Pengeluaran Bulan Ini"
            value={formatRupiah(summaryData.total_expense)}
            icon={<MoneyOffIcon fontSize="large"/>}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <SummaryCard
                title="Total Saldo Utama"
                value={formatRupiah(summaryData.main_balance)}
                icon={<AccountBalanceWalletIcon fontSize="large"/>}
            />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <SummaryCard
                title="Total Saldo Tabungan"
                value={formatRupiah(summaryData.savings_balance)}
                icon={<SavingsIcon fontSize="large"/>}
            />
        </Grid>
      </Grid>
      
      {/* ====================================================== */}
      {/* BAGIAN BAWAH (BUDGET & PIE CHART) RESPONSIVE */}
      {/* ====================================================== */}
      <Grid container spacing={3}>
        {/* Di layar kecil (di bawah lg), kedua komponen ini akan menumpuk vertikal */}
        {/* Di layar besar (lg ke atas), mereka akan bersebelahan */}
        <Grid item xs={12} lg={7}>
            <BudgetProgress />
        </Grid>
        <Grid item xs={12} lg={5}>
            <CategoryPieChart data={pieData} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;