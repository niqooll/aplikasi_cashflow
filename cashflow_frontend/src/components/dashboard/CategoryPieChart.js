import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Paper, Typography, Box } from '@mui/material';

ChartJS.register(ArcElement, Tooltip, Legend);

// Palet warna yang lebih modern dan tidak terlalu mencolok
const colorPalette = [
    '#4A90E2', // Blue
    '#F5A623', // Orange
    '#7ED321', // Green
    '#BD10E0', // Purple
    '#E0405A', // Red
    '#4A4A4A', // Dark Grey
    '#50E3C2', // Teal
];

const CategoryPieChart = ({ data }) => {
  const chartData = {
    labels: data.map(d => d.category_name),
    datasets: [
      {
        label: ' Pengeluaran',
        data: data.map(d => parseFloat(d.total)),
        backgroundColor: colorPalette.map(color => `${color}B3`), // B3 = 70% opacity
        borderColor: colorPalette,
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Penting agar chart bisa mengisi container
    cutout: '60%', // Ini yang mengubah Pie menjadi Donut Chart
    plugins: {
      legend: {
        position: 'bottom', // Pindahkan legenda ke bawah agar tidak memakan tempat
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              // Menambahkan format Rupiah ke tooltip
              label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(context.parsed);
            }
            return label;
          }
        }
      }
    }
  };

  return (
    <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Pengeluaran per Kategori
      </Typography>
      <Box sx={{ flexGrow: 1, position: 'relative', minHeight: '300px' }}>
        {data && data.length > 0 ? (
            <Doughnut data={chartData} options={options} />
        ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography color="text.secondary">Belum ada data pengeluaran bulan ini.</Typography>
            </Box>
        )}
      </Box>
    </Paper>
  );
};

export default CategoryPieChart;