// controllers/expenseController.js
const Expense = require('../models/Expense');

exports.createExpense = async (req, res) => {
  try {
    const expense = await Expense.create({
      userId: req.user.id,
      title: req.body.title,
      amount: req.body.amount,
      category: req.body.category,
      receiptUrl: req.file?.path
    });
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getExpenses = async (req, res) => {
  const expenses = await Expense.findAll({ where: { userId: req.user.id } });
  res.json(expenses);
};
