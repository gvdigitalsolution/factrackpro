const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/stats', async (req, res) => {
  try {
    // 1. Calculate Revenue (from Paid/Sent Invoices)
    // We assume 'sent', 'paid', 'partially_paid' count towards revenue stats (accrual basis)
    // Or strictly 'paid' for cash basis. Let's do Accrual (Facturé).
    const revenueQuery = `
      SELECT 
        COALESCE(SUM(total), 0) as total_revenue,
        COALESCE(SUM(vat_total), 0) as total_vat_collected
      FROM documents 
      WHERE type = 'invoice' AND status IN ('sent', 'paid', 'partially_paid', 'overdue')
    `;
    const revenueRes = await db.query(revenueQuery);
    const revenue = revenueRes.rows[0];

    // 2. Calculate Expenses
    const expensesQuery = `
      SELECT 
        COALESCE(SUM(amount), 0) as total_expenses_net,
        COALESCE(SUM(vat_amount), 0) as total_vat_deductible,
        COALESCE(SUM(total_amount), 0) as total_expenses_gross
      FROM expenses
    `;
    const expensesRes = await db.query(expensesQuery);
    const expenses = expensesRes.rows[0];

    // 3. Calculate Net
    const netIncome = Number(revenue.total_revenue) - Number(expenses.total_expenses_gross);
    const vatToPay = Number(revenue.total_vat_collected) - Number(expenses.total_vat_deductible);

    res.json({
      revenue: {
        total: Number(revenue.total_revenue),
        vat_collected: Number(revenue.total_vat_collected)
      },
      expenses: {
        net: Number(expenses.total_expenses_net),
        vat_deductible: Number(expenses.total_vat_deductible),
        gross: Number(expenses.total_expenses_gross)
      },
      net_income: netIncome,
      vat_to_pay: vatToPay
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
