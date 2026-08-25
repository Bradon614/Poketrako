const { PrismaClient } = require('@prisma/client');
const {
  isPositiveNumber,
  isPositiveInteger,
  isValidDateString
} = require('../utils/validation');
const { sendError } = require('../utils/errors');

const prisma = new PrismaClient();
const EXPENSE_TYPES = ['ONE_TIME', 'RECURRING'];

// Validates the subset of fields present in `body` (all optional so the same
// function works for create — where amount is required separately — and
// update, where every field is optional).
function validateExpenseFields(body, { requireAmount }) {
  if (requireAmount || body.amount !== undefined) {
    if (!isPositiveNumber(body.amount)) return 'Le montant doit être un nombre positif';
  }
  if (body.categoryId !== undefined && body.categoryId !== null && !isPositiveInteger(body.categoryId)) {
    return 'categoryId doit être un entier positif';
  }
  if (body.date !== undefined && body.date !== null && !isValidDateString(body.date)) {
    return 'Date invalide';
  }
  if (body.startDate !== undefined && body.startDate !== null && !isValidDateString(body.startDate)) {
    return 'Date de début invalide';
  }
  if (body.endDate !== undefined && body.endDate !== null && !isValidDateString(body.endDate)) {
    return 'Date de fin invalide';
  }
  if (body.type !== undefined && !EXPENSE_TYPES.includes(body.type)) {
    return `type doit être l'un de : ${EXPENSE_TYPES.join(', ')}`;
  }
  return null;
}

exports.getExpenses = async (req, res) => {
  try {
    const { start, end, categoryId, type, _sort, _limit } = req.query;
    const where = { userId: req.user.id };
    if (start) where.date = { gte: new Date(start) };
    if (end) where.date = { ...where.date, lte: new Date(end) };
    if (categoryId) where.categoryId = parseInt(categoryId, 10);
    if (type) where.type = type;

    const options = { where, include: { category: true } };
    if (_limit) options.take = parseInt(_limit, 10);
    if (_sort) {
      const [field, order] = _sort.split(':');
      options.orderBy = { [field]: order.toLowerCase() };
    }

    const expenses = await prisma.expense.findMany(options);
    res.json(expenses);
  } catch (error) {
    sendError(res, error);
  }
};

exports.getExpense = async (req, res) => {
  try {
    const expense = await prisma.expense.findFirst({
      where: { id: parseInt(req.params.id, 10), userId: req.user.id },
      include: { category: true, receiptUpload: true }
    });
    if (!expense) return res.status(404).json({ message: 'Dépense non trouvée' });
    res.json(expense);
  } catch (error) {
    sendError(res, error);
  }
};

exports.createExpense = async (req, res) => {
  try {
    const validationError = validateExpenseFields(req.body, { requireAmount: true });
    if (validationError) return res.status(400).json({ message: validationError });

    const { amount, date, categoryId, description, type, startDate, endDate } = req.body;

    const expense = await prisma.expense.create({
      data: {
        amount,
        date: date ? new Date(date) : undefined,
        categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
        description,
        type: type || undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        userId: req.user.id
      }
    });
    res.status(201).json(expense);
  } catch (error) {
    sendError(res, error, { status: 400, message: 'Impossible de créer la dépense' });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const validationError = validateExpenseFields(req.body, { requireAmount: false });
    if (validationError) return res.status(400).json({ message: validationError });

    const { amount, date, categoryId, description, type, startDate, endDate } = req.body;

    const expense = await prisma.expense.updateMany({
      where: { id: parseInt(req.params.id, 10), userId: req.user.id },
      data: {
        amount,
        date: date ? new Date(date) : undefined,
        categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
        description,
        type: type || undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      }
    });
    if (expense.count === 0) return res.status(404).json({ message: 'Dépense non trouvée' });
    res.status(200).json({ message: 'Dépense mise à jour' });
  } catch (error) {
    sendError(res, error, { status: 400, message: 'Impossible de mettre à jour la dépense' });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await prisma.expense.deleteMany({
      where: { id: parseInt(req.params.id, 10), userId: req.user.id }
    });
    if (expense.count === 0) return res.status(404).json({ message: 'Dépense non trouvée' });
    res.status(204).send();
  } catch (error) {
    sendError(res, error);
  }
};
