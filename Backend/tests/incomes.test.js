const request = require('supertest');
const { app, resetDatabase, createUser, authed } = require('./helpers');

beforeEach(resetDatabase);

describe('Incomes', () => {
  it('rejects all routes without a token', async () => {
    expect((await request(app).get('/api/incomes')).status).toBe(401);
  });

  it('creates an income requiring amount, date and source', async () => {
    const { token } = await createUser();
    const res = await request(app).post('/api/incomes').set(authed(token)).send({ amount: 2000, date: '2026-08-01', source: 'Salary' });

    expect(res.status).toBe(201);
    expect(res.body.source).toBe('Salary');
  });

  it('rejects a missing source', async () => {
    const { token } = await createUser();
    const res = await request(app).post('/api/incomes').set(authed(token)).send({ amount: 100, date: '2026-08-01' });
    expect(res.status).toBe(400);
  });

  it('rejects a missing date', async () => {
    const { token } = await createUser();
    const res = await request(app).post('/api/incomes').set(authed(token)).send({ amount: 100, source: 'Gift' });
    expect(res.status).toBe(400);
  });

  it('lists only the current user\'s incomes', async () => {
    const userA = await createUser();
    const userB = await createUser();
    await request(app).post('/api/incomes').set(authed(userA.token)).send({ amount: 100, date: '2026-08-01', source: 'A' });
    await request(app).post('/api/incomes').set(authed(userB.token)).send({ amount: 200, date: '2026-08-01', source: 'B' });

    const listA = await request(app).get('/api/incomes').set(authed(userA.token));
    expect(listA.body).toHaveLength(1);
    expect(listA.body[0].source).toBe('A');
  });

  it('updates and deletes an income', async () => {
    const { token } = await createUser();
    const created = await request(app).post('/api/incomes').set(authed(token)).send({ amount: 100, date: '2026-08-01', source: 'Freelance' });

    const update = await request(app).put(`/api/incomes/${created.body.id}`).set(authed(token)).send({ amount: 150 });
    expect(update.status).toBe(200);

    const del = await request(app).delete(`/api/incomes/${created.body.id}`).set(authed(token));
    expect(del.status).toBe(204);
  });
});
