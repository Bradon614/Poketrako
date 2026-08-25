const { PrismaClient } = require('@prisma/client');
const { isNonEmptyString } = require('../utils/validation');
const { sendError } = require('../utils/errors');

const prisma = new PrismaClient();

exports.getCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            where: { userId: req.user.id }
        });
        res.json(categories);
    } catch (error) {
        sendError(res, error);
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!isNonEmptyString(name, { maxLength: 100 })) {
            return res.status(400).json({ message: 'Le nom de la catégorie est requis (100 caractères maximum)' });
        }

        const category = await prisma.category.create({
            data: { name, userId: req.user.id }
        });
        res.status(201).json(category);
    } catch (error) {
        sendError(res, error, { status: 400, message: 'Impossible de créer la catégorie' });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!isNonEmptyString(name, { maxLength: 100 })) {
            return res.status(400).json({ message: 'Le nom de la catégorie est requis (100 caractères maximum)' });
        }

        const category = await prisma.category.updateMany({
            where: { id: parseInt(req.params.id), userId: req.user.id },
            data: { name }
        });
        if (category.count === 0) return res.status(404).json({ message: 'Catégorie non trouvée' });
        res.status(200).json({ message: 'Catégorie mise à jour' });
    } catch (error) {
        sendError(res, error, { status: 400, message: 'Impossible de mettre à jour la catégorie' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        // Check if category is used
        const expenseCount = await prisma.expense.count({
            where: { categoryId: parseInt(req.params.id) }
        });
        if (expenseCount > 0) {
            return res.status(400).json({ message: 'Impossible de supprimer une catégorie utilisée' });
        }

        const category = await prisma.category.deleteMany({
            where: { id: parseInt(req.params.id), userId: req.user.id }
        });
        if (category.count === 0) return res.status(404).json({ message: 'Catégorie non trouvée' });
        res.status(204).send();
    } catch (error) {
        sendError(res, error);
    }
};
