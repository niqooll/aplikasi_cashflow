// src/controllers/transactionController.js
const db = require('../config/db');

// Fungsi untuk membuat transaksi (dengan validasi saldo)
exports.createTransaction = async (req, res) => {
  const { category_id, amount, description, transaction_date, status, type } = req.body;
  const userId = req.user.id;
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');
    const transactionAmount = parseFloat(amount);
    if (isNaN(transactionAmount) || transactionAmount <= 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(400).json({ msg: 'Jumlah transaksi tidak valid.' });
    }
    const isMainBalanceOutflow = type === 'expense' || type === 'transfer_to_savings';
    const isSavingsBalanceOutflow = type === 'transfer_from_savings';

    if (isMainBalanceOutflow) {
      const balanceQuery = `
        SELECT COALESCE(SUM(CASE WHEN type IN ('income', 'transfer_from_savings') THEN amount ELSE -amount END), 0) AS main_balance
        FROM transactions WHERE user_id = $1 AND type IN ('income', 'expense', 'transfer_to_savings', 'transfer_from_savings')
      `;
      const balanceResult = await client.query(balanceQuery, [userId]);
      const mainBalance = parseFloat(balanceResult.rows[0].main_balance);
      if (mainBalance < transactionAmount) {
        await client.query('ROLLBACK');
        client.release();
        return res.status(400).json({ msg: 'Saldo utama tidak mencukupi.' });
      }
    } else if (isSavingsBalanceOutflow) {
      const savingsBalanceQuery = `
        SELECT COALESCE(SUM(CASE WHEN type = 'transfer_to_savings' THEN amount ELSE -amount END), 0) AS savings_balance
        FROM transactions WHERE user_id = $1 AND type LIKE 'transfer%'
      `;
      const savingsBalanceResult = await client.query(savingsBalanceQuery, [userId]);
      const savingsBalance = parseFloat(savingsBalanceResult.rows[0].savings_balance);
      if (savingsBalance < transactionAmount) {
        await client.query('ROLLBACK');
        client.release();
        return res.status(400).json({ msg: 'Saldo tabungan tidak mencukupi.' });
      }
    }
    const newTransactionQuery = `
      INSERT INTO transactions (user_id, category_id, amount, description, transaction_date, status, type)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `;
    const newTransaction = await client.query(newTransactionQuery,
      [userId, category_id, transactionAmount, description, transaction_date, status || 'paid', type]
    );
    await client.query('COMMIT');
    res.status(201).json(newTransaction.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Server Error');
  } finally {
    client.release();
  }
};

// di src/controllers/transactionController.js

exports.getTransactions = async (req, res) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const transactionsQuery = `
            SELECT t.id, t.amount, t.description, t.transaction_date, t.status, t.type,
                   c.name as category_name, c.icon_name
            FROM transactions t
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE t.user_id = $1 
            ORDER BY t.transaction_date DESC, t.id DESC
            LIMIT $2 OFFSET $3
        `;
        const transactionsResult = await db.query(transactionsQuery, [userId, limit, offset]);

        const countQuery = 'SELECT COUNT(*) FROM transactions WHERE user_id = $1';
        const countResult = await db.query(countQuery, [userId]);
        const totalTransactions = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalTransactions / limit);

        // Kirim response dalam format OBJEK
        res.json({
            transactions: transactionsResult.rows,
            currentPage: page,
            totalPages: totalPages
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Fungsi untuk menghapus transaksi
exports.deleteTransaction = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const result = await db.query('DELETE FROM transactions WHERE id = $1 AND user_id = $2', [id, userId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ msg: 'Transaction not found' });
        }
        res.json({ msg: 'Transaction deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Fungsi untuk update status (jika dipakai untuk workflow)
exports.updateTransactionStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    if (!status) {
        return res.status(400).json({ msg: 'Status is required' });
    }
    try {
        const updatedTransaction = await db.query(
            'UPDATE transactions SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
            [status, id, userId]
        );
        if (updatedTransaction.rowCount === 0) {
            return res.status(404).json({ msg: 'Transaction not found or you are not authorized' });
        }
        res.json(updatedTransaction.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};