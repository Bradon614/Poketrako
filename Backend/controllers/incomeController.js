const { PrismaClient } = require('@prisma/client');
const { isPositiveNumber, isNonEmptyString, isValidDateString } = require('../utils/validation');
const { sendError } = require('../utils/errors');

const prisma = new PrismaClient();

function validateIncomeFields(body, { requireAll }) {
  if (requireAll || body.amount !== undefined) {
    if (!isPositiveNumber(body.amount)) return 'Le montant doit être un nombre positif';
  }
  if (requireAll || body.date !== undefined) {
    if (!isValidDateString(body.date)) return 'Date invalide';
  }
  if (requireAll || body.source !== undefined) {
    if (!isNonEmptyString(body.source)) return 'La source est requise';
  }
  return null;
}

exports.getIncomes = async (req, res) => {
    try {
        const { start, end, _sort, _limit } = req.query;
        const where = { userId: req.user.id };
        if (start) where.date = { gte: new Date(start) };
        if (end) where.date = { ...where.date, lte: new Date(end) };

        const options = { where };
        if (_limit) options.take = parseInt(_limit, 10);
        if (_sort) {
            const [field, order] = _sort.split(':');
            options.orderBy = { [field]: order.toLowerCase() };
        }

        const incomes = await prisma.income.findMany(options);
        res.json(incomes);
    } catch (error) {
        sendError(res, error);
    }
};

exports.getIncome = async (req, res) => {
    try {
        const income = await prisma.income.findFirst({
            where: { id: parseInt(req.params.id), userId: req.user.id }
        });
        if (!income) return res.status(404).json({ message: 'Revenu non trouvé' });
        res.json(income);
    } catch (error) {
        sendError(res, error);
    }
};

exports.createIncome = async (req, res) => {
    try {
        const validationError = validateIncomeFields(req.body, { requireAll: true });
        if (validationError) return res.status(400).json({ message: validationError });

        const { amount, date, source, description } = req.body;
        const income = await prisma.income.create({
            data: { amount, date: new Date(date), source, description, userId: req.user.id }
        });
        res.status(201).json(income);
    } catch (error) {
        sendError(res, error, { status: 400, message: 'Impossible de créer le revenu' });
    }
};

exports.updateIncome = async (req, res) => {
    try {
        const validationError = validateIncomeFields(req.body, { requireAll: false });
        if (validationError) return res.status(400).json({ message: validationError });

        const { amount, date, source, description } = req.body;
        const income = await prisma.income.updateMany({
            where: { id: parseInt(req.params.id), userId: req.user.id },
            data: { amount, date: date ? new Date(date) : undefined, source, description }
        });
        if (income.count === 0) return res.status(404).json({ message: 'Revenu non trouvé' });
        res.status(200).json({ message: 'Revenu mis à jour' });
    } catch (error) {
        sendError(res, error, { status: 400, message: 'Impossible de mettre à jour le revenu' });
    }
};

exports.deleteIncome = async (req, res) => {
    try {
        const income = await prisma.income.deleteMany({
            where: { id: parseInt(req.params.id), userId: req.user.id }
        });
        if (income.count === 0) return res.status(404).json({ message: 'Revenu non trouvé' });
        res.status(204).send();
    } catch (error) {
        sendError(res, error);
    }
};
