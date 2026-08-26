const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense
} = require('../controllers/expenseController');
const { uploadReceipt, deleteReceipt } = require('../controllers/receiptController');

router.use(authMiddleware);

router.get('/', getExpenses);
router.get('/:id', getExpense);
router.post('/', createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);
router.post('/:id/receipt', uploadReceipt);
router.delete('/:id/receipt', deleteReceipt);

module.exports = router;
