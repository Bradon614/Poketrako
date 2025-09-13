const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            where: { userId: req.user.id }
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const category = await prisma.category.create({
            data: { name, userId: req.user.id }
        });
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const category = await prisma.category.updateMany({
            where: { id: parseInt(req.params.id), userId: req.user.id },
            data: { name }
        });
        if (category.count === 0) return res.status(404).json({ error: 'Catégorie non trouvée' });
        res.status(200).json({ message: 'Catégorie mise à jour' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        // Check if category is used
        const expenseCount = await prisma.expense.count({
            where: { categoryId: parseInt(req.params.id) }
        });
        if (expenseCount > 0) {
            return res.status(400).json({ error: 'Impossible de supprimer une catégorie utilisée' });
        }

        const category = await prisma.category.deleteMany({
            where: { id: parseInt(req.params.id), userId: req.user.id }
        });
        if (category.count === 0) return res.status(404).json({ error: 'Catégorie non trouvée' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
