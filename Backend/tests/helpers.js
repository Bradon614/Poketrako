const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const request = require('supertest');
const app = require('../app');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

const prisma = new PrismaClient();

// Deleting users cascades to everything else (categories, expenses, incomes,
// receipt uploads) thanks to onDelete: Cascade on every User relation. That
// only clears the database though — uploaded files are on disk and must be
// removed separately, or the real uploads/ folder accumulates test fixtures
// across every test run.
async function resetDatabase() {
  await prisma.user.deleteMany({});
  for (const file of fs.readdirSync(UPLOAD_DIR)) {
    fs.unlinkSync(path.join(UPLOAD_DIR, file));
  }
}

async function createUser({ email = `user-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password = 'Sup3rSecret!', fullName } = {}) {
  await request(app).post('/api/auth/signup').send({ email, password, fullName });
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return { email, password, token: res.body.token };
}

function authed(token) {
  return { Authorization: `Bearer ${token}` };
}

module.exports = { app, prisma, resetDatabase, createUser, authed };
