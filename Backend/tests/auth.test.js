const request = require('supertest');
const { app, resetDatabase } = require('./helpers');

beforeEach(resetDatabase);

describe('POST /api/auth/signup', () => {
  it('creates a user with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'alice@example.com', password: 'Sup3rSecret!' });

    expect(res.status).toBe(201);
    expect(res.body.userId).toBeTypeOf('number');
  });

  it('rejects an invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'not-an-email', password: 'Sup3rSecret!' });

    expect(res.status).toBe(400);
  });

  it('rejects a password under 8 characters', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'bob@example.com', password: 'short' });

    expect(res.status).toBe(400);
  });

  it('rejects a duplicate email', async () => {
    await request(app).post('/api/auth/signup').send({ email: 'dup@example.com', password: 'Sup3rSecret!' });
    const res = await request(app).post('/api/auth/signup').send({ email: 'dup@example.com', password: 'Sup3rSecret!' });

    expect(res.status).toBe(400);
  });

  it('never echoes the password back in the response', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'nopw@example.com', password: 'Sup3rSecret!' });

    expect(JSON.stringify(res.body)).not.toContain('Sup3rSecret!');
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with correct credentials', async () => {
    await request(app).post('/api/auth/signup').send({ email: 'carol@example.com', password: 'Sup3rSecret!' });
    const res = await request(app).post('/api/auth/login').send({ email: 'carol@example.com', password: 'Sup3rSecret!' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTypeOf('string');
  });

  it('rejects a wrong password', async () => {
    await request(app).post('/api/auth/signup').send({ email: 'dave@example.com', password: 'Sup3rSecret!' });
    const res = await request(app).post('/api/auth/login').send({ email: 'dave@example.com', password: 'WrongPassword!' });

    expect(res.status).toBe(401);
  });

  it('rejects a nonexistent user', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'ghost@example.com', password: 'Sup3rSecret!' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('rejects a request with no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects a garbage token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });

  it('returns the current user for a valid token', async () => {
    await request(app).post('/api/auth/signup').send({ email: 'erin@example.com', password: 'Sup3rSecret!' });
    const login = await request(app).post('/api/auth/login').send({ email: 'erin@example.com', password: 'Sup3rSecret!' });

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${login.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('erin@example.com');
    expect(res.body.budget).toBe(0);
  });
});

describe('PUT /api/auth/currency', () => {
  it('rejects an unsupported currency', async () => {
    await request(app).post('/api/auth/signup').send({ email: 'henry@example.com', password: 'Sup3rSecret!' });
    const login = await request(app).post('/api/auth/login').send({ email: 'henry@example.com', password: 'Sup3rSecret!' });

    const res = await request(app)
      .put('/api/auth/currency')
      .set('Authorization', `Bearer ${login.body.token}`)
      .send({ currency: 'XYZ' });

    expect(res.status).toBe(400);
  });

  it('defaults new users to MGA and allows switching to a supported currency', async () => {
    await request(app).post('/api/auth/signup').send({ email: 'iris@example.com', password: 'Sup3rSecret!' });
    const login = await request(app).post('/api/auth/login').send({ email: 'iris@example.com', password: 'Sup3rSecret!' });
    const token = login.body.token;

    const meRes = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(meRes.body.currency).toBe('MGA');

    const putRes = await request(app).put('/api/auth/currency').set('Authorization', `Bearer ${token}`).send({ currency: 'EUR' });
    expect(putRes.status).toBe(200);
    expect(putRes.body.currency).toBe('EUR');

    const meAfter = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(meAfter.body.currency).toBe('EUR');
  });
});

describe('PUT /api/auth/budget', () => {
  it('rejects a negative budget', async () => {
    await request(app).post('/api/auth/signup').send({ email: 'frank@example.com', password: 'Sup3rSecret!' });
    const login = await request(app).post('/api/auth/login').send({ email: 'frank@example.com', password: 'Sup3rSecret!' });

    const res = await request(app)
      .put('/api/auth/budget')
      .set('Authorization', `Bearer ${login.body.token}`)
      .send({ budget: -10 });

    expect(res.status).toBe(400);
  });

  it('sets a valid budget and reflects it in /me', async () => {
    await request(app).post('/api/auth/signup').send({ email: 'grace@example.com', password: 'Sup3rSecret!' });
    const login = await request(app).post('/api/auth/login').send({ email: 'grace@example.com', password: 'Sup3rSecret!' });
    const token = login.body.token;

    const putRes = await request(app).put('/api/auth/budget').set('Authorization', `Bearer ${token}`).send({ budget: 500 });
    expect(putRes.status).toBe(200);
    expect(putRes.body.budget).toBe(500);

    const meRes = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(meRes.body.budget).toBe(500);
  });
});
