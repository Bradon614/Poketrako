const request = require('supertest');
const { app, resetDatabase, createUser, authed } = require('./helpers');

beforeEach(resetDatabase);

describe('Categories', () => {
  it('rejects all routes without a token', async () => {
    expect((await request(app).get('/api/categories')).status).toBe(401);
    expect((await request(app).post('/api/categories').send({ name: 'x' })).status).toBe(401);
  });

  it('creates and lists a category scoped to the user', async () => {
    const { token } = await createUser();

    const create = await request(app).post('/api/categories').set(authed(token)).send({ name: 'Groceries' });
    expect(create.status).toBe(201);
    expect(create.body.name).toBe('Groceries');

    const list = await request(app).get('/api/categories').set(authed(token));
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);
  });

  it('rejects an empty name', async () => {
    const { token } = await createUser();
    const res = await request(app).post('/api/categories').set(authed(token)).send({ name: '   ' });
    expect(res.status).toBe(400);
  });

  it('rejects a duplicate name for the same user without leaking Prisma internals', async () => {
    const { token } = await createUser();
    await request(app).post('/api/categories').set(authed(token)).send({ name: 'Rent' });
    const res = await request(app).post('/api/categories').set(authed(token)).send({ name: 'Rent' });

    expect(res.status).toBe(400);
    expect(res.body.message).not.toMatch(/prisma/i);
  });

  it('allows two different users to use the same category name', async () => {
    const userA = await createUser();
    const userB = await createUser();

    const resA = await request(app).post('/api/categories').set(authed(userA.token)).send({ name: 'Travel' });
    const resB = await request(app).post('/api/categories').set(authed(userB.token)).send({ name: 'Travel' });

    expect(resA.status).toBe(201);
    expect(resB.status).toBe(201);
  });

  it('updates a category', async () => {
    const { token } = await createUser();
    const created = await request(app).post('/api/categories').set(authed(token)).send({ name: 'Old' });

    const res = await request(app).put(`/api/categories/${created.body.id}`).set(authed(token)).send({ name: 'New' });
    expect(res.status).toBe(200);

    const list = await request(app).get('/api/categories').set(authed(token));
    expect(list.body[0].name).toBe('New');
  });

  it('blocks deleting a category that is in use by an expense', async () => {
    const { token } = await createUser();
    const cat = await request(app).post('/api/categories').set(authed(token)).send({ name: 'Used' });
    await request(app).post('/api/expenses').set(authed(token)).send({ amount: 10, categoryId: cat.body.id });

    const res = await request(app).delete(`/api/categories/${cat.body.id}`).set(authed(token));
    expect(res.status).toBe(400);
  });

  it('deletes an unused category', async () => {
    const { token } = await createUser();
    const cat = await request(app).post('/api/categories').set(authed(token)).send({ name: 'Unused' });

    const res = await request(app).delete(`/api/categories/${cat.body.id}`).set(authed(token));
    expect(res.status).toBe(204);
  });

  it('does not let a user see or modify another user\'s category', async () => {
    const owner = await createUser();
    const intruder = await createUser();
    const cat = await request(app).post('/api/categories').set(authed(owner.token)).send({ name: 'Private' });

    const list = await request(app).get('/api/categories').set(authed(intruder.token));
    expect(list.body).toHaveLength(0);

    const update = await request(app).put(`/api/categories/${cat.body.id}`).set(authed(intruder.token)).send({ name: 'Hacked' });
    expect(update.status).toBe(404);
  });
});
