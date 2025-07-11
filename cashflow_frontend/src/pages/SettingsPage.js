import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, TextField, Button, List, ListItem, ListItemText,
  IconButton, Paper, CircularProgress, Alert, InputAdornment, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, Tooltip, Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import api from '../api';
import NumericFormatCustom from '../components/common/NumericFormatCustom';
import { iconComponents, availableIcons } from '../utils/iconMap';

const SettingsPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [budgets, setBudgets] = useState({});
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('MoreHorizIcon');

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      setCategories(res.data);

      const initialBudgets = {};
      res.data.forEach(cat => {
        initialBudgets[cat.id] = cat.budget || '0';
      });
      setBudgets(initialBudgets);

    } catch (err) {
      setError('Gagal memuat kategori.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleBudgetChange = (categoryId, value) => {
    setBudgets(prev => ({ ...prev, [categoryId]: value }));
  };

  const handleSaveBudget = async (categoryId) => {
    const budgetValue = budgets[categoryId] || 0;
    try {
        await api.put(`/categories/${categoryId}/budget`, { budget: budgetValue });
        alert('Anggaran berhasil disimpan!');
        fetchCategories();
    } catch (error) {
        console.error('Gagal menyimpan anggaran', error);
        alert('Gagal menyimpan anggaran.');
    }
  };

  const handleOpenAddDialog = () => {
    setNewCategoryName('');
    setSelectedIcon('MoreHorizIcon');
    setOpenAddDialog(true);
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await api.post('/categories', { name: newCategoryName, icon_name: selectedIcon });
      setOpenAddDialog(false);
      fetchCategories();
    } catch (err) {
      alert('Gagal menambahkan kategori.');
      console.error(err);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      try {
        await api.delete(`/categories/${categoryId}`);
        fetchCategories();
      } catch (err) {
        const errorMsg = err.response?.data?.msg || 'Gagal menghapus kategori.';
        alert(errorMsg);
        console.error(err);
      }
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>Pengaturan</Typography>
        <Button variant="contained" startIcon={<AddCircleIcon />} onClick={handleOpenAddDialog}>
          Tambah Kategori
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Atur Anggaran Kategori</Typography>
        <List>
          {categories.map((cat, index) => (
            <React.Fragment key={cat.id}>
              <ListItem>
                <ListItemText primary={cat.name} secondary={cat.is_default ? 'Kategori Default' : 'Kategori Custom'} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    label="Anggaran"
                    size="small"
                    value={budgets[cat.id] || ''}
                    name={`budget-${cat.id}`}
                    onChange={(e) => handleBudgetChange(cat.id, e.target.value)}
                    InputProps={{
                      inputComponent: NumericFormatCustom,
                      startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                    }}
                    sx={{ width: 200 }}
                  />
                  <Button size="small" variant="outlined" onClick={() => handleSaveBudget(cat.id)}>
                    <SaveIcon />
                  </Button>
                </Box>
                {/* Tombol hapus hanya untuk kategori custom */}
                {!cat.is_default && (
                    <IconButton edge="end" aria-label="delete" sx={{ml: 1}} onClick={() => handleDeleteCategory(cat.id)}>
                        <DeleteIcon color="error"/>
                    </IconButton>
                )}
              </ListItem>
              {index < categories.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Dialog untuk Tambah Kategori Baru */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Tambah Kategori Baru</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              label="Nama Kategori"
              fullWidth
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <Typography variant="subtitle1">Pilih Ikon</Typography>
            <Paper variant="outlined" sx={{ p: 2, maxHeight: 200, overflowY: 'auto' }}>
              <Grid container spacing={1}>
                {availableIcons.map(iconName => (
                  <Grid item key={iconName}>
                    <Tooltip title={iconName.replace('Icon', '')}>
                      <IconButton 
                        onClick={() => setSelectedIcon(iconName)}
                        sx={{ 
                          border: '2px solid',
                          borderColor: selectedIcon === iconName ? 'primary.main' : 'transparent' 
                        }}
                      >
                        {iconComponents[iconName]}
                      </IconButton>
                    </Tooltip>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Batal</Button>
          <Button onClick={handleAddCategory} variant="contained">Simpan</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;