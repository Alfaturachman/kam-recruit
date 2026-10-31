const { evaluateCandidate } = require('../src/services/screeningEngine');

describe('Automated Qualification Screening Engine', () => {
  const vacancyCriteria = {
    maxAge: 27,
    allowedEducation: ['D3', 'S1'],
    targetCity: 'Semarang'
  };

  it('harus menandai Tidak Memenuhi Syarat jika usia melampaui batas kriteria', () => {
    const candidate = {
      age: 44,
      educationDegree: 'SMA/SMK',
      domicileCity: 'Semarang'
    };
    const res = evaluateCandidate(candidate, vacancyCriteria);
    expect(res.statusSortir).toEqual('Tidak Memenuhi Syarat');
    expect(res.catatan).toContain('Usia');
  });

  it('harus menandai Lolos Sortir jika seluruh kriteria kualifikasi terpenuhi', () => {
    const candidate = {
      age: 23,
      educationDegree: 'S1',
      domicileCity: 'Semarang'
    };
    const res = evaluateCandidate(candidate, vacancyCriteria);
    expect(res.statusSortir).toEqual('Lolos Sortir');
    expect(res.catatan).toContain('Memenuhi kualifikasi');
  });

  it('harus menandai Tidak Memenuhi Syarat jika domisili berbeda dan tidak bersedia relokasi', () => {
    const candidate = {
      age: 24,
      educationDegree: 'S1',
      domicileCity: 'Surabaya',
      willingToRelocate: false
    };
    const res = evaluateCandidate(candidate, vacancyCriteria);
    expect(res.statusSortir).toEqual('Tidak Memenuhi Syarat');
    expect(res.catatan).toContain('Domisili');
  });
});

