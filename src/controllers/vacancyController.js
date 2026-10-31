const { Vacancy } = require('../models');

/**
 * VACANCY & PARTNER MASTER CONTROLLER
 * Handles CRUD operations for "Permintaan Mitra Aktif" (Job Vacancies / Third-Party Partner Requests)
 */

/**
 * GET /api/v1/vacancies
 * List all partner vacancy requests with dynamic applicant metrics
 */
async function getAllVacancies(req, res) {
  try {
    const rows = await Vacancy.findAllWithMetrics();
    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (err) {
    console.error('[GET ALL VACANCIES ERROR]', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data permintaan lowongan mitra.',
      error: err.message
    });
  }
}

/**
 * GET /api/v1/vacancies/:id
 * Retrieve a single partner vacancy request by ID
 */
async function getVacancyById(req, res) {
  try {
    const { id } = req.params;
    const vacancy = await Vacancy.findById(id);

    if (!vacancy) {
      return res.status(404).json({
        success: false,
        message: `Permintaan mitra dengan ID ${id} tidak ditemukan.`
      });
    }

    return res.status(200).json({
      success: true,
      data: vacancy
    });
  } catch (err) {
    console.error('[GET VACANCY BY ID ERROR]', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil rincian permintaan mitra.',
      error: err.message
    });
  }
}

/**
 * POST /api/v1/vacancies
 * Create a new partner vacancy request
 */
async function createVacancy(req, res) {
  try {
    const {
      position_title,
      partner_name,
      target_city,
      max_age,
      min_education,
      quota,
      status
    } = req.body;

    if (!position_title || !position_title.trim()) {
      return res.status(400).json({ success: false, message: 'Judul posisi jabatan wajib diisi.' });
    }
    if (!partner_name || !partner_name.trim()) {
      return res.status(400).json({ success: false, message: 'Nama perusahaan mitra pihak ketiga wajib diisi.' });
    }

    const createdData = await Vacancy.create({
      position_title: position_title.trim(),
      partner_name: partner_name.trim(),
      target_city: target_city && target_city.trim() ? target_city.trim() : 'Semarang',
      max_age: parseInt(max_age, 10) || 30,
      min_education: min_education && min_education.trim() ? min_education.trim() : 'SMA/SMK',
      quota: parseInt(quota, 10) || 10,
      status: ['Dibuka', 'Ditutup', 'Arsip'].includes(status) ? status : 'Dibuka'
    });

    return res.status(201).json({
      success: true,
      message: 'Permintaan mitra baru berhasil ditambahkan.',
      data: createdData
    });
  } catch (err) {
    console.error('[CREATE VACANCY ERROR]', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal menambahkan permintaan mitra baru.',
      error: err.message
    });
  }
}

/**
 * PUT /api/v1/vacancies/:id
 * Update an existing partner vacancy request
 */
async function updateVacancy(req, res) {
  try {
    const { id } = req.params;
    const {
      position_title,
      partner_name,
      target_city,
      max_age,
      min_education,
      quota,
      status
    } = req.body;

    const existing = await Vacancy.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Permintaan mitra dengan ID ${id} tidak ditemukan.`
      });
    }

    const updatePayload = {
      position_title: position_title && position_title.trim() ? position_title.trim() : existing.position_title,
      partner_name: partner_name && partner_name.trim() ? partner_name.trim() : existing.partner_name,
      target_city: target_city && target_city.trim() ? target_city.trim() : existing.target_city,
      max_age: max_age ? parseInt(max_age, 10) : existing.max_age,
      min_education: min_education && min_education.trim() ? min_education.trim() : existing.min_education,
      quota: quota ? parseInt(quota, 10) : existing.quota,
      status: status && ['Dibuka', 'Ditutup', 'Arsip'].includes(status) ? status : existing.status
    };

    const updated = await Vacancy.update(id, updatePayload);

    return res.status(200).json({
      success: true,
      message: 'Data permintaan mitra berhasil diperbarui.',
      data: updated
    });
  } catch (err) {
    console.error('[UPDATE VACANCY ERROR]', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui data permintaan mitra.',
      error: err.message
    });
  }
}

/**
 * PATCH /api/v1/vacancies/:id/status
 * Toggle or update vacancy status ('Dibuka', 'Ditutup', 'Arsip')
 */
async function updateVacancyStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Dibuka', 'Ditutup', 'Arsip'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status tidak valid. Pilihan status: Dibuka, Ditutup, Arsip.'
      });
    }

    const updated = await Vacancy.updateStatus(id, status);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Permintaan mitra dengan ID ${id} tidak ditemukan.`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Status lowongan berhasil diubah menjadi "${status}".`,
      data: { id: Number(id), status }
    });
  } catch (err) {
    console.error('[UPDATE VACANCY STATUS ERROR]', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengubah status permintaan mitra.',
      error: err.message
    });
  }
}

/**
 * DELETE /api/v1/vacancies/:id
 * Delete a partner vacancy request (with safety check for linked candidates)
 */
async function deleteVacancy(req, res) {
  try {
    const { id } = req.params;
    const { force } = req.query;

    const existing = await Vacancy.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Permintaan mitra dengan ID ${id} tidak ditemukan.`
      });
    }

    const candCount = await Vacancy.countApplicants(id);
    if (candCount > 0 && force !== 'true') {
      return res.status(400).json({
        success: false,
        hasApplicants: true,
        applicantCount: candCount,
        message: `Permintaan lowongan ini memiliki ${candCount} kandidat terdaftar. Anda dapat mengubah statusnya menjadi 'Ditutup' / 'Arsip', atau konfirmasi penghapusan permanen.`
      });
    }

    if (candCount > 0 && force === 'true') {
      await Vacancy.deleteLinkedCandidates(id);
    }

    await Vacancy.delete(id);

    return res.status(200).json({
      success: true,
      message: `Permintaan lowongan "${existing.position_title}" (${existing.partner_name}) berhasil dihapus.`
    });
  } catch (err) {
    console.error('[DELETE VACANCY ERROR]', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus permintaan mitra.',
      error: err.message
    });
  }
}

module.exports = {
  getAllVacancies,
  getVacancyById,
  createVacancy,
  updateVacancy,
  updateVacancyStatus,
  deleteVacancy
};
