import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, LinearProgress, Paper, Stack, Alert, Tooltip, Grid, Avatar } from '@mui/material';
import { alpha } from '@mui/material/styles';
import api from '../../api';
import useAuth from '../../hooks/useAuth';
import { iconComponents } from '../../utils/iconMap';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const BudgetProgress = ({ selectedDate }) => {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { fetchSummaryData } = useAuth();

    const fetchBudgets = useCallback(async (date) => {
        try {
            setLoading(true);
            // --- KIRIM PARAMETER TANGGAL KE API ---
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const res = await api.get('/dashboard/budgets', { params: { year, month } });
            setBudgets(res.data);
        } catch (error) {
            console.error("Gagal memuat data budget", error);
            setError('Gagal memuat data anggaran.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // --- GUNAKAN `selectedDate` DARI PROPS ---
        if (selectedDate) {
            fetchBudgets(selectedDate);
        }
    }, [fetchBudgets, selectedDate]);
    const getProgressColor = (value) => {
        if (value >= 100) return 'error';
        if (value > 80) return 'warning';
        return 'primary';
    };

    if (loading) return <Paper sx={{ p: 3, textAlign: 'center' }}><Typography>Memuat data anggaran...</Typography></Paper>;

    return (
        <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Lacak Anggaran Bulan Ini</Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <Stack spacing={3} sx={{ mt: 2 }}>
                {budgets.length > 0 ? budgets.map(item => {
                    const spent = parseFloat(item.spent);
                    const budget = parseFloat(item.budget);
                    const percentage = budget > 0 ? (spent / budget) * 100 : 0;
                    const remaining = budget - spent;
                    const isOverBudget = remaining < 0;
                    const color = getProgressColor(percentage);

                    return (
                        <Box key={item.id}>
                            <Grid container alignItems="center" spacing={2}>
                                <Grid item>
                                    <Avatar sx={(theme) => ({
                                        bgcolor: alpha(theme.palette[color].main, 0.1),
                                        color: theme.palette[color].main,
                                    })}>
                                        {/* 3. Baris ini sekarang akan berfungsi karena iconComponents sudah di-import */}
                                        {iconComponents[item.icon_name] || <MoreHorizIcon />}
                                    </Avatar>
                                </Grid>
                                <Grid item xs>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Rp {spent.toLocaleString('id-ID')} / {budget.toLocaleString('id-ID')}
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <Typography sx={{ fontWeight: 500, color: isOverBudget ? 'error.main' : 'text.primary' }}>
                                        {isOverBudget ? `Lebih Rp ${Math.abs(remaining).toLocaleString('id-ID')}` : `Sisa Rp ${remaining.toLocaleString('id-ID')}`}
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Tooltip title={`${Math.round(percentage)}% Terpakai`}>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={percentage > 100 ? 100 : percentage}
                                    color={color}
                                    sx={{ height: 8, borderRadius: 5, mt: 1 }}
                                />
                            </Tooltip>
                        </Box>
                    );
                }) : (
                    <Box sx={{textAlign: 'center', p: 4, border: '2px dashed #e0e0e0', borderRadius: 2}}>
                        <Typography color="text.secondary">Belum ada anggaran yang diatur.</Typography>
                        <Typography variant="caption">Silakan atur di halaman Pengaturan.</Typography>
                    </Box>
                )}
            </Stack>
        </Paper>
    );
};

export default BudgetProgress;