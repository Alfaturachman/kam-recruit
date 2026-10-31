const pool = require('../config/database');

/**
 * VACANCY (JOB_VACANCIES) MODEL
 * Encapsulates all database operations for partner job vacancies / outsourcing requests.
 */
class Vacancy {
  /**
   * Find all partner vacancies with aggregated applicant metrics
   */
  static async findAllWithMetrics() {
    const [rows] = await pool.query(`
      SELECT 
        v.id,
        v.partner_name,
        v.position_title,
        v.quota,
        v.min_education,
        v.max_age,
        v.target_city,
        v.target_city AS work_location,
        v.status,
        v.created_at,
        v.updated_at,
        COUNT(c.id) AS total_applicants,
        SUM(CASE WHEN c.status_sortir = 'Lolos Sortir' THEN 1 ELSE 0 END) AS passed_sortir,
        SUM(CASE WHEN c.status_sortir = 'Lolos Sortir' AND c.status_hrd = 'Lolos Seleksi HRD' THEN 1 ELSE 0 END) AS passed_hrd
      FROM job_vacancies v
      LEFT JOIN candidates c ON v.id = c.vacancy_id
      GROUP BY 
        v.id, v.partner_name, v.position_title, v.quota, v.min_education, 
        v.max_age, v.target_city, v.status, v.created_at, v.updated_at
      ORDER BY v.id ASC
    `);
    return rows;
  }

  /**
   * Find a vacancy by ID with aggregated applicant metrics
   */
  static async findById(id) {
    const [rows] = await pool.query(`
      SELECT 
        v.*,
        COUNT(c.id) AS total_applicants,
        SUM(CASE WHEN c.status_sortir = 'Lolos Sortir' THEN 1 ELSE 0 END) AS passed_sortir,
        SUM(CASE WHEN c.status_sortir = 'Lolos Sortir' AND c.status_hrd = 'Lolos Seleksi HRD' THEN 1 ELSE 0 END) AS passed_hrd
      FROM job_vacancies v
      LEFT JOIN candidates c ON v.id = c.vacancy_id
      WHERE v.id = ?
      GROUP BY v.id
    `, [id]);
    return rows[0] || null;
  }

  /**
   * Create a new partner vacancy
   */
  static async create({ position_title, partner_name, target_city, max_age, min_education, quota, status }) {
    const [insertResult] = await pool.query(`
      INSERT INTO job_vacancies (
        position_title, partner_name, target_city, max_age, min_education, quota, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      position_title,
      partner_name,
      target_city || 'Semarang',
      max_age || 30,
      min_education || 'SMA/SMK',
      quota || 10,
      status || 'Dibuka'
    ]);

    return {
      id: insertResult.insertId,
      position_title,
      partner_name,
      target_city: target_city || 'Semarang',
      max_age: max_age || 30,
      min_education: min_education || 'SMA/SMK',
      quota: quota || 10,
      status: status || 'Dibuka'
    };
  }

  /**
   * Update an existing vacancy record
   */
  static async update(id, data) {
    await pool.query(`
      UPDATE job_vacancies 
      SET 
        position_title = ?,
        partner_name = ?,
        target_city = ?,
        max_age = ?,
        min_education = ?,
        quota = ?,
        status = ?,
        updated_at = NOW()
      WHERE id = ?
    `, [
      data.position_title,
      data.partner_name,
      data.target_city,
      data.max_age,
      data.min_education,
      data.quota,
      data.status,
      id
    ]);

    return { id: Number(id), ...data };
  }

  /**
   * Update vacancy status ('Dibuka', 'Ditutup', 'Arsip')
   */
  static async updateStatus(id, status) {
    const [result] = await pool.query(
      'UPDATE job_vacancies SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Count candidates registered under a vacancy
   */
  static async countApplicants(vacancyId) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS cnt FROM candidates WHERE vacancy_id = ?',
      [vacancyId]
    );
    return rows[0].cnt || 0;
  }

  /**
   * Delete candidates linked to a vacancy
   */
  static async deleteLinkedCandidates(vacancyId) {
    await pool.query('DELETE FROM candidates WHERE vacancy_id = ?', [vacancyId]);
  }

  /**
   * Delete a vacancy
   */
  static async delete(id) {
    const [result] = await pool.query('DELETE FROM job_vacancies WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  /**
   * Get total target quota across all partner vacancies
   */
  static async getTotalQuota() {
    const [rows] = await pool.query('SELECT SUM(quota) as total_quota FROM job_vacancies');
    return rows[0]?.total_quota || 0;
  }
}

module.exports = Vacancy;

