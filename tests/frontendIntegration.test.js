const request = require('supertest');
const app = require('../src/app');

describe('Frontend Integration (Static Client Serving)', () => {
  it('harus menyajikan antarmuka pengguna pada root path GET /', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('KAM RECRUIT');
    expect(res.text).toContain('Sistem Manajemen Rekrutmen');
    expect(res.text).toContain('PT Kinarya Alihdaya Mandiri');
  });

  it('harus memuat elemen UI/UX berstandar Apple HIG tanpa badge terlipat', async () => {
    const res = await request(app).get('/');
    expect(res.text).toContain('whitespace-nowrap shrink-0');
    expect(res.text).toContain('modal-scoring');
    expect(res.text).toContain('modal-import');
  });
});
