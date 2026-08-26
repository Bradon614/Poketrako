require('dotenv').config({ path: '.env.test' });

if (!process.env.DATABASE_URL.includes('poketrako_test')) {
  throw new Error(
    'DATABASE_URL does not point at the test database (poketrako_test). ' +
    'Refusing to run tests against what looks like a real database.'
  );
}

// Belt-and-suspenders cleanup: each test file's beforeEach(resetDatabase)
// already clears state before every test, but this catches whatever the
// very last test in a file created (e.g. an uploaded file) so the real
// uploads/ folder never accumulates test fixtures between runs.
const { resetDatabase } = require('./helpers');
afterAll(resetDatabase);
