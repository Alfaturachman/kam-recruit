/**
 * Normalizes phone number to standard international format 628xxx
 * @param {string} phone
 * @returns {string}
 */
function normalizePhone(phone) {
  if (!phone) return '';
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    clean = '62' + clean.slice(1);
  }
  return clean;
}

/**
 * Generates WhatsApp Web link with formal non-emoji text (ADR-004)
 * @param {Object} candidate
 * @param {string} schedule
 * @returns {string}
 */
function generateWaUrl(candidate, schedule) {
  const cleanPhone = normalizePhone(candidate.phone);
  const fullName = candidate.fullName || candidate.full_name || 'Pelamar';
  const position = candidate.position || candidate.position_title || 'Customer Service Rep';
  const schedText = schedule || 'Akan diinformasikan lebih lanjut';

  const message = [
    `Selamat Pagi/Siang Sdr/i ${fullName},`,
    '',
    `Kami dari Tim Recruitment PT Kinarya Alihdaya Mandiri (PT KAM) menginformasikan bahwa berkas lamaran Anda untuk posisi ${position} telah lolos tahap seleksi berkas administratif.`,
    '',
    'Sehubungan dengan hal tersebut, kami mengundang Anda untuk mengikuti sesi Wawancara HRD pada:',
    `Jadwal: ${schedText}`,
    'Tempat/Media: Kantor Operasional PT KAM Semarang / Google Meet',
    '',
    'Mohon konfirmasi kesediaan kehadiran Anda dengan membalas pesan resmi ini dengan format:',
    '1. Bersedia Hadir',
    '2. Menolak / Mengundurkan Diri',
    '3. Mohon Penyesuaian Jadwal (Reschedule)',
    '',
    'Terima kasih atas perhatian dan kerja sama Anda.',
    '',
    'Hormat kami,',
    'Tim Recruitment PT Kinarya Alihdaya Mandiri'
  ].join('\n');

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

module.exports = {
  normalizePhone,
  generateWaUrl
};

