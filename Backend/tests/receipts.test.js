const fs = require('fs');
const path = require('path');
const request = require('supertest');
const { app, resetDatabase, createUser, authed } = require('./helpers');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

beforeEach(resetDatabase);

describe('Receipts', () => {
  it('uploads a receipt and links it to the expense', async () => {
    const { token } = await createUser();
    const expense = await request(app).post('/api/expenses').set(authed(token)).send({ amount: 30, date: '2026-08-15' });

    const res = await request(app)
      .post(`/api/expenses/${expense.body.id}/receipt`)
      .set(authed(token))
      .attach('receipt', Buffer.from('%PDF-1.4 fake'), { filename: 'receipt.pdf', contentType: 'application/pdf' });

    expect(res.status).toBe(201);
    expect(fs.existsSync(path.join(UPLOAD_DIR, res.body.filename))).toBe(true);

    const getExpense = await request(app).get(`/api/expenses/${expense.body.id}`).set(authed(token));
    expect(getExpense.body.receiptUpload.id).toBe(res.body.id);
  });

  it('rejects a disallowed file type', async () => {
    const { token } = await createUser();
    const expense = await request(app).post('/api/expenses').set(authed(token)).send({ amount: 30 });

    const res = await request(app)
      .post(`/api/expenses/${expense.body.id}/receipt`)
      .set(authed(token))
      .attach('receipt', Buffer.from('hello'), { filename: 'notes.txt', contentType: 'text/plain' });

    expect(res.status).toBe(400);
  });

  it('rejects uploading to another user\'s expense', async () => {
    const owner = await createUser();
    const intruder = await createUser();
    const expense = await request(app).post('/api/expenses').set(authed(owner.token)).send({ amount: 30 });

    const res = await request(app)
      .post(`/api/expenses/${expense.body.id}/receipt`)
      .set(authed(intruder.token))
      .attach('receipt', Buffer.from('%PDF-1.4 fake'), { filename: 'receipt.pdf', contentType: 'application/pdf' });

    expect(res.status).toBe(404);
  });

  it('replacing a receipt deletes the old file from disk', async () => {
    const { token } = await createUser();
    const expense = await request(app).post('/api/expenses').set(authed(token)).send({ amount: 30 });

    const first = await request(app)
      .post(`/api/expenses/${expense.body.id}/receipt`)
      .set(authed(token))
      .attach('receipt', Buffer.from('%PDF-1.4 v1'), { filename: 'v1.pdf', contentType: 'application/pdf' });
    const firstPath = path.join(UPLOAD_DIR, first.body.filename);
    expect(fs.existsSync(firstPath)).toBe(true);

    await request(app)
      .post(`/api/expenses/${expense.body.id}/receipt`)
      .set(authed(token))
      .attach('receipt', Buffer.from('%PDF-1.4 v2'), { filename: 'v2.pdf', contentType: 'application/pdf' });

    expect(fs.existsSync(firstPath)).toBe(false);
  });

  it('deletes a receipt, its file, and unlinks it from the expense', async () => {
    const { token } = await createUser();
    const expense = await request(app).post('/api/expenses').set(authed(token)).send({ amount: 30 });
    const uploaded = await request(app)
      .post(`/api/expenses/${expense.body.id}/receipt`)
      .set(authed(token))
      .attach('receipt', Buffer.from('%PDF-1.4 fake'), { filename: 'receipt.pdf', contentType: 'application/pdf' });
    const filePath = path.join(UPLOAD_DIR, uploaded.body.filename);

    const del = await request(app).delete(`/api/expenses/${expense.body.id}/receipt`).set(authed(token));
    expect(del.status).toBe(204);
    expect(fs.existsSync(filePath)).toBe(false);

    const getExpense = await request(app).get(`/api/expenses/${expense.body.id}`).set(authed(token));
    expect(getExpense.body.receiptUploadId).toBeNull();
  });

  it('returns 404 when deleting a receipt that does not exist', async () => {
    const { token } = await createUser();
    const expense = await request(app).post('/api/expenses').set(authed(token)).send({ amount: 30 });

    const res = await request(app).delete(`/api/expenses/${expense.body.id}/receipt`).set(authed(token));
    expect(res.status).toBe(404);
  });
});
