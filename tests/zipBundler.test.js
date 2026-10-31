const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/database');

describe('Handover & ZIP Bundle Module', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('harus mengembalikan header Content-Type application/zip pada GET /api/v1/handover/bundle-zip', async () => {
    const res = await request(app).get('/api/v1/handover/bundle-zip?vacancy_id=1');
    expect(res.statusCode).toEqual(200);
    expect(res.headers['content-type']).toContain('application/zip');
    expect(res.headers['content-disposition']).toContain('.zip');
  });

  it('harus menandai kandidat telah diserahkan ke mitra pada POST /api/v1/handover/submit-to-partner', async () => {
    const [cand] = await pool.query('SELECT id FROM candidates WHERE status_hrd = "Lolos Seleksi HRD" LIMIT 1');
    const candId = cand.length > 0 ? cand[0].id : 1;

    const res = await request(app)
      .post('/api/v1/handover/submit-to-partner')
      .send({
        candidate_ids: [candId],
        partner_name: 'PT Telkom Akses',
        notes: 'Penyerahan berkas batch 1 via email resmi'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.data.submitted_count).toEqual(1);
  });
});

