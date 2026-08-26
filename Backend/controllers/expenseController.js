const { PrismaClient } = require('@prisma/client');
const {
  isPositiveNumber,
  isPositiveInteger,
  isValidDateString
} = require('../utils/validation');
const { sendError } = require('../utils/errors');

const prisma = new PrismaClient();
const EXPENSE_TYPES = ['ONE_TIME', 'RECURRING'];
const MAX_RECURRING_OCCURRENCES = 60; // sanity cap (5 years of monthly occurrences)
const DEFAULT_RECURRING_MONTHS = 12; // horizon used when no endDate is given

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

function daysInMonth(year, monthIndex) {
  // Date-only values are stored/compared as UTC midnight throughout the app
  // (that's how "2026-01-31" parses), so month-length math must stay in UTC
  // too — mixing in local-timezone getters/constructors here shifts the
  // stored date by a day for any server timezone that isn't UTC.
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

// Builds one Date per monthly occurrence between startDate and endDate
// (inclusive), keeping the same day-of-month as startDate and clamping to
// the last day of shorter months (e.g. Jan 31 -> Feb 28/29, not Mar 3).
function buildMonthlyOccurrences(startDate, endDate) {
  const day = startDate.getUTCDate();
  const dates = [];
  let year = startDate.getUTCFullYear();
  let monthIndex = startDate.getUTCMonth();

  while (dates.length < MAX_RECURRING_OCCURRENCES) {
    const occurrence = new Date(Date.UTC(year, monthIndex, Math.min(day, daysInMonth(year, monthIndex))));
    if (occurrence > endDate) break;
    dates.push(occurrence);
    monthIndex += 1;
    if (monthIndex > 11) {
      monthIndex = 0;
      year += 1;
    }
  }
  return dates;
}

exports.getExpenses = async (req, res) => {
  try {
    const { start, end, categoryId, type, _sort, _limit } = req.query;
    const where = { userId: req.user.id };
    if (start) where.date = { gte: new Date(start) };
    if (end) where.date = { ...where.date, lte: new Date(end) };
    if (categoryId) where.categoryId = parseInt(categoryId, 10);
    if (type) where.type = type;

    const options = { where, include: { category: true, receiptUpload: true } };
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

    if (type === 'RECURRING') {
      if (!startDate) {
        return res.status(400).json({ message: 'La date de début est requise pour une dépense récurrente' });
      }

      const start = new Date(startDate);
      const end = endDate
        ? new Date(endDate)
        : new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + DEFAULT_RECURRING_MONTHS - 1, start.getUTCDate()));
      if (end < start) {
        return res.status(400).json({ message: 'La date de fin doit être postérieure à la date de début' });
      }

      const occurrences = buildMonthlyOccurrences(start, end);
      const sharedData = {
        amount,
        categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
        description,
        type,
        startDate: start,
        endDate: endDate ? end : undefined,
        userId: req.user.id
      };

      const created = await prisma.expense.createManyAndReturn({
        data: occurrences.map((occurrenceDate) => ({ ...sharedData, date: occurrenceDate }))
      });

      return res.status(201).json({
        message: `${created.length} occurrence(s) créée(s)`,
        count: created.length,
        expenses: created
      });
    }

    const expense = await prisma.expense.create({
      data: {
        amount,
        date: date ? new Date(date) : undefined,
        categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
        description,
        type: type || undefined,
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
