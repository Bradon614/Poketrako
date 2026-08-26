const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const upload = require('../middleware/upload');
const { sendError } = require('../utils/errors');

const prisma = new PrismaClient();
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// Wraps multer's callback-style middleware so file-too-large / wrong-type
// errors become a normal 400 response instead of falling through to the
// generic 500 handler in server.js.
function runUpload(req, res) {
  return new Promise((resolve, reject) => {
    upload(req, res, (err) => {
      if (err) {
        err.status = 400;
        return reject(err);
      }
      resolve();
    });
  });
}

exports.uploadReceipt = async (req, res) => {
  try {
    const expenseId = parseInt(req.params.id, 10);
    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, userId: req.user.id }
    });
    if (!expense) return res.status(404).json({ message: 'Dépense non trouvée' });

    try {
      await runUpload(req, res);
    } catch (err) {
      return res.status(400).json({ message: err.message || 'Fichier invalide' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier reçu (champ "receipt" requis)' });
    }

    // Replacing an existing receipt: delete the old file so uploads/ doesn't
    // accumulate orphaned files every time a user re-uploads.
    if (expense.receiptUploadId) {
      const previous = await prisma.receiptUpload.findUnique({ where: { id: expense.receiptUploadId } });
      if (previous) {
        fs.unlink(path.join(UPLOAD_DIR, previous.filename), () => {});
        await prisma.receiptUpload.delete({ where: { id: previous.id } });
      }
    }

    const receipt = await prisma.receiptUpload.create({
      data: {
        filename: req.file.filename,
        url: `/uploads/${req.file.filename}`,
        contentType: req.file.mimetype,
        size: req.file.size,
        userId: req.user.id
      }
    });

    await prisma.expense.update({
      where: { id: expenseId },
      data: { receiptUploadId: receipt.id }
    });

    res.status(201).json(receipt);
  } catch (error) {
    sendError(res, error, { status: 400, message: 'Impossible d\'enregistrer le justificatif' });
  }
};

exports.deleteReceipt = async (req, res) => {
  try {
    const expenseId = parseInt(req.params.id, 10);
    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, userId: req.user.id }
    });
    if (!expense) return res.status(404).json({ message: 'Dépense non trouvée' });
    if (!expense.receiptUploadId) return res.status(404).json({ message: 'Aucun justificatif pour cette dépense' });

    const receipt = await prisma.receiptUpload.findUnique({ where: { id: expense.receiptUploadId } });

    await prisma.expense.update({
      where: { id: expenseId },
      data: { receiptUploadId: null }
    });

    if (receipt) {
      fs.unlink(path.join(UPLOAD_DIR, receipt.filename), () => {});
      await prisma.receiptUpload.delete({ where: { id: receipt.id } });
    }

    res.status(204).send();
  } catch (error) {
    sendError(res, error);
  }
};
