import React, { useState, useEffect } from 'react';
// 'NumericFormat' sudah tidak di-import di sini
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem,
  FormControl, InputLabel, Box, ToggleButtonGroup, ToggleButton, Alert, Stack, InputAdornment,
  Radio, RadioGroup, FormControlLabel, FormLabel
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { id } from 'date-fns/locale';
import DescriptionIcon from '@mui/icons-material/Description';
import api from '../../api';
// Kita hanya mengimpor komponen reusable kita
import NumericFormatCustom from '../common/NumericFormatCustom'; 
import useAuth from '../../hooks/useAuth';

const generatePayload = (formState) => {
    const { type, amount, description, categoryId, transactionDate, transferDirection } = formState;
    let finalType = type;
    let finalDescription = description;

    if (type === 'transfer') {
        if (transferDirection === 'to_savings') {
            finalType = 'transfer_to_savings';
            finalDescription = description || 'Transfer ke Tabungan';
        } else {
            finalType = 'transfer_from_savings';
            finalDescription = description || 'Tarik dari Tabungan';
        }
    }

    return {
        type: finalType,
        amount,
        description: finalDescription,
        transaction_date: transactionDate.toISOString().split('T')[0],
        category_id: type === 'expense' ? categoryId : null,
    };
};

const TransactionForm = ({ open, onClose, categories }) => {
    const [type, setType] = useState('expense');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [transactionDate, setTransactionDate] = useState(new Date());
    const [error, setError] = useState('');
    const [transferDirection, setTransferDirection] = useState('to_savings');

    const { summaryData, fetchSummaryData } = useAuth();

    useEffect(() => {
        if (type !== 'transfer') {
            setTransferDirection('to_savings');
        }
    }, [type]);

    const handleTypeChange = (event, newType) => {
        if (newType !== null) {
            setType(newType);
            if (newType !== 'expense') setCategoryId('');
        }
    };

    const resetForm = () => {
        setType('expense');
        setAmount('');
        setDescription('');
        setCategoryId('');
        setTransactionDate(new Date());
        setError('');
        setTransferDirection('to_savings');
    }

    const handleClose = () => {
        resetForm();
        onClose();
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const mainBalance = summaryData?.main_balance ?? 0;
        const savingsBalance = summaryData?.savings_balance ?? 0;
        const transactionAmount = parseFloat(amount);
        
        const isExpenseOutflow = type === 'expense';
        const isTransferToSavings = type === 'transfer' && transferDirection === 'to_savings';
        const isTransferFromSavings = type === 'transfer' && transferDirection === 'from_savings';

        if ((isExpenseOutflow || isTransferToSavings) && transactionAmount > mainBalance) {
            setError(`Saldo utama tidak mencukupi. Saldo Anda: Rp ${mainBalance.toLocaleString('id-ID')}`);
            return;
        }

        if (isTransferFromSavings && transactionAmount > savingsBalance) {
            setError(`Saldo tabungan tidak mencukupi. Saldo Anda: Rp ${savingsBalance.toLocaleString('id-ID')}`);
            return;
        }
        
        const payload = generatePayload({ type, amount, description, categoryId, transactionDate, transferDirection });

        try {
            await api.post('/transactions', payload);
            fetchSummaryData();
            handleClose();
        } catch (err) {
            const errorMsg = err.response?.data?.msg || `Gagal menambahkan transaksi`;
            setError(errorMsg);
            console.error(err);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle>Tambah Transaksi</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Stack spacing={2.5} sx={{ pt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <ToggleButtonGroup
                              color="primary" value={type} exclusive
                              onChange={handleTypeChange} aria-label="Transaction Type" size="small"
                            >
                                <ToggleButton value="expense">Pengeluaran</ToggleButton>
                                <ToggleButton value="income">Pemasukan</ToggleButton>
                                <ToggleButton value="transfer">Transfer</ToggleButton>
                            </ToggleButtonGroup>
                        </Box>
                        
                        {error && <Alert severity="error">{error}</Alert>}
                        
                        {type === 'transfer' && (
                            <FormControl component="fieldset" sx={{ alignItems: 'center' }}>
                                <FormLabel component="legend">Arah Transfer</FormLabel>
                                <RadioGroup row value={transferDirection} onChange={(e) => setTransferDirection(e.target.value)}>
                                    <FormControlLabel value="to_savings" control={<Radio />} label="Ke Tabungan" />
                                    <FormControlLabel value="from_savings" control={<Radio />} label="Dari Tabungan" />
                                </RadioGroup>
                            </FormControl>
                        )}
                        
                        <TextField
                          label="Jumlah (Rp)" value={amount} onChange={(e) => setAmount(e.target.value)}
                          name="amount" required InputProps={{ inputComponent: NumericFormatCustom, startAdornment: (<InputAdornment position="start">Rp</InputAdornment>) }} variant="outlined"
                        />
                        
                        <TextField
                          label={type === 'transfer' ? 'Catatan Transfer (Opsional)' : 'Deskripsi'}
                          type="text" value={description} onChange={e => setDescription(e.target.value)}
                          required={type !== 'transfer'}
                          InputProps={{ startAdornment: (<InputAdornment position="start"><DescriptionIcon /></InputAdornment>)}}
                        />

                        {type === 'expense' && (
                            <FormControl fullWidth required>
                                <InputLabel>Kategori</InputLabel>
                                <Select value={categoryId} label="Kategori" onChange={e => setCategoryId(e.target.value)}>
                                    {categories.map(cat => (<MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>))}
                                </Select>
                            </FormControl>
                        )}

                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={id}>
                            <DatePicker
                              label="Tanggal Transaksi" value={transactionDate}
                              onChange={newValue => setTransactionDate(newValue)}
                              renderInput={(params) => <TextField {...params} />}
                            />
                        </LocalizationProvider>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: '16px 24px' }}>
                    <Button onClick={handleClose}>Batal</Button>
                    <Button type="submit" variant="contained">Simpan</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default TransactionForm;