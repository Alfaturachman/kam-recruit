/**
 * Evaluates candidate data against vacancy criteria
 * @param {Object} candidate - Normalized candidate data from parser
 * @param {Object} vacancy - Target vacancy criteria
 * @returns {{ statusSortir: string, catatan: string }}
 */
function evaluateCandidate(candidate, vacancy) {
  const reasons = [];

  // 1. Usia kriteria
  if (vacancy.maxAge && candidate.age > vacancy.maxAge) {
    reasons.push(`Usia pelamar ${candidate.age} tahun melebihi batas maksimal kriteria (${vacancy.maxAge} tahun)`);
  }

  // 2. Jenjang pendidikan kriteria
  if (vacancy.allowedEducation && Array.isArray(vacancy.allowedEducation) && vacancy.allowedEducation.length > 0) {
    const candEdu = (candidate.educationDegree || '').toUpperCase();
    const isAllowed = vacancy.allowedEducation.some(e => candEdu.includes(e.toUpperCase()));
    if (!isAllowed) {
      reasons.push(`Pendidikan pelamar (${candidate.educationDegree}) tidak memenuhi syarat minimal (${vacancy.allowedEducation.join('/')})`);
    }
  }

  // 3. Domisili dan kesediaan relokasi
  if (vacancy.targetCity) {
    const candCity = (candidate.domicileCity || '').toLowerCase();
    const targetCity = vacancy.targetCity.toLowerCase();
    const isMatch = candCity.includes(targetCity);
    if (!isMatch && !candidate.willingToRelocate) {
      reasons.push(`Domisili pelamar (${candidate.domicileCity}) berada di luar kota penempatan (${vacancy.targetCity}) dan tidak bersedia relokasi`);
    }
  }

  if (reasons.length > 0) {
    return {
      statusSortir: 'Tidak Memenuhi Syarat',
      catatan: reasons.join('. ') + '.'
    };
  }

  return {
    statusSortir: 'Lolos Sortir',
    catatan: 'Memenuhi kualifikasi dasar mitra.'
  };
}

module.exports = {
  evaluateCandidate
};
