// src/controllers/dashboardController.js
const db = require('../config/db');

// Fungsi helper untuk mendapatkan tanggal awal dan akhir bulan dari query
const getMonthDateRange = (year, month) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  return { startDate, endDate };
};


exports.getSummary = async (req, res) => {
  const userId = req.user.id;
  // --- PERUBAHAN DIMULAI ---
  const { year, month } = req.query;

  // Jika tidak ada query, gunakan tanggal saat ini. Jika ada, gunakan tanggal dari query.
  const targetDate = (year && month) 
    ? `'${parseInt(year, 10)}-${parseInt(month, 10)}-01'` 
    : 'current_date';
  // --- PERUBAHAN SELESAI ---
  
  try {
    const query = `
      WITH monthly_summary AS (
        SELECT
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense
        FROM transactions
        WHERE
          user_id = $1 AND
          -- --- PERUBAHAN DIMULAI ---
          transaction_date >= date_trunc('month', ${targetDate}::date) AND
          transaction_date < date_trunc('month', ${targetDate}::date) + interval '1 month' AND
          -- --- PERUBAHAN SELESAI ---
          type IN ('income', 'expense')
      ),
      balance_summary AS (
        SELECT
          COALESCE(SUM(CASE WHEN type IN ('income', 'transfer_from_savings') THEN amount ELSE -amount END), 0) AS main_balance,
          COALESCE(SUM(CASE WHEN type = 'transfer_to_savings' THEN amount WHEN type = 'transfer_from_savings' THEN -amount ELSE 0 END), 0) AS savings_balance
        FROM transactions
        WHERE user_id = $1 AND type IN ('income', 'expense', 'transfer_to_savings', 'transfer_from_savings')
      )
      SELECT * FROM monthly_summary, balance_summary;
    `;
    const result = await db.query(query, [userId]);
    const summary = {
      total_income: parseFloat(result.rows[0].total_income),
      total_expense: parseFloat(result.rows[0].total_expense),
      main_balance: parseFloat(result.rows[0].main_balance),
      savings_balance: parseFloat(result.rows[0].savings_balance),
    };
    res.json(summary);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getCategoryPieChart = async (req, res) => {
  const userId = req.user.id;
  // --- PERUBAHAN DIMULAI ---
  const { year, month } = req.query;

  const targetDate = (year && month) 
    ? `'${parseInt(year, 10)}-${parseInt(month, 10)}-01'` 
    : 'current_date';
  // --- PERUBAHAN SELESAI ---

  try {
    const pieChartData = await db.query(
      `SELECT c.name as category_name, SUM(t.amount) as total
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1 AND t.type = 'expense' AND
             -- --- PERUBAHAN DIMULAI ---
             t.transaction_date >= date_trunc('month', ${targetDate}::date) AND
             t.transaction_date < date_trunc('month', ${targetDate}::date) + interval '1 month'
             -- --- PERUBAHAN SELESAI ---
       GROUP BY c.name
       ORDER BY total DESC`,
      [userId]
    );
    res.json(pieChartData.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getExpenseTrend = async (req, res) => {
  const userId = req.user.id;
  try {
    const query = `
      WITH three_months AS (
        SELECT date_trunc('month', generate_series(
          current_date - interval '2 months', -- <-- UBAH DI SINI (dari '5 months')
          current_date,
          '1 month'
        )) AS month
      )
      SELECT
        to_char(sm.month, 'YYYY-MM') AS month,
        COALESCE(SUM(t.amount), 0) AS total_expense
      FROM three_months sm
      LEFT JOIN transactions t ON date_trunc('month', t.transaction_date) = sm.month
        AND t.user_id = $1
        AND t.type = 'expense'
      GROUP BY sm.month
      ORDER BY sm.month;
    `;
    const result = await db.query(query, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getBudgetsSummary = async (req, res) => {
    const userId = req.user.id;
    // --- PERUBAHAN DIMULAI ---
    const { year, month } = req.query;

    const targetDate = (year && month) 
      ? `'${parseInt(year, 10)}-${parseInt(month, 10)}-01'` 
      : 'current_date';
    // --- PERUBAHAN SELESAI ---
    try {
        const query = `
            SELECT 
                c.id, 
                c.name, 
                c.budget, 
                c.icon_name,
                COALESCE(SUM(t.amount), 0) as spent
            FROM categories c
            LEFT JOIN transactions t ON c.id = t.category_id 
                AND t.type = 'expense' 
                -- --- PERUBAHAN DIMULAI ---
                AND t.transaction_date >= date_trunc('month', ${targetDate}::date)
                AND t.transaction_date < date_trunc('month', ${targetDate}::date) + interval '1 month'
                -- --- PERUBAHAN SELESAI ---
            WHERE 
                (c.user_id = $1 OR c.is_default = TRUE) AND c.budget > 0
            GROUP BY c.id, c.name, c.budget, c.icon_name
            ORDER BY c.name;
        `;
        const result = await db.query(query, [userId]);

        const budgetSummary = result.rows.map(item => ({
            ...item,
            budget: parseFloat(item.budget),
            spent: parseFloat(item.spent)
        }));

        res.json(budgetSummary);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};