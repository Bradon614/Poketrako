const request = require('supertest');
const { app, resetDatabase, createUser, authed } = require('./helpers');

beforeEach(resetDatabase);

describe('Expenses', () => {
  it('rejects all routes without a token', async () => {
    expect((await request(app).get('/api/expenses')).status).toBe(401);
  });

  it('creates a one-time expense', async () => {
    const { token } = await createUser();
    const res = await request(app).post('/api/expenses').set(authed(token)).send({ amount: 42.5, date: '2026-08-20', description: 'Groceries' });

    expect(res.status).toBe(201);
    expect(res.body.amount).toBe('42.5');
    expect(res.body.type).toBe('ONE_TIME');
  });

  it('rejects a non-positive amount', async () => {
    const { token } = await createUser();
    const res = await request(app).post('/api/expenses').set(authed(token)).send({ amount: -5 });
    expect(res.status).toBe(400);
  });

  it('rejects an invalid categoryId reference without leaking Prisma internals', async () => {
    const { token } = await createUser();
    const res = await request(app).post('/api/expenses').set(authed(token)).send({ amount: 10, categoryId: 999999 });

    expect(res.status).toBe(400);
    expect(res.body.message).not.toMatch(/prisma/i);
  });

  it('lists only the current user\'s expenses', async () => {
    const userA = await createUser();
    const userB = await createUser();
    await request(app).post('/api/expenses').set(authed(userA.token)).send({ amount: 10 });
    await request(app).post('/api/expenses').set(authed(userB.token)).send({ amount: 20 });

    const listA = await request(app).get('/api/expenses').set(authed(userA.token));
    expect(listA.body).toHaveLength(1);
    expect(listA.body[0].amount).toBe('10');
  });

  it('updates and deletes an expense', async () => {
    const { token } = await createUser();
    const created = await request(app).post('/api/expenses').set(authed(token)).send({ amount: 10 });

    const update = await request(app).put(`/api/expenses/${created.body.id}`).set(authed(token)).send({ amount: 15 });
    expect(update.status).toBe(200);

    const del = await request(app).delete(`/api/expenses/${created.body.id}`).set(authed(token));
    expect(del.status).toBe(204);

    const get = await request(app).get(`/api/expenses/${created.body.id}`).set(authed(token));
    expect(get.status).toBe(404);
  });

  describe('recurring expenses', () => {
    it('requires a startDate', async () => {
      const { token } = await createUser();
      const res = await request(app).post('/api/expenses').set(authed(token)).send({ amount: 10, type: 'RECURRING' });
      expect(res.status).toBe(400);
    });

    it('rejects an endDate before startDate', async () => {
      const { token } = await createUser();
      const res = await request(app).post('/api/expenses').set(authed(token))
        .send({ amount: 10, type: 'RECURRING', startDate: '2026-06-01', endDate: '2026-01-01' });
      expect(res.status).toBe(400);
    });

    it('generates exactly 12 monthly occurrences with a default horizon, clamped to short months', async () => {
      const { token } = await createUser();
      const res = await request(app).post('/api/expenses').set(authed(token))
        .send({ amount: 15, type: 'RECURRING', startDate: '2026-01-31' });

      expect(res.status).toBe(201);
      expect(res.body.count).toBe(12);
      const days = res.body.expenses.map((e) => e.date.slice(0, 10));
      expect(days).toEqual([
        '2026-01-31', '2026-02-28', '2026-03-31', '2026-04-30',
        '2026-05-31', '2026-06-30', '2026-07-31', '2026-08-31',
        '2026-09-30', '2026-10-31', '2026-11-30', '2026-12-31'
      ]);
    });

    it('generates exactly the occurrences between an explicit startDate and endDate', async () => {
      const { token } = await createUser();
      const res = await request(app).post('/api/expenses').set(authed(token))
        .send({ amount: 10, type: 'RECURRING', startDate: '2026-03-15', endDate: '2026-05-15' });

      expect(res.body.count).toBe(3);
    });

    it('every occurrence is a real row that shows up in the expense list', async () => {
      const { token } = await createUser();
      await request(app).post('/api/expenses').set(authed(token))
        .send({ amount: 10, type: 'RECURRING', startDate: '2026-03-15', endDate: '2026-05-15' });

      const list = await request(app).get('/api/expenses?type=RECURRING').set(authed(token));
      expect(list.body).toHaveLength(3);
    });
  });
});
