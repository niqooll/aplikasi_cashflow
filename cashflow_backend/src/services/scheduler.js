const cron = require('node-cron');
const db = require('../config/db');

const checkUpcomingBills = () => {
    // Menjalankan setiap hari jam 8 pagi
    cron.schedule('0 8 * * *', async () => {
        console.log('Running a daily check for upcoming bills...');
        try {
            // Contoh: Cari transaksi 'planned' yang jatuh tempo 3 hari lagi
            const result = await db.query(`
                SELECT u.email, t.description, t.amount, t.transaction_date
                FROM transactions t
                JOIN users u ON t.user_id = u.id
                WHERE t.status = 'planned' AND t.transaction_date = current_date + interval '3 days'
            `);

            if (result.rows.length > 0) {
                console.log('Found upcoming bills:', result.rows);
                // Di sini Anda bisa menambahkan logika pengiriman email
                // menggunakan library seperti Nodemailer
            } else {
                console.log('No upcoming bills found for today.');
            }
        } catch (err) {
            console.error('Error checking for upcoming bills:', err.message);
        }
    });
};

module.exports = { checkUpcomingBills };