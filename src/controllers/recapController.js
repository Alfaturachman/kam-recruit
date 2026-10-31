const { Candidate } = require('../models');
const ExcelJS = require('exceljs');

/**
 * RECAPITULATION CONTROLLER
 * Manages Stage 1 (Pre-interview) and Stage 2 (Post-interview) candidate recapitulation & Excel exports.
 */

/**
 * GET /api/v1/recapitulation/stage-1
 * Get Stage 1 Recapitulation: Lolos Sortir Administrasi
 */
async function getStage1Recap(req, res) {
  try {
    const rows = await Candidate.getStage1Recap();

    return res.status(200).json({
      success: true,
      count: rows.length,
      stage: 'Tahap I (Lolos Sortir Administrasi)',
      data: rows
    });
  } catch (err) {
    console.error('[STAGE 1 RECAP ERROR]', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil rekapitulasi Tahap I.', error: err.message });
  }
}

/**
 * GET /api/v1/recapitulation/stage-2
 * Get Stage 2 Recapitulation: Lolos Seleksi Wawancara HRD
 */
async function getStage2Recap(req, res) {
  try {
    const rows = await Candidate.getStage2Recap();

    return res.status(200).json({
      success: true,
      count: rows.length,
      stage: 'Tahap II (Lolos Seleksi HRD)',
      data: rows
    });
  } catch (err) {
    console.error('[STAGE 2 RECAP ERROR]', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil rekapitulasi Tahap II.', error: err.message });
  }
}

/**
 * GET /api/v1/recapitulation/export-excel
 * Export two-stage recruitment data into formatted Excel workbook
 */
async function exportRecapExcel(req, res) {
  try {
    const tahap1Rows = await Candidate.getStage1Recap();
    const tahap2Rows = await Candidate.getStage2Recap();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'PT Kinarya Alihdaya Mandiri';
    workbook.created = new Date();

    // Sheet 1: Tahap I (Pra-Wawancara)
    const sheet1 = workbook.addWorksheet('Rekap Tahap I (Sortir)');
    sheet1.columns = [
      { header: 'No', key: 'no', width: 6 },
      { header: 'Nama Lengkap', key: 'nama', width: 28 },
      { header: 'Nomor WhatsApp', key: 'phone', width: 18 },
      { header: 'Email', key: 'email', width: 26 },
      { header: 'Posisi Dilamar', key: 'posisi', width: 25 },
      { header: 'Mitra Rekanan', key: 'mitra', width: 25 },
      { header: 'Pendidikan', key: 'pendidikan', width: 14 },
      { header: 'Institusi Kampus / Sekolah', key: 'kampus', width: 28 },
      { header: 'Usia', key: 'usia', width: 8 },
      { header: 'Domisili', key: 'domisili', width: 16 },
      { header: 'Status Sortir', key: 'status_sortir', width: 16 },
      { header: 'Respon Jadwal', key: 'status_interview', width: 18 }
    ];

    tahap1Rows.forEach((c, idx) => {
      sheet1.addRow({
        no: idx + 1,
        nama: c.full_name,
        phone: c.phone,
        email: c.email,
        posisi: c.position_title,
        mitra: c.partner_name,
        pendidikan: c.education_degree,
        kampus: c.campus_name,
        usia: c.age,
        domisili: c.domicile_city,
        status_sortir: c.status_sortir,
        status_interview: c.status_interview
      });
    });

    // Sheet 2: Tahap II (Hasil Seleksi HRD)
    const sheet2 = workbook.addWorksheet('Rekap Tahap II (HRD)');
    sheet2.columns = [
      { header: 'No', key: 'no', width: 6 },
      { header: 'Nama Lengkap', key: 'nama', width: 28 },
      { header: 'Nomor WhatsApp', key: 'phone', width: 18 },
      { header: 'Posisi Outsourcing', key: 'posisi', width: 25 },
      { header: 'Mitra Rekanan', key: 'mitra', width: 25 },
      { header: 'Keputusan HRD', key: 'status_hrd', width: 22 },
      { header: 'Catatan Evaluasi Wawancara', key: 'notes', width: 35 },
      { header: 'Tanggal Penyerahan ke Mitra', key: 'submitted_at', width: 24 }
    ];

    tahap2Rows.forEach((c, idx) => {
      sheet2.addRow({
        no: idx + 1,
        nama: c.full_name,
        phone: c.phone,
        posisi: c.position_title,
        mitra: c.partner_name,
        status_hrd: c.status_hrd,
        notes: c.notes || '-',
        submitted_at: c.submitted_to_partner_at ? new Date(c.submitted_to_partner_at).toISOString().slice(0, 19).replace('T', ' ') : 'Belum Diserahkan'
      });
    });

    // Styling Header Row
    [sheet1, sheet2].forEach(sheet => {
      sheet.getRow(1).eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0F3D78' } // Warna Korporat Biru Navy PT KAM
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Rekapitulasi_Seleksi_PT_KAM_2026.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('[EXPORT EXCEL ERROR]', err);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Gagal mengekspor file Excel rekapitulasi.', error: err.message });
    }
  }
}

module.exports = {
  getStage1Recap,
  getStage2Recap,
  exportRecapExcel,
  exportExcel: exportRecapExcel
};
