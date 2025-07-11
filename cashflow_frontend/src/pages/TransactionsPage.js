import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Pagination, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
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

    const fetchTransactions = useCallback(async (currentPage = 1) => {
        try {
            setLoading(true);
            const res = await api.get(`/transactions?page=${currentPage}&limit=10`);
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
        fetchTransactions(1);
        fetchCategories();
    // PERBAIKAN DI SINI: Tambahkan fetchTransactions ke dalam array
    }, [fetchTransactions, fetchCategories]);
    
    const handleFormClose = () => {
        setIsFormOpen(false);
        fetchTransactions(1);
        fetchSummaryData();
    };

    const handlePageChange = (event, value) => {
        setPage(value);
        fetchTransactions(value);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Daftar Transaksi</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsFormOpen(true)}>
                    Tambah Transaksi
                </Button>
            </Box>
            
            {error && <Alert severity="error">{error}</Alert>}
            
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
            ) : (
                <Stack spacing={2}>
                    <TransactionList transactions={transactions} refreshTransactions={() => fetchTransactions(page)} />
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