import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Typography, Chip 
  // 'Box' sudah dihapus dari daftar import ini
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
// NAMA LIBRARY SUDAH DIPERBAIKI DI SINI
import { format } from 'date-fns'; 
import { id } from 'date-fns/locale';
import api from '../../api';

// Objek untuk membantu kita mendefinisikan label dan warna
const transactionTypeDetails = {
  income: { label: 'Pemasukan', color: 'success' },
  expense: { label: 'Pengeluaran', color: 'error' },
  transfer_to_savings: { label: 'Transfer ke Tabungan', color: 'warning' },
  transfer_from_savings: { label: 'Tarik dari Tabungan', color: 'info' },
};

const TransactionList = ({ transactions, refreshTransactions }) => {

  const handleDelete = async (transactionId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      try {
        await api.delete(`/transactions/${transactionId}`);
        refreshTransactions();
      } catch (err) {
        console.error('Gagal menghapus transaksi', err);
        alert('Gagal menghapus transaksi.');
      }
    }
  };

  if (!transactions || transactions.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Belum ada transaksi.</Typography>
        <Typography>Silakan tambah transaksi baru untuk memulai.</Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="daftar transaksi">
        <TableHead>
          <TableRow>
            <TableCell>Tanggal</TableCell>
            <TableCell>Jenis / Kategori</TableCell>
            <TableCell>Deskripsi</TableCell>
            <TableCell align="right">Jumlah</TableCell>
            <TableCell align="center">Aksi</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((row) => {
            const isIncome = row.type === 'income' || row.type === 'transfer_from_savings';
            const amountColor = isIncome ? 'success.main' : 'error.main';
            const amountSign = isIncome ? '+ ' : '- ';
            
            const categoryLabel = row.type === 'expense' 
              ? row.category_name 
              : transactionTypeDetails[row.type]?.label || row.type;

            return (
              <TableRow
                key={row.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {format(new Date(row.transaction_date), 'dd MMM yyyy', { locale: id })}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={categoryLabel} 
                    size="small"
                    color={transactionTypeDetails[row.type]?.color || 'default'}
                  />
                </TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ color: amountColor, fontWeight: 'bold' }}>
                    {amountSign} Rp {parseFloat(row.amount).toLocaleString('id-ID')}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleDelete(row.id)} aria-label="delete" color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TransactionList;