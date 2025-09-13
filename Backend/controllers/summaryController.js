const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getMonthlySummary = async (req, res) => {
    try {
        const { month } = req.query;
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
        ]);

        const income = result[0]._sum.amount || 0;
        const expenses = result[1]._sum.amount || 0;

        res.json({
            month: `${year}-${String(monthIndex + 1).padStart(2, '0')}`,
            income,
            expenses,
            balance: income - expenses,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSummary = async (req, res) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) return res.status(400).json({ error: "Les paramètres 'start' et 'end' sont requis" });

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

        const income = result[0]._sum.amount || 0;
        const expenses = result[1]._sum.amount || 0;

        res.json({
            startDate: start,
            endDate: end,
            income,
            expenses,
            balance: income - expenses,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
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
        ]);

        const income = result[0]._sum.amount || 0;
        const expenses = result[1]._sum.amount || 0;

        if (expenses > income) {
            res.json({
                alert: true,
                message: `Vous avez dépassé votre revenu de ce mois de ${(expenses - income).toFixed(2)}€`,
            });
        } else {
            res.json({ alert: false, message: 'Vos finances sont équilibrées ce mois-ci.' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
