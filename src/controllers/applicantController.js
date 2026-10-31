const pool = require('../config/database');
const { Candidate, Vacancy } = require('../models');
const { parseGlintsExcel } = require('../services/glintsParser');
const { evaluateCandidate } = require('../services/screeningEngine');

/**
 * APPLICANT CONTROLLER (Glints & Internal Bank Data)
 * Orchestrates applicant importation, listing, detail viewing, and bulk screening actions.
 */

/**
 * POST /api/v1/applicants/import
 * Handle Glints Excel import (28 columns) with automated administrative screening
 */
async function importGlints(req, res) {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Tidak ada berkas Excel yang diunggah.' });
  }

  const filePath = req.file.path;
  const targetVacancyId = req.body.vacancy_id ? parseInt(req.body.vacancy_id, 10) : 1;

  try {
    // 1. Dapatkan kriteria lowongan posisi mitra dari Model Vacancy
    const vacancy = await Vacancy.findById(targetVacancyId) || {
      id: 1,
      max_age: 27,
      min_education: 'SMA/SMK',
      target_city: 'Semarang'
    };

    const criteria = {
      maxAge: vacancy.max_age,
      allowedEducation: [vacancy.min_education, 'D3', 'S1', 'S2'],
      targetCity: vacancy.target_city
    };

    // 2. Parse berkas Excel Glints (28 Kolom)
    const candidates = await parseGlintsExcel(filePath);
    if (!candidates || candidates.length === 0) {
      return res.status(400).json({ success: false, message: 'Berkas Excel tidak memuat baris data pelamar yang valid.' });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      let importedCount = 0;
      for (const c of candidates) {
        // Evaluasi sortir administratif otomatis
        const evalResult = evaluateCandidate(c, criteria);

        // Parse tanggal melamar dari Glints jika ada
        let parsedCreatedAt = null;
        if (c.appliedAt) {
          const d = new Date(c.appliedAt);
          if (!isNaN(d.getTime())) {
            parsedCreatedAt = d;
          } else {
            const parts = String(c.appliedAt).split(/[\/\-]/);
            if (parts.length === 3 && parts[2].length === 4) {
              const d2 = new Date(`${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`);
              if (!isNaN(d2.getTime())) parsedCreatedAt = d2;
            }
          }
        }

        // Delegasi penyimpanan ke Model Candidate (Upsert & Relasi Pengalaman/Sertifikat)
        await Candidate.upsertFromGlints(conn, {
          targetVacancyId,
          applicant: c,
          evalResult,
          parsedCreatedAt
        });

        importedCount++;
      }

      await conn.commit();
      return res.status(200).json({
        success: true,
        message: `${importedCount} berkas pelamar Glints berhasil diimpor dan disortir otomatis ke MySQL.`,
        count: importedCount
      });
    } catch (dbErr) {
      await conn.rollback();
      throw dbErr;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('[IMPORT ERROR]', err);
    return res.status(500).json({ success: false, message: 'Gagal memproses berkas impor Glints.', error: err.message });
  }
}

/**
 * GET /api/v1/applicants
 * Get Applicants list with relational experiences & certificates attached
 */
async function getApplicants(req, res) {
  try {
    const { vacancy_id, status_sortir, status_hrd, search } = req.query;

    const rows = await Candidate.findAll({
      vacancy_id,
      status_sortir,
      status_hrd,
      search
    });

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (err) {
    console.error('[GET APPLICANTS ERROR]', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data pelamar.', error: err.message });
  }
}

/**
 * GET /api/v1/applicants/:id
 * Get Applicant Detail with Experiences & Certificates
 */
async function getApplicantDetail(req, res) {
  try {
    const { id } = req.params;
    const candidate = await Candidate.findWithRelations(id);

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Kandidat tidak ditemukan.' });
    }

    return res.status(200).json({
      success: true,
      data: candidate
    });
  } catch (err) {
    console.error('[GET DETAIL ERROR]', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil rincian kandidat.', error: err.message });
  }
}

/**
 * POST /api/v1/applicants/bulk-sortir
 * Bulk approve candidates to Lolos Sortir
 */
async function bulkUpdateSortir(req, res) {
  try {
    const { candidate_ids, status_sortir } = req.body;
    if (!candidate_ids || !Array.isArray(candidate_ids) || candidate_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Harap pilih minimal satu kandidat.' });
    }

    const newStatus = status_sortir || 'Lolos Sortir';
    await Candidate.bulkUpdateSortir(candidate_ids, newStatus);

    return res.status(200).json({
      success: true,
      message: `${candidate_ids.length} kandidat berhasil diperbarui status sortirnya menjadi '${newStatus}'.`
    });
  } catch (err) {
    console.error('[BULK UPDATE SORTIR ERROR]', err);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui status sortir massal.', error: err.message });
  }
}

module.exports = {
  importGlints,
  getApplicants,
  getApplicantDetail,
  bulkUpdateSortir
};
