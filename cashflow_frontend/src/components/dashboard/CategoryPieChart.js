// src/components/dashboard/CategoryPieChart.js
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Paper, Typography, Box, useTheme } from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryPieChart = ({ data }) => {
    const theme = useTheme();

    const chartData = {
        labels: data.map(d => d.category_name),
        datasets: [{
            data: data.map(d => d.total),
            backgroundColor: [
                theme.palette.primary.main,
                theme.palette.secondary.main,
                theme.palette.error.main,
                theme.palette.warning.main,
                theme.palette.info.main,
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
            ],
            hoverBackgroundColor: [
                theme.palette.primary.dark,
                theme.palette.secondary.dark,
                theme.palette.error.dark,
                theme.palette.warning.dark,
                theme.palette.info.dark,
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
            ]
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(context.parsed);
                        }
                        return label;
                    }
                }
            }
        },
    };

    // --- PERUBAHAN DI SINI ---
    return (
        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
                Pengeluaran per Kategori
            </Typography>
            <Box sx={{ flexGrow: 1, position: 'relative', minHeight: '300px' }}>
                {data && data.length > 0 ? (
                    <Doughnut data={chartData} options={options} />
                ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Typography>Tidak ada data pengeluaran.</Typography>
                    </Box>
                )}
            </Box>
        </Paper>
    );
};

export default CategoryPieChart;