const request = require('supertest');
const path = require('path');
const app = require('../src/app');
const pool = require('../src/config/database');

describe('Applicant API Endpoints', () => {
  afterAll(async () => {
    await pool.end();
  });

  const dummyPath = path.resolve(__dirname, '../sample_data/Data_Pelamar_Glints_Dummy.xlsx');

  it('harus berhasil mengimpor berkas Excel Glints dan mengembalikan jumlah data yang disortir', async () => {
    const res = await request(app)
      .post('/api/v1/applicants/import')
      .field('vacancy_id', 1)
      .attach('file', dummyPath);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.count).toBeGreaterThanOrEqual(8);
  });

  it('harus mengambil daftar pelamar dengan query GET /api/v1/applicants', async () => {
    const res = await request(app).get('/api/v1/applicants');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBeTruthy();
    expect(Array.isArray(res.body.data)).toBeTruthy();

    const imam = res.body.data.find(c => c.full_name === 'Imam Kuswoyo');
    expect(imam).toBeDefined();
    // Imam berusia 44 tahun melamar ke posisi kriteria max age 27 tahun
    expect(imam.status_sortir).toEqual('Tidak Memenuhi Syarat');
  });

  it('harus mengambil detail pelamar tertentu dengan ID', async () => {
    const listRes = await request(app).get('/api/v1/applicants');
    const firstCand = listRes.body.data[0];

    const res = await request(app).get(`/api/v1/applicants/${firstCand.id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.data.id).toEqual(firstCand.id);
    expect(Array.isArray(res.body.data.experiences)).toBeTruthy();
  });

  it('harus berhasil meloloskan dan membatalkan lolos sortir pelamar', async () => {
    const listRes = await request(app).get('/api/v1/applicants');
    const cand = listRes.body.data[0];

    // Loloskan
    const approveRes = await request(app)
      .post('/api/v1/applicants/bulk-sortir')
      .send({ candidate_ids: [cand.id], status_sortir: 'Lolos Sortir' });
    expect(approveRes.statusCode).toEqual(200);
    expect(approveRes.body.success).toBe(true);

    const checkApprove = await request(app).get(`/api/v1/applicants/${cand.id}`);
    expect(checkApprove.body.data.status_sortir).toEqual('Lolos Sortir');

    // Batalkan lolos sortir ke Belum Disortir
    const cancelRes = await request(app)
      .post('/api/v1/applicants/bulk-sortir')
      .send({ candidate_ids: [cand.id], status_sortir: 'Belum Disortir' });
    expect(cancelRes.statusCode).toEqual(200);
    expect(cancelRes.body.success).toBe(true);

    const checkCancel = await request(app).get(`/api/v1/applicants/${cand.id}`);
    expect(checkCancel.body.data.status_sortir).toEqual('Belum Disortir');
    expect(checkCancel.body.data.status_interview).toEqual('Belum Dihubungi');
  });
});

