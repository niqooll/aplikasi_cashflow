// src/components/dashboard/ExpenseTrendChart.js
import React, { useState, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Paper, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import api from '../../api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ExpenseTrendChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTrendData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/expense-trend');
      
      const labels = res.data.map(d => format(new Date(d.month), 'MMM yyyy', { locale: id }));
      const dataPoints = res.data.map(d => parseFloat(d.total_expense));

      setChartData({
        labels,
        datasets: [
          {
            label: 'Total Pengeluaran',
            data: dataPoints,
            fill: true,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            tension: 0.3,
          },
        ],
      });
    } catch (err) {
      console.error("Gagal memuat data tren", err);
      setError('Gagal memuat data tren pengeluaran.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrendData();
  }, [fetchTrendData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `Rp ${parseFloat(context.raw).toLocaleString('id-ID')}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `Rp ${value / 1000}k`,
        },
      },
    },
  };

  return (
    <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Tren Pengeluaran (3 Bulan Terakhir)
      </Typography>
      {/* PERUBAHAN DI SINI */}
      <Box sx={{ flexGrow: 1, position: 'relative', minHeight: '250px' }}>
        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}
        {chartData && !loading && (
          <Line data={chartData} options={options} />
        )}
      </Box>
    </Paper>
  );
};

export default ExpenseTrendChart;