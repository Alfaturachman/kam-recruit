const { generateWaUrl } = require('../src/services/waService');
const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/database');

describe('WhatsApp Communication Module (Non-Emoji Compliance - ADR-004)', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('harus menghasilkan URL WhatsApp resmi tanpa mengandung karakter emoji apa pun', () => {
    const candidate = {
      phone: '+62895402875844',
      fullName: 'Imam Kuswoyo',
      position: 'Customer Service Rep',
      partner: 'PT Telkom Akses'
    };
    const schedule = 'Kamis, 5 November 2026 pukul 09.00 WIB';
    const url = generateWaUrl(candidate, schedule);

    expect(url).toContain('https://wa.me/62895402875844');
    expect(url).toContain('PT%20Kinarya%20Alihdaya%20Mandiri');

    // Validasi ketat bahwa tidak ada karakter emoji (Extended_Pictographic)
    const decoded = decodeURIComponent(url);
    const emojiRegex = /\p{Extended_Pictographic}/u;
    expect(emojiRegex.test(decoded)).toBeFalsy();
  });

  it('harus memperbarui status respon interview kandidat via API PUT /api/v1/candidates/:id/interview-status', async () => {
    // Dapatkan ID kandidat pertama
    const [cand] = await pool.query('SELECT id FROM candidates LIMIT 1');
    const candId = cand[0].id;

    const res = await request(app)
      .put(`/api/v1/candidates/${candId}/interview-status`)
      .send({
        statusInterview: 'Bersedia',
        interviewSchedule: 'Kamis, 5 Nov (09.00 WIB)'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.data.status_interview).toEqual('Bersedia');
  });
});

