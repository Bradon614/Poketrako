const request = require('supertest');
const { app, resetDatabase, createUser, authed } = require('./helpers');

beforeEach(resetDatabase);

describe('GET /api/summary/monthly', () => {
  it('aggregates income and expenses for the given month', async () => {
    const { token } = await createUser();
    await request(app).post('/api/incomes').set(authed(token)).send({ amount: 2000, date: '2026-08-01', source: 'Salary' });
    await request(app).post('/api/expenses').set(authed(token)).send({ amount: 500, date: '2026-08-15' });
    // Outside the requested month — must not be counted.
    await request(app).post('/api/expenses').set(authed(token)).send({ amount: 999, date: '2026-01-01' });

    const res = await request(app).get('/api/summary/monthly?month=2026-08').set(authed(token));

    expect(res.status).toBe(200);
    expect(res.body.income).toBe(2000);
    expect(res.body.expenses).toBe(500);
    expect(res.body.balance).toBe(1500);
  });

  it('rejects an invalid month parameter', async () => {
    const { token } = await createUser();
    const res = await request(app).get('/api/summary/monthly?month=not-a-date').set(authed(token));
    expect(res.status).toBe(400);
  });
});

describe('GET /api/summary/alerts', () => {
  it('falls back to comparing expenses against income when no budget is set', async () => {
    const { token } = await createUser();
    const now = new Date().toISOString().slice(0, 10);
    await request(app).post('/api/incomes').set(authed(token)).send({ amount: 100, date: now, source: 'Job' });
    await request(app).post('/api/expenses').set(authed(token)).send({ amount: 150, date: now });

    const res = await request(app).get('/api/summary/alerts').set(authed(token));

    expect(res.body.alert).toBe(true);
    expect(res.body.message).toMatch(/revenu/i);
  });

  it('prioritizes the user-set budget over the income comparison', async () => {
    const { token } = await createUser();
    const now = new Date().toISOString().slice(0, 10);
    await request(app).put('/api/auth/budget').set(authed(token)).send({ budget: 100 });
    // Income is high enough that the old income-based check would say "fine".
    await request(app).post('/api/incomes').set(authed(token)).send({ amount: 5000, date: now, source: 'Job' });
    await request(app).post('/api/expenses').set(authed(token)).send({ amount: 150, date: now });

    const res = await request(app).get('/api/summary/alerts').set(authed(token));

    expect(res.body.alert).toBe(true);
    expect(res.body.message).toMatch(/budget/i);
  });

  it('reports no alert when under budget', async () => {
    const { token } = await createUser();
    const now = new Date().toISOString().slice(0, 10);
    await request(app).put('/api/auth/budget').set(authed(token)).send({ budget: 1000 });
    await request(app).post('/api/expenses').set(authed(token)).send({ amount: 150, date: now });

    const res = await request(app).get('/api/summary/alerts').set(authed(token));
    expect(res.body.alert).toBe(false);
  });
});
