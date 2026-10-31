const { Candidate } = require('../models');
const { generateWaUrl } = require('../services/waService');

/**
 * COMMUNICATION CONTROLLER (WhatsApp Gateway)
 * Manages WhatsApp direct invitation links and candidate response updates.
 */

/**
 * GET /api/v1/communication/wa-link/:id
 * Generate WhatsApp invitation URL for candidate
 */
async function getCandidateWaLink(req, res) {
  try {
    const { id } = req.params;
    const { schedule } = req.query;

    const candidate = await Candidate.findById(id);

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Kandidat tidak ditemukan.' });
    }

    const waUrl = generateWaUrl(candidate, schedule);

    return res.status(200).json({
      success: true,
      candidateId: candidate.id,
      phone: candidate.phone,
      waUrl: waUrl
    });
  } catch (err) {
    console.error('[WA LINK ERROR]', err);
    return res.status(500).json({ success: false, message: 'Gagal membuat tautan WhatsApp.', error: err.message });
  }
}

/**
 * PUT /api/v1/communication/interview-status/:id
 * Update candidate interview response status
 */
async function updateInterviewStatus(req, res) {
  try {
    const { id } = req.params;
    const { statusInterview, interviewSchedule } = req.body;

    const allowed = ['Belum Dihubungi', 'Bersedia', 'Menolak', 'Tidak Merespons', 'Tidak Diproses'];
    if (statusInterview && !allowed.includes(statusInterview)) {
      return res.status(400).json({ success: false, message: `Status interview tidak valid. Pilih dari: ${allowed.join(', ')}` });
    }

    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Kandidat tidak ditemukan.' });
    }

    const updated = await Candidate.updateInterviewStatus(id, {
      statusInterview,
      interviewSchedule
    });

    return res.status(200).json({
      success: true,
      message: `Status respon wawancara berhasil diperbarui menjadi '${statusInterview || candidate.status_interview}'.`,
      data: updated
    });
  } catch (err) {
    console.error('[UPDATE INT STATUS ERROR]', err);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui status interview kandidat.', error: err.message });
  }
}

module.exports = {
  getCandidateWaLink,
  updateInterviewStatus
};
