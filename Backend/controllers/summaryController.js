const { PrismaClient } = require('@prisma/client');
const { isValidDateString } = require('../utils/validation');
const { sendError } = require('../utils/errors');

const prisma = new PrismaClient();

exports.getMonthlySummary = async (req, res) => {
    try {
        const { month } = req.query;
        if (month !== undefined && !isValidDateString(month)) {
            return res.status(400).json({ message: "Le paramètre 'month' est invalide" });
        }

        const targetDate = month ? new Date(month) : new Date();
        const year = targetDate.getFullYear();
        const monthIndex = targetDate.getMonth();
        const startDate = new Date(year, monthIndex, 1);
        const endDate = new Date(year, monthIndex + 1, 0);

        const result = await prisma.$transaction([
            prisma.income.aggregate({
                _sum: { amount: true },
                where: { userId: req.user.id, date: { gte: startDate, lte: endDate } },
            }),
            prisma.expense.aggregate({
                _sum: { amount: true },
                where: { userId: req.user.id, date: { gte: startDate, lte: endDate } },
            }),
            prisma.user.findUnique({ where: { id: req.user.id }, select: { budget: true } }),
        ]);

        const income = Number(result[0]._sum.amount || 0);
        const expenses = Number(result[1]._sum.amount || 0);
        const budget = Number(result[2]?.budget || 0);

        res.json({
            month: `${year}-${String(monthIndex + 1).padStart(2, '0')}`,
            income,
            expenses,
            balance: income - expenses,
            budget,
        });
    } catch (error) {
        sendError(res, error);
    }
};

exports.getSummary = async (req, res) => {
    try {
        const { start, end } = req.query;
        if (!isValidDateString(start) || !isValidDateString(end)) {
            return res.status(400).json({ message: "Les paramètres 'start' et 'end' sont requis et doivent être des dates valides" });
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

        const result = await prisma.$transaction([
            prisma.income.aggregate({
                _sum: { amount: true },
                where: { userId: req.user.id, date: { gte: startDate, lte: endDate } },
            }),
            prisma.expense.aggregate({
                _sum: { amount: true },
                where: { userId: req.user.id, date: { gte: startDate, lte: endDate } },
            }),
        ]);

        const income = Number(result[0]._sum.amount || 0);
        const expenses = Number(result[1]._sum.amount || 0);

        res.json({
            startDate: start,
            endDate: end,
            income,
            expenses,
            balance: income - expenses,
        });
    } catch (error) {
        sendError(res, error);
    }
};

exports.getAlerts = async (req, res) => {
    try {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const result = await prisma.$transaction([
            prisma.income.aggregate({
                _sum: { amount: true },
                where: { userId: req.user.id, date: { gte: startDate, lte: endDate } },
            }),
            prisma.expense.aggregate({
                _sum: { amount: true },
                where: { userId: req.user.id, date: { gte: startDate, lte: endDate } },
            }),
            prisma.user.findUnique({ where: { id: req.user.id }, select: { budget: true } }),
        ]);

        const income = Number(result[0]._sum.amount || 0);
        const expenses = Number(result[1]._sum.amount || 0);
        const budget = Number(result[2]?.budget || 0);

        // A user-defined budget is a more direct signal of intent than income,
        // so it takes priority when set. Falls back to the income comparison
        // otherwise (a user who hasn't set a budget yet still gets a signal).
        if (budget > 0) {
            if (expenses > budget) {
                res.json({
                    alert: true,
                    message: `Vous avez dépassé votre budget de ce mois de ${(expenses - budget).toFixed(2)}€`,
                });
            } else {
                res.json({ alert: false, message: 'Vous êtes dans votre budget ce mois-ci.' });
            }
            return;
        }

        if (expenses > income) {
            res.json({
                alert: true,
                message: `Vous avez dépassé votre revenu de ce mois de ${(expenses - income).toFixed(2)}€`,
            });
        } else {
            res.json({ alert: false, message: 'Vos finances sont équilibrées ce mois-ci.' });
        }
    } catch (error) {
        sendError(res, error);
    }
};
