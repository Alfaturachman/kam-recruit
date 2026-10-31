const request = require('supertest');
const app = require('../src/app');

describe('Server Health & Dashboard Monthly Stats API', () => {
  it('harus mengembalikan status 200 dan objek status sehat', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('app', 'KAM Recruit');
  });

  it('harus mengembalikan data statistik rekrutmen 12 bulan (Jan - Des) per tahun', async () => {
    const res = await request(app).get('/api/v1/dashboard/monthly-stats?year=2026');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.year).toBe(2026);
    expect(res.body.data).toHaveLength(12);
    expect(res.body.data[0]).toHaveProperty('monthShort', 'Jan');
    expect(res.body.data[11]).toHaveProperty('monthShort', 'Des');
    expect(res.body.summary).toHaveProperty('totalMasuk');
    expect(res.body.summary).toHaveProperty('totalDiterima');
  });
});
