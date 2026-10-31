const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/database');

describe('Two-Stage Recapitulation Module (Single Master DB)', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('harus memfilter kandidat Tahap I berdasarkan status_sortir = Lolos Sortir', async () => {
    const res = await request(app).get('/api/v1/recapitulation/stage1');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBeTruthy();
    expect(Array.isArray(res.body.data)).toBeTruthy();
    res.body.data.forEach(c => {
      expect(c.status_sortir).toEqual('Lolos Sortir');
    });
  });

  it('harus memfilter kandidat Tahap II berdasarkan status_hrd = Lolos Seleksi HRD', async () => {
    const res = await request(app).get('/api/v1/recapitulation/stage2');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBeTruthy();
    expect(Array.isArray(res.body.data)).toBeTruthy();
    res.body.data.forEach(c => {
      expect(c.status_hrd).toEqual('Lolos Seleksi HRD');
    });
  });

  it('harus mampu mengunduh berkas rekapitulasi dalam format Excel (.xlsx)', async () => {
    const res = await request(app).get('/api/v1/recapitulation/export-excel');
    expect(res.statusCode).toEqual(200);
    expect(res.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    expect(res.headers['content-disposition']).toContain('.xlsx');
  });
});

