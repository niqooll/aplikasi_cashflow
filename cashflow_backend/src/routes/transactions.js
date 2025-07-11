const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');

router.use(authMiddleware);

router.get('/', transactionController.getTransactions);
router.post('/', uploadMiddleware, transactionController.createTransaction); // Pakai middleware upload
router.patch('/:id/status', transactionController.updateTransactionStatus); // 'patch' lebih cocok untuk update parsial
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;