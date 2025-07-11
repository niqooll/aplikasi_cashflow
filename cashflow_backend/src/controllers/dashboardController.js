// src/controllers/dashboardController.js
const db = require('../config/db');

exports.getSummary = async (req, res) => {
  const userId = req.user.id;
  try {
    const query = `
      WITH monthly_summary AS (
        SELECT
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense
        FROM transactions
        WHERE
          user_id = $1 AND
          transaction_date >= date_trunc('month', current_date) AND
          transaction_date < date_trunc('month', current_date) + interval '1 month' AND
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
  try {
    const pieChartData = await db.query(
      `SELECT c.name as category_name, SUM(t.amount) as total
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1 AND t.type = 'expense' AND
             t.transaction_date >= date_trunc('month', current_date) AND
             t.transaction_date < date_trunc('month', current_date) + interval '1 month'
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

exports.getBudgetsSummary = async (req, res) => {
    const userId = req.user.id;
    try {
        const query = `
            SELECT 
                c.id, 
                c.name, 
                c.budget, 
                c.icon_name, -- PERBAIKAN 1: Ambil kolom icon_name
                COALESCE(SUM(t.amount), 0) as spent
            FROM categories c
            LEFT JOIN transactions t ON c.id = t.category_id 
                AND t.type = 'expense' 
                AND t.transaction_date >= date_trunc('month', current_date)
                AND t.transaction_date < date_trunc('month', current_date) + interval '1 month'
            WHERE 
                (c.user_id = $1 OR c.is_default = TRUE) AND c.budget > 0
            GROUP BY c.id, c.name, c.budget, c.icon_name -- PERBAIKAN 2: Tambahkan icon_name di GROUP BY
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