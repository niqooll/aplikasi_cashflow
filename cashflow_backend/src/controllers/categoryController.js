// src/controllers/categoryController.js
const db = require('../config/db');

exports.getCategories = async (req, res) => {
  const userId = req.user.id;
  try {
    const categories = await db.query(
      'SELECT * FROM categories WHERE user_id = $1 OR is_default = TRUE ORDER BY name', [userId]
    );
    res.json(categories.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.createCategory = async (req, res) => {
  const { name, icon_name } = req.body;
  const userId = req.user.id;
  if (!name) {
    return res.status(400).json({ msg: 'Nama kategori wajib diisi.' });
  }
  try {
    const newCategory = await db.query(
      'INSERT INTO categories (user_id, name, icon_name) VALUES ($1, $2, $3) RETURNING *',
      [userId, name, icon_name]
    );
    res.status(201).json(newCategory.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.deleteCategory = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const result = await db.query(
            'DELETE FROM categories WHERE id = $1 AND user_id = $2 AND is_default = FALSE', [id, userId]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ msg: 'Kategori tidak ditemukan atau Anda tidak berhak menghapusnya.' });
        }
        res.json({ msg: 'Kategori berhasil dihapus' });
    } catch (err) {
        if (err.code === '23503') {
            return res.status(400).json({ msg: 'Tidak bisa menghapus kategori yang sedang digunakan oleh transaksi.' });
        }
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateCategoryBudget = async (req, res) => {
  const { id } = req.params;
  const { budget } = req.body;
  const userId = req.user.id;
  if (budget === undefined || budget === null || isNaN(parseFloat(budget)) || parseFloat(budget) < 0) {
    return res.status(400).json({ msg: 'Nilai budget tidak valid.' });
  }
  try {
    const result = await db.query(
      'UPDATE categories SET budget = $1 WHERE id = $2 AND (user_id = $3 OR is_default = TRUE)',
      [parseFloat(budget), id, userId]
    );
    // Tidak perlu cek rowCount karena update pada kategori default tidak akan mengembalikan user_id yang cocok
    // Jika tidak ada error, kita anggap berhasil
    res.json({ msg: 'Anggaran berhasil diperbarui' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};