import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Pagination, Stack, TextField } from '@mui/material'; // Tambah TextField
import AddIcon from '@mui/icons-material/Add';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'; // Tambah import
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'; // Tambah import
import { id } from 'date-fns/locale'; // Tambah import
import api from '../api';
import TransactionList from '../components/transactions/TransactionList';
import TransactionForm from '../components/transactions/TransactionForm';
import useAuth from '../hooks/useAuth';

const TransactionsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { fetchSummaryData } = useAuth();

    const [selectedDate, setSelectedDate] = useState(new Date());

    const fetchTransactions = useCallback(async (currentPage = 1, date) => {
        try {
            setLoading(true);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;

            const res = await api.get(`/transactions`, {
                params: {
                    page: currentPage,
                    limit: 10,
                    year,
                    month
                }
            });

            setTransactions(res.data.transactions);
            setTotalPages(res.data.totalPages);
            setPage(res.data.currentPage);
        } catch (err) {
            setError('Gagal memuat transaksi.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (err) {
            console.error("Gagal memuat kategori", err);
        }
    }, []);

    useEffect(() => {
        fetchTransactions(page, selectedDate);
    }, [page, selectedDate, fetchTransactions]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);
    
    const handleFormClose = () => {
        setIsFormOpen(false);
        fetchTransactions(page, selectedDate);
        fetchSummaryData();
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    return (
        <Box>
            <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between', 
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 2,
                mb: 3 
            }}>
                <Typography variant="h4" sx={{ mb: { xs: 1, sm: 0 } }}>Daftar Transaksi</Typography>
                
                {/* --- TAMBAHKAN DATE PICKER DI SINI --- */}
                <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={id}>
                        <DatePicker
                            views={['year', 'month']}
                            label="Pilih Bulan & Tahun"
                            value={selectedDate}
                            onChange={(newDate) => {
                                setSelectedDate(newDate || new Date());
                                setPage(1); // Reset ke halaman 1 saat ganti bulan
                            }}
                            renderInput={(params) => <TextField {...params} size="small" />}
                        />
                    </LocalizationProvider>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsFormOpen(true)} sx={{ flexShrink: 0 }}>
                        Tambah
                    </Button>
                </Stack>
            </Box>
            
            {error && <Alert severity="error">{error}</Alert>}
            
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
            ) : (
                <Stack spacing={2}>
                    <TransactionList transactions={transactions} refreshTransactions={() => fetchTransactions(page, selectedDate)} />
                    {totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                            <Pagination 
                                count={totalPages} 
                                page={page} 
                                onChange={handlePageChange} 
                                color="primary"
                            />
                        </Box>
                    )}
                </Stack>
            )}

            <TransactionForm 
                open={isFormOpen} 
                onClose={handleFormClose} 
                categories={categories}
            />
        </Box>
    );
};

export default TransactionsPage;