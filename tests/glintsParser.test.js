const { parseGlintsExcel } = require('../src/services/glintsParser');
const path = require('path');

describe('Glints Excel Parser Service', () => {
  const dummyPath = path.resolve(__dirname, '../sample_data/Data_Pelamar_Glints_Dummy.xlsx');

  it('harus mampu mem-parse berkas dummy Glints dan mengekstrak kandidat Imam Kuswoyo', async () => {
    const results = await parseGlintsExcel(dummyPath);
    
    expect(results.length).toBeGreaterThanOrEqual(8);
    const imam = results.find(c => c.fullName === 'Imam Kuswoyo');
    expect(imam).toBeDefined();
    expect(imam.age).toEqual(44);
    expect(imam.educationDegree).toEqual('SMA/SMK');
    expect(imam.expectedSalary).toEqual('Rp 3.000.000');
    expect(imam.phone).toContain('62895402875844');
    expect(imam.totalExperienceLabel).toContain('12 tahun');
  });

  it('harus menangani kandidat fresh graduate dengan sel kosong tanpa crash', async () => {
    const results = await parseGlintsExcel(dummyPath);
    const rina = results.find(c => c.fullName === 'Rina Septiani');
    expect(rina).toBeDefined();
    expect(rina.age).toEqual(21);
    expect(rina.expectedSalary).toBeNull();
    expect(rina.organizationExp).toBeNull();
  });
});

