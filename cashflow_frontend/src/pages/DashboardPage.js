import React, { useEffect, useState, useCallback } from 'react';
import { Grid, Typography, Box, CircularProgress } from '@mui/material';
import SummaryCard from '../components/dashboard/SummaryCard';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SavingsIcon from '@mui/icons-material/Savings';
import BudgetProgress from '../components/dashboard/BudgetProgress';
import CategoryPieChart from '../components/dashboard/CategoryPieChart'; // 1. Import kembali Pie Chart
import useAuth from '../hooks/useAuth';
import api from '../api'; // 2. Import api untuk fetch data pie chart

const DashboardPage = () => {
  const { summaryData, fetchSummaryData, authLoading } = useAuth();
  
  // 3. Tambahkan state lokal untuk data Pie Chart
  const [pieData, setPieData] = useState([]);
  const [pieLoading, setPieLoading] = useState(true);

  const refreshData = useCallback(async () => {
    // Jalankan kedua fetch secara paralel
    await Promise.all([
        fetchSummaryData(),
        (async () => {
            try {
                setPieLoading(true);
                const res = await api.get('/dashboard/pie-chart');
                setPieData(res.data);
            } catch (error) {
                console.error("Gagal memuat data pie chart", error);
            } finally {
                setPieLoading(false);
            }
        })()
    ]);
  }, [fetchSummaryData]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Tampilkan loading jika salah satu data belum siap
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
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      
      {/* Baris untuk 4 kartu ringkasan */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Pemasukan Bulan Ini"
            value={formatRupiah(summaryData.total_income)}
            icon={<AttachMoneyIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Pengeluaran Bulan Ini"
            value={formatRupiah(summaryData.total_expense)}
            icon={<MoneyOffIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <SummaryCard
                title="Total Saldo Utama"
                value={formatRupiah(summaryData.main_balance)}
                icon={<AccountBalanceWalletIcon />}
            />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <SummaryCard
                title="Total Saldo Tabungan"
                value={formatRupiah(summaryData.savings_balance)}
                icon={<SavingsIcon />}
            />
        </Grid>
      </Grid>
      
      {/* Baris baru untuk Budget Progress dan Pie Chart */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
            <BudgetProgress />
        </Grid>
        <Grid item xs={12} md={5}>
            <CategoryPieChart data={pieData} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;