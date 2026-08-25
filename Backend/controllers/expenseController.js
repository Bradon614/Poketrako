const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
    res.status(500).json({ error: error.message });
  }
};

exports.getExpense = async (req, res) => {
  try {
    const expense = await prisma.expense.findFirst({
      where: { id: parseInt(req.params.id, 10), userId: req.user.id },
      include: { category: true, receiptUpload: true }
    });
    if (!expense) return res.status(404).json({ error: 'Dépense non trouvée' });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const { amount, date, categoryId, description, type, startDate, endDate } = req.body;
    if (!amount) return res.status(400).json({ error: 'Le montant est requis' });

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
    res.status(400).json({ error: error.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
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
    if (expense.count === 0) return res.status(404).json({ error: 'Dépense non trouvée' });
    res.status(200).json({ message: 'Dépense mise à jour' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await prisma.expense.deleteMany({
      where: { id: parseInt(req.params.id, 10), userId: req.user.id }
    });
    if (expense.count === 0) return res.status(404).json({ error: 'Dépense non trouvée' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
