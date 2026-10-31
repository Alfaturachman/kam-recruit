const pool = require('../config/database');

/**
 * AUDIT LOG MODEL
 * Encapsulates immutable activity tracking logs.
 */
class AuditLog {
  /**
   * Record a new audit log entry
   * @param {object} connection Optional active transaction connection (defaults to pool)
   * @param {object} logData { candidateId, userName, actionType, details }
   */
  static async record(connection, { candidateId, userName = 'HRD Recruiter', actionType, details }) {
    const db = connection || pool;
    const [result] = await db.query(
      `INSERT INTO audit_logs (candidate_id, user_name, action_type, details)
       VALUES (?, ?, ?, ?)`,
      [
        candidateId,
        userName,
        actionType,
        typeof details === 'object' ? JSON.stringify(details) : details
      ]
    );
    return result.insertId;
  }

  /**
   * Find audit logs for a specific candidate
   */
  static async findByCandidateId(candidateId) {
    const [rows] = await pool.query(
      'SELECT * FROM audit_logs WHERE candidate_id = ? ORDER BY id DESC',
      [candidateId]
    );
    return rows;
  }
}

module.exports = AuditLog;

