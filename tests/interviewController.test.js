const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/database');

describe('HRD Interview Assessment (Dropdown Decision - ADR-007)', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('harus berhasil memperbarui status ke Lolos Seleksi HRD dan mencatat audit log', async () => {
    const [cand] = await pool.query('SELECT id FROM candidates LIMIT 1');
    const candId = cand[0].id;

    const res = await request(app)
      .put(`/api/v1/candidates/${candId}/hrd-assessment`)
      .send({
        decision: 'Lolos Seleksi HRD',
        evaluatorName: 'HRD Lead Recruiter',
        notes: 'Komunikasi sangat lugas, menguasai penanganan komplain pelanggan, siap kerja shift.'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.data.status_hrd).toEqual('Lolos Seleksi HRD');

    // Pastikan audit log tercatat di database
    const [audit] = await pool.query('SELECT * FROM audit_logs WHERE candidate_id = ? ORDER BY id DESC LIMIT 1', [candId]);
    expect(audit.length).toEqual(1);
    expect(audit[0].action_type).toEqual('HRD_INTERVIEW_ASSESSMENT');
  });

  it('harus menolak input yang memuat nilai skor pembobotan numerik usang', async () => {
    const [cand] = await pool.query('SELECT id FROM candidates LIMIT 1');
    const candId = cand[0].id;

    const res = await request(app)
      .put(`/api/v1/candidates/${candId}/hrd-assessment`)
      .send({ numericScore: 85 });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBeFalsy();
    expect(res.body.message).toContain('Dropdown');
  });
});

