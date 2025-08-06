// src/pages/DashboardPage.js
import React, { useEffect, useState, useCallback } from 'react';
import { Grid, Typography, Box, CircularProgress, Alert, TextField } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { id } from 'date-fns/locale';

import SummaryCard from '../components/dashboard/SummaryCard';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SavingsIcon from '@mui/icons-material/Savings';
import BudgetProgress from '../components/dashboard/BudgetProgress';
import CategoryPieChart from '../components/dashboard/CategoryPieChart';
import ExpenseTrendChart from '../components/dashboard/ExpenseTrendChart';
import useAuth from '../hooks/useAuth';
import api from '../api';

const DashboardPage = () => {
    const { summaryData, fetchSummaryData, authLoading } = useAuth();
    const [pieData, setPieData] = useState([]);
    const [pieLoading, setPieLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());

    const refreshData = useCallback(async (date) => {
        setError('');
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        try {
            setPieLoading(true);
            await fetchSummaryData({ year, month });
            const res = await api.get('/dashboard/pie-chart', { params: { year, month } });
            setPieData(res.data);
        } catch (err) {
            console.error("Gagal memuat data dashboard", err);
            setError('Gagal memuat sebagian data dashboard.');
        } finally {
            setPieLoading(false);
        }
    }, [fetchSummaryData]);

    useEffect(() => {
        refreshData(selectedDate);
    }, [refreshData, selectedDate]);

    if (authLoading || pieLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const formatRupiah = (number) => `Rp ${parseFloat(number ?? 0).toLocaleString('id-ID')}`;

    return (
        <Box>
            {/* HEADER DENGAN DATE PICKER */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Typography
                    variant="h4"
                    gutterBottom
                    sx={{ fontWeight: 'bold', m: 0 }}
                >
                    Dashboard
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={id}>
                    <DatePicker
                        views={['year', 'month']}
                        label="Pilih Bulan & Tahun"
                        value={selectedDate}
                        onChange={(newDate) => setSelectedDate(newDate || new Date())}
                        renderInput={(params) => <TextField {...params} size="small" sx={{ minWidth: 200 }} />}
                    />
                </LocalizationProvider>
            </Box>

            {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

            {/* BARIS SUMMARY CARD */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <SummaryCard
                        title="Pemasukan Bulan Ini"
                        value={formatRupiah(summaryData?.total_income)}
                        icon={<AttachMoneyIcon fontSize="large" />}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <SummaryCard
                        title="Pengeluaran Bulan Ini"
                        value={formatRupiah(summaryData?.total_expense)}
                        icon={<MoneyOffIcon fontSize="large" />}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <SummaryCard
                        title="Total Saldo Utama"
                        value={formatRupiah(summaryData?.main_balance)}
                        icon={<AccountBalanceWalletIcon fontSize="large" />}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <SummaryCard
                        title="Total Saldo Tabungan"
                        value={formatRupiah(summaryData?.savings_balance)}
                        icon={<SavingsIcon fontSize="large" />}
                    />
                </Grid>
            </Grid>

            {/* --- PENYESUAIAN TATA LETAK UTAMA DIMULAI DI SINI --- */}
            <Grid container spacing={3}>
                {/* Kolom Kiri: Tren Pengeluaran dan Progres Anggaran */}
                <Grid item xs={12} lg={7}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <ExpenseTrendChart />
                        </Grid>
                        <Grid item xs={12}>
                            <BudgetProgress selectedDate={selectedDate} />
                        </Grid>
                    </Grid>
                </Grid>

                {/* Kolom Kanan: Pie Chart Kategori */}
                <Grid item xs={12} lg={5}>
                    <CategoryPieChart data={pieData} />
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardPage;