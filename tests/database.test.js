const pool = require('../src/config/database');

describe('Database Connection Pool', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('harus berhasil mengeksekusi kueri SELECT 1 + 1 AS solution', async () => {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    expect(rows[0].solution).toEqual(2);
  });
});

