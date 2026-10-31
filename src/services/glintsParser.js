const ExcelJS = require('exceljs');

/**
 * Clean cell value to plain string, number, or null
 */
function cleanCellValue(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'object') {
    if (val.text) return String(val.text).trim() || null;
    if (val.result) return String(val.result).trim() || null;
    if (val.richText) return val.richText.map(r => r.text).join('').trim() || null;
    if (val instanceof Date) return val.toISOString().split('T')[0];
  }
  const str = String(val).trim();
  return str.length > 0 ? str : null;
}

/**
 * Parse 28 columns from Glints Applicant Excel export
 * @param {string} filePath - Absolute or relative path to .xlsx / .csv
 * @returns {Promise<Array<Object>>}
 */
async function parseGlintsExcel(filePath) {
  const workbook = new ExcelJS.Workbook();
  const ext = filePath.split('.').pop().toLowerCase();

  if (ext === 'csv') {
    await workbook.csv.readFile(filePath);
  } else {
    await workbook.xlsx.readFile(filePath);
  }

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('Lembar kerja kosong atau tidak ditemukan pada berkas Excel.');
  }

  const candidates = [];

  // Baris 1 adalah header, data dimulai baris 2
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const glintsId = cleanCellValue(row.getCell(1).value);
    const fullName = cleanCellValue(row.getCell(5).value);
    if (!glintsId && !fullName) return; // Lewati baris kosong

    const ageRaw = cleanCellValue(row.getCell(8).value);
    let age = 0;
    if (ageRaw) {
      const match = String(ageRaw).match(/\d+/);
      age = match ? parseInt(match[0], 10) : 0;
    }

    const gpaRaw = cleanCellValue(row.getCell(17).value);
    let gpa = null;
    if (gpaRaw) {
      const num = parseFloat(String(gpaRaw).replace(',', '.'));
      if (!isNaN(num)) gpa = num;
    }

    const relocateVal = cleanCellValue(row.getCell(12).value);
    const willingToRelocate = (relocateVal && (relocateVal.toLowerCase().includes('ya') || relocateVal.toLowerCase().includes('yes'))) ? true : false;

    // Structured screening answers JSON
    const screeningAnswers = {
      yearsInField: cleanCellValue(row.getCell(25).value),
      canStartImmediately: cleanCellValue(row.getCell(26).value)
    };

    const candidateData = {
      glintsApplicantId: glintsId,
      appliedAt: cleanCellValue(row.getCell(2).value),
      appliedPosition: cleanCellValue(row.getCell(3).value),
      targetPartner: cleanCellValue(row.getCell(4).value),
      fullName: fullName,
      phone: cleanCellValue(row.getCell(6).value) || '-',
      email: cleanCellValue(row.getCell(7).value) || '-',
      age: age,
      gender: cleanCellValue(row.getCell(9).value),
      domicileCity: cleanCellValue(row.getCell(10).value) || 'Semarang',
      locationDetail: cleanCellValue(row.getCell(11).value),
      willingToRelocate: willingToRelocate,
      expectedSalary: cleanCellValue(row.getCell(13).value),
      educationDegree: cleanCellValue(row.getCell(14).value) || 'SMA/SMK',
      studyMajor: cleanCellValue(row.getCell(15).value),
      campusName: cleanCellValue(row.getCell(16).value) || '-',
      gpa: gpa,
      totalExperienceLabel: cleanCellValue(row.getCell(18).value),
      lastExperience: cleanCellValue(row.getCell(19).value),
      pastExperience: cleanCellValue(row.getCell(20).value),
      skillsText: cleanCellValue(row.getCell(21).value),
      jobPreferences: cleanCellValue(row.getCell(22).value),
      aboutMe: cleanCellValue(row.getCell(23).value),
      organizationExp: cleanCellValue(row.getCell(24).value),
      screeningAnswers: screeningAnswers,
      glintsProfileUrl: cleanCellValue(row.getCell(27).value),
      resumeFileUrl: cleanCellValue(row.getCell(28).value)
    };

    candidates.push(candidateData);
  });

  return candidates;
}

module.exports = {
  parseGlintsExcel
};

