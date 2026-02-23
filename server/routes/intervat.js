const express = require('express');
const router = express.Router();
const db = require('../db');

// GET calculate VAT return
router.get('/calculate', async (req, res) => {
  const { year, quarter } = req.query;

  if (!year || !quarter) {
    return res.status(400).json({ error: 'Année et trimestre requis' });
  }

  // Calculate start and end dates for the quarter
  const startDate = new Date(year, (quarter - 1) * 3, 1).toISOString().split('T')[0];
  const endDate = new Date(year, quarter * 3, 0).toISOString().split('T')[0];

  try {
    // 1. SALES (OUTPUT VAT)
    // We need to sum invoice items by VAT rate
    // Note: We only include 'invoice' type, and status that are not 'draft' (assuming draft is not yet declared)
    // Or maybe we include everything sent/paid. Let's say sent, paid, partially_paid, overdue.
    const salesQuery = `
      SELECT 
        di.vat_rate,
        SUM(di.quantity * di.unit_price) as base_amount,
        SUM((di.quantity * di.unit_price) * (di.vat_rate / 100)) as vat_amount
      FROM document_items di
      JOIN documents d ON di.document_id = d.id
      WHERE d.type = 'invoice' 
      AND d.status IN ('sent', 'paid', 'partially_paid', 'overdue')
      AND d.date >= $1 AND d.date <= $2
      GROUP BY di.vat_rate
    `;
    
    const salesResult = await db.query(salesQuery, [startDate, endDate]);
    
    // Initialize Grid Boxes
    const grid = {
      '00': 0, // 0%
      '01': 0, // 6%
      '02': 0, // 12%
      '03': 0, // 21%
      '54': 0, // Total VAT Due
      '81': 0, // Inputs (Materials) - Simplified: we'll put expenses here
      '82': 0, // Inputs (Services)
      '83': 0, // Inputs (Investments)
      '59': 0, // Deductible VAT
      '71': 0, // To Pay
      '72': 0, // To Reclaim
    };

    // Fill Sales Boxes
    salesResult.rows.forEach(row => {
      const rate = Number(row.vat_rate);
      const base = Number(row.base_amount);
      const vat = Number(row.vat_amount);

      if (rate === 0) grid['00'] += base;
      else if (rate === 6) grid['01'] += base;
      else if (rate === 12) grid['02'] += base;
      else if (rate === 21) grid['03'] += base;

      grid['54'] += vat;
    });

    // 2. PURCHASES (INPUT VAT)
    const expensesQuery = `
      SELECT 
        SUM(amount) as base_amount,
        SUM(vat_amount) as vat_amount
      FROM expenses
      WHERE date >= $1 AND date <= $2
    `;

    const expensesResult = await db.query(expensesQuery, [startDate, endDate]);
    const expenses = expensesResult.rows[0];

    // Fill Purchase Boxes
    // Simplified: Putting all base expenses in Box 82 (Services & Divers) for now
    // In a real app, expenses would have a 'type' (Goods, Services, Investments)
    grid['82'] += Number(expenses.base_amount || 0);
    grid['59'] += Number(expenses.vat_amount || 0);

    // 3. TOTALS
    const vatDue = grid['54'];
    const vatDeductible = grid['59'];
    const balance = vatDue - vatDeductible;

    if (balance > 0) {
      grid['71'] = balance;
    } else {
      grid['72'] = Math.abs(balance);
    }

    res.json({
      period: { year, quarter, startDate, endDate },
      grid
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors du calcul Intervat' });
  }
});

module.exports = router;
