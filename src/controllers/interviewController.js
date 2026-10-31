const pool = require('../config/database');
const { Candidate, Assessment, AuditLog } = require('../models');

/**
 * INTERVIEW CONTROLLER
 * Handles recruiter interview decisions, scoring submission, and activity logging (ADR-007).
 */

/**
 * POST /api/v1/candidates/:id/hrd-assessment
 * Submit HRD Interview Evaluation (Dropdown Decision - ADR-007)
 */
async function submitHrdAssessment(req, res) {
  try {
    const { id } = req.params;
    const { decision, notes, evaluatorName, numericScore } = req.body;

    // Larangan penggunaan skor numerik sesuai ADR-007
    if (numericScore !== undefined) {
      return res.status(400).json({
        success: false,
        message: 'Sistem menggunakan Dropdown Keputusan Langsung (Lolos Seleksi HRD / Tidak Lolos) sesuai standar ADR-007, bukan skor numerik.'
      });
    }

    const allowedDecisions = ['Lolos Seleksi HRD', 'Tidak Lolos'];
    if (!decision || !allowedDecisions.includes(decision)) {
      return res.status(400).json({
        success: false,
        message: `Keputusan wawancara harus dipilih dari Dropdown: ${allowedDecisions.join(' atau ')}.`
      });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Dapatkan status lama untuk audit log
      const oldState = await Candidate.findById(id);
      if (!oldState) {
        await conn.rollback();
        return res.status(404).json({ success: false, message: 'Kandidat tidak ditemukan.' });
      }

      // 2. Perbarui keputusan HRD di tabel candidates via Model Candidate
      await Candidate.updateHrdDecision(conn, id, decision, notes || null);

      // 3. Catat di tabel interview_assessments via Model Assessment
      await Assessment.record(conn, {
        candidateId: id,
        evaluatorName: evaluatorName || 'HRD Recruiter',
        decision,
        notes: notes || '-'
      });

      // 4. Catat di tabel audit_logs via Model AuditLog
      await AuditLog.record(conn, {
        candidateId: id,
        userName: evaluatorName || 'HRD Recruiter',
        actionType: 'HRD_INTERVIEW_ASSESSMENT',
        details: {
          previousStatus: oldState.status_hrd,
          newStatus: decision,
          notes: notes || oldState.notes,
          timestamp: new Date().toISOString()
        }
      });

      await conn.commit();

      const updatedCandidate = await Candidate.findById(id);
      return res.status(200).json({
        success: true,
        message: `Keputusan wawancara berhasil ditetapkan: ${decision}.`,
        data: updatedCandidate
      });
    } catch (dbErr) {
      await conn.rollback();
      throw dbErr;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('[HRD ASSESSMENT ERROR]', err);
    return res.status(500).json({ success: false, message: 'Gagal menyimpan penilaian wawancara HRD.', error: err.message });
  }
}

module.exports = {
  submitHrdAssessment
};
