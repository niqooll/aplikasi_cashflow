// src/components/dashboard/BudgetProgress.js
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, LinearProgress, Paper, Grid, Alert, CircularProgress } from '@mui/material';
// --- PERBAIKAN IMPORT DIMULAI DI SINI ---
import { iconComponents } from '../../utils/iconMap'; 
// --- PERBAIKAN IMPORT SELESAI ---
import api from '../../api';

const BudgetProgress = ({ selectedDate }) => {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchBudgets = useCallback(async (date) => {
        try {
            setLoading(true);
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
        if (selectedDate) {
            fetchBudgets(selectedDate);
        }
    }, [fetchBudgets, selectedDate]);

    return (
        <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
                Progres Anggaran
            </Typography>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : budgets.length === 0 ? (
                 <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                    <Typography>Belum ada anggaran yang dibuat.</Typography>
                </Box>
            ) : (
                <Box sx={{ maxHeight: 350, overflowY: 'auto', pr: 1 }}>
                    {budgets.map((item) => {
                        // --- PERBAIKAN PENGGUNAAN IKON DIMULAI DI SINI ---
                        const IconComponent = iconComponents[item.icon_name] || iconComponents.Default; 
                        // --- PERBAIKAN PENGGUNAAN IKON SELESAI ---
                        const spent = parseFloat(item.spent);
                        const budget = parseFloat(item.budget);
                        const percentage = budget > 0 ? (spent / budget) * 100 : 0;
                        const isOverBudget = spent > budget;
                        const progressColor = isOverBudget ? 'error' : 'primary';

                        return (
                            <Box key={item.id} sx={{ mb: 2.5 }}>
                                <Grid container alignItems="center" justifyContent="space-between">
                                    <Grid item>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            {/* --- PERBAIKAN RENDERING IKON DI SINI --- */}
                                            <IconComponent sx={{ mr: 1.5, color: 'text.secondary' }} />
                                            <Typography variant="body1">{item.name}</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="body2" sx={{ color: isOverBudget ? 'error.main' : 'text.secondary' }}>
                                            {`Rp ${spent.toLocaleString('id-ID')} / ${budget.toLocaleString('id-ID')}`}
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min(percentage, 100)}
                                    color={progressColor}
                                    sx={{ height: 6, borderRadius: 5, mt: 0.5 }}
                                />
                            </Box>
                        );
                    })}
                </Box>
            )}
        </Paper>
    );
};

export default BudgetProgress;