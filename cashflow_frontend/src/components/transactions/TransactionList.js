import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Typography, Chip, Box, Grid, Stack, Divider,
  useTheme, useMediaQuery, Avatar, alpha // Tambahkan Avatar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns'; 
import { id } from 'date-fns/locale';
import api from '../../api';
import { iconComponents } from '../../utils/iconMap';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const transactionTypeDetails = {
  income: { label: 'Pemasukan', color: 'success' },
  expense: { label: 'Pengeluaran', color: 'error' },
  transfer_to_savings: { label: 'Transfer ke Tabungan', color: 'warning' },
  transfer_from_savings: { label: 'Tarik dari Tabungan', color: 'info' },
};

const TransactionList = ({ transactions, refreshTransactions }) => {
  const theme = useTheme();
  // isMobile akan bernilai true jika lebar layar di bawah breakpoint 'sm' (600px)
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  // ======================================================
  // Tampilan untuk Desktop (Layar Lebar)
  // ======================================================
  const DesktopView = (
    <Box sx={{ overflowX: 'auto' }}>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="daftar transaksi">
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
                <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row" sx={{ whiteSpace: 'nowrap' }}>
                    {format(new Date(row.transaction_date), 'dd MMM yyyy', { locale: id })}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={iconComponents[row.icon_name] || <MoreHorizIcon fontSize="small"/>}
                      label={categoryLabel} 
                      size="small"
                      color={transactionTypeDetails[row.type]?.color || 'default'}
                    />
                  </TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ color: amountColor, fontWeight: 'bold', whiteSpace: 'nowrap' }}>
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
    </Box>
  );

  // ======================================================
  // Tampilan untuk Mobile (Layar Kecil)
  // ======================================================
  const MobileView = (
    <Stack spacing={2}>
      {transactions.map((row) => {
        const isIncome = row.type === 'income' || row.type === 'transfer_from_savings';
        const amountColor = isIncome ? 'success.main' : 'error.main';
        const amountSign = isIncome ? '+ ' : '- ';
        const categoryLabel = row.type === 'expense' 
          ? row.category_name 
          : transactionTypeDetails[row.type]?.label || row.type;
        const detailColor = transactionTypeDetails[row.type]?.color || 'default';

        return (
          <Paper key={row.id} sx={{ p: 2 }}>
            {/* Menggunakan Stack horizontal sebagai dasar kartu */}
            <Stack direction="row" spacing={2} alignItems="center">
              {/* Bagian 1: Ikon */}
              <Avatar sx={{ bgcolor: alpha(theme.palette[detailColor]?.main || theme.palette.grey[500], 0.1), color: `${detailColor}.main` }}>
                {iconComponents[row.icon_name] || <MoreHorizIcon />}
              </Avatar>

              {/* Bagian 2: Konten Tengah (Deskripsi & Kategori/Tanggal) */}
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 600, wordBreak: 'break-word' }}>
                  {row.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {categoryLabel} • {format(new Date(row.transaction_date), 'dd MMM yyyy', { locale: id })}
                </Typography>
              </Box>

              {/* Bagian 3: Jumlah & Tombol Hapus */}
              <Stack sx={{ alignItems: 'flex-end' }}>
                 <Typography variant="body1" sx={{ color: amountColor, fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                  {amountSign}{parseFloat(row.amount).toLocaleString('id-ID')}
                </Typography>
                <IconButton onClick={() => handleDelete(row.id)} aria-label="delete" size="small" sx={{mt: 0.5}}>
                  <DeleteIcon fontSize="small" sx={{ opacity: 0.6 }}/>
                </IconButton>
              </Stack>
            </Stack>
          </Paper>
        );
      })}
    </Stack>
  );

  return isMobile ? MobileView : DesktopView;
};

export default TransactionList;