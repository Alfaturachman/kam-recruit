const pool = require('../config/database');
const { Candidate, Vacancy, AuditLog } = require('../models');
const { streamZipBundle } = require('../services/zipBundler');

/**
 * HANDOVER CONTROLLER
 * Handles ZIP bundling of qualified candidates and formal handover to outsourcing partners.
 */

/**
 * GET /api/v1/handover/bundle-zip
 * Download Bundle ZIP of candidates who passed HRD selection
 */
async function downloadBundleZip(req, res) {
  try {
    const vacancyId = req.query.vacancy_id ? parseInt(req.query.vacancy_id, 10) : 1;

    const vacancy = await Vacancy.findById(vacancyId) || {
      id: 1,
      position_title: 'Customer Service Rep',
      partner_name: 'PT Telkom Akses'
    };

    const candidates = await Candidate.findForZipBundle(vacancyId, 5);

    await streamZipBundle(candidates, vacancy, res);
  } catch (err) {
    console.error('[BUNDLE ZIP ERROR]', err);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Gagal membuat arsip bundel ZIP.', error: err.message });
    }
  }
}

/**
 * POST /api/v1/handover/submit-to-partner
 * Submit selected candidates package to third-party partner
 */
async function submitToPartner(req, res) {
  try {
    const { candidate_ids, partner_name, notes } = req.body;

    if (!candidate_ids || !Array.isArray(candidate_ids) || candidate_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Daftar ID kandidat harus berupa array dan tidak boleh kosong.' });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Tandai penyerahan di tabel candidates via Model Candidate
      await Candidate.markSubmittedToPartner(conn, candidate_ids);

      // Catat riwayat penyerahan di tabel audit_logs via Model AuditLog
      for (const cId of candidate_ids) {
        await AuditLog.record(conn, {
          candidateId: cId,
          userName: 'HRD Recruiter',
          actionType: 'HANDOVER_TO_PARTNER',
          details: {
            partner: partner_name || 'Mitra Rekanan',
            notes: notes || 'Penyerahan berkas CV resmi',
            timestamp: new Date().toISOString()
          }
        });
      }

      await conn.commit();

      return res.status(200).json({
        success: true,
        message: `Berkas ${candidate_ids.length} kandidat berhasil ditandai sebagai 'Diserahkan ke Mitra'.`,
        data: {
          submitted_count: candidate_ids.length,
          timestamp: new Date().toISOString()
        }
      });
    } catch (dbErr) {
      await conn.rollback();
      throw dbErr;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('[SUBMIT TO PARTNER ERROR]', err);
    return res.status(500).json({ success: false, message: 'Gagal memproses penyerahan berkas ke mitra.', error: err.message });
  }
}

module.exports = {
  downloadBundleZip,
  submitToPartner
};
