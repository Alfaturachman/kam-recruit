const archiver = require('archiver');
const path = require('path');
const fs = require('fs');

/**
 * Streams candidate CVs and Dossier summaries into a ZIP archive
 * @param {Array<Object>} candidates - List of candidates who passed HRD selection
 * @param {Object} vacancy - Vacancy / Partner information
 * @param {import('express').Response} res - Express response stream
 */
async function streamZipBundle(candidates, vacancy, res) {
  const archive = archiver('zip', {
    zlib: { level: 9 } // Highest compression
  });

  const partnerName = (vacancy.partner_name || 'Mitra').replace(/[^a-zA-Z0-9_-]/g, '_');
  const position = (vacancy.position_title || 'Lowongan').replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const zipFileName = `Bundel_CV_${partnerName}_${position}_${dateStr}.zip`;

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);

  archive.pipe(res);

  // 1. Tambahkan README resmi penyerahan mitra
  const readmeContent = [
    '================================================================================',
    'PT KINARYA ALIHDAYA MANDIRI (PT KAM) - RECRUITMENT SERVICES',
    'DOKUMEN PENYERAHAN BERKAS KANDIDAT TERPILIH KEPADA PERUSAHAAN MITRA PENGGUNA',
    '================================================================================',
    '',
    `Perusahaan Mitra Tujuan : ${vacancy.partner_name || 'Mitra Rekanan'}`,
    `Posisi Kebutuhan        : ${vacancy.position_title || '-'}`,
    `Jumlah Kandidat Siap    : ${candidates.length} Orang`,
    `Tanggal Penyerahan      : ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
    '',
    'Seluruh kandidat dalam arsip ini telah melalui seleksi administratif Tahap I',
    'dan Wawancara HRD Tahap II oleh Tim Recruitment PT KAM.',
    '',
    'DAFTAR KANDIDAT:',
    ...candidates.map((c, i) => `${i + 1}. ${c.full_name} (${c.education_degree} - ${c.campus_name}) | WA: ${c.phone}`),
    '',
    '--------------------------------------------------------------------------------',
    'Kontak Tim Recruitment PT KAM: recruitment@kinarya.co.id'
  ].join('\n');

  archive.append(readmeContent, { name: 'README_PENYERAHAN_BERKAS.txt' });

  // 2. Tambahkan Dossier Ringkasan Profil Tiap Kandidat
  for (const c of candidates) {
    const safeName = c.full_name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dossierText = [
      'DOSSIER KANDIDAT TERPILIH PT KAM',
      '========================================',
      `Nama Lengkap    : ${c.full_name}`,
      `Glints App ID   : ${c.glints_applicant_id}`,
      `Kontak WhatsApp : ${c.phone}`,
      `Email           : ${c.email}`,
      `Usia & Domisili : ${c.age} Tahun, ${c.domicile_city}`,
      `Pendidikan      : ${c.education_degree} - ${c.campus_name} (${c.study_major || '-'})`,
      `Pengalaman      : ${c.total_experience_label || 'Fresh Graduate'}`,
      `Hasil HRD       : ${c.status_hrd}`,
      `Catatan HRD     : ${c.notes || '-'}`,
      '========================================'
    ].join('\n');

    archive.append(dossierText, { name: `Dossier_${safeName}.txt` });

    // Jika berkas PDF asli tersedia di storage, sertakan
    if (c.resume_file_url) {
      const cvFilePath = path.resolve(__dirname, '../../uploads/cv', path.basename(c.resume_file_url));
      if (fs.existsSync(cvFilePath)) {
        archive.file(cvFilePath, { name: `CV_${safeName}.pdf` });
      }
    }
  }

  await archive.finalize();
}

module.exports = {
  streamZipBundle
};

