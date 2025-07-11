require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { checkUpcomingBills } = require('./services/scheduler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rute dasar
app.get('/', (req, res) => {
  res.send('Cashflow API is alive and kicking!');
});

// Impor Rute
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const transactionRoutes = require('./routes/transactions');
const dashboardRoutes = require('./routes/dashboard');

// Gunakan Rute
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Sajikan file statis dari folder 'uploads'
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// Inisialisasi Penjadwal Tugas
checkUpcomingBills();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});