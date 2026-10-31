const pool = require('../config/database');

/**
 * INTERVIEW ASSESSMENT MODEL
 * Encapsulates HRD interview qualitative decisions and evaluation notes (ADR-007).
 */
class Assessment {
  /**
   * Record a new interview assessment entry
   * @param {object} connection Optional active transaction connection (defaults to pool)
   * @param {object} assessmentData { candidateId, evaluatorName, decision, notes }
   */
  static async record(connection, { candidateId, evaluatorName = 'HRD Recruiter', decision, notes = '-' }) {
    const db = connection || pool;
    const [result] = await db.query(
      `INSERT INTO interview_assessments (candidate_id, evaluator_name, decision, notes)
       VALUES (?, ?, ?, ?)`,
      [candidateId, evaluatorName, decision, notes]
    );
    return result.insertId;
  }

  /**
   * Find assessments for a specific candidate
   */
  static async findByCandidateId(candidateId) {
    const [rows] = await pool.query(
      'SELECT * FROM interview_assessments WHERE candidate_id = ? ORDER BY id DESC',
      [candidateId]
    );
    return rows;
  }
}

module.exports = Assessment;

