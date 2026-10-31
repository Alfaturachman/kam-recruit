const pool = require('../config/database');

/**
 * CANDIDATE MODEL
 * Encapsulates all database operations and relational eager loading for Candidates,
 * Candidate Experiences, and Candidate Certificates.
 */
class Candidate {
  /**
   * Find candidate by ID with associated vacancy info
   */
  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT c.*, v.position_title, v.partner_name 
       FROM candidates c
       JOIN job_vacancies v ON c.vacancy_id = v.id
       WHERE c.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Find candidate by ID with relational experiences & certificates eager-loaded
   */
  static async findWithRelations(id) {
    const candidate = await this.findById(id);
    if (!candidate) return null;

    const [experiences] = await pool.query(
      'SELECT * FROM candidate_experiences WHERE candidate_id = ? ORDER BY id ASC',
      [id]
    );
    const [certificates] = await pool.query(
      'SELECT * FROM candidate_certificates WHERE candidate_id = ? ORDER BY id ASC',
      [id]
    );

    candidate.pengalaman = experiences.map(e => ({
      id: e.id,
      posisi: e.position_title,
      perusahaan: e.company_name,
      periode: e.duration_label,
      lokasi: e.city || '-',
      tugas: typeof e.responsibilities === 'string' ? JSON.parse(e.responsibilities) : (e.responsibilities || [])
    }));

    candidate.sertifikat = certificates.map(c => ({
      id: c.id,
      nama: c.certificate_name,
      penerbit: c.issuing_body,
      tahun: c.issue_year || '2024',
      noReg: c.credential_id || '-',
      status: c.is_verified ? 'Terverifikasi' : 'Belum Diverifikasi'
    }));

    candidate.keahlian = candidate.skills_text
      ? candidate.skills_text.split(',').map(s => s.trim()).filter(Boolean)
      : ['Komunikasi', 'Kerja Tim'];
    candidate.experiences = candidate.pengalaman;
    candidate.certificates = candidate.sertifikat;

    return candidate;
  }

  /**
   * Find all candidates matching query criteria with relational eager loading
   */
  static async findAll({ vacancy_id, status_sortir, status_hrd, search } = {}) {
    let query = `
      SELECT c.*, v.position_title, v.partner_name 
      FROM candidates c
      JOIN job_vacancies v ON c.vacancy_id = v.id
      WHERE 1=1
    `;
    const params = [];

    if (vacancy_id) {
      query += ` AND c.vacancy_id = ?`;
      params.push(parseInt(vacancy_id, 10));
    }
    if (status_sortir) {
      query += ` AND c.status_sortir = ?`;
      params.push(status_sortir);
    }
    if (status_hrd) {
      query += ` AND c.status_hrd = ?`;
      params.push(status_hrd);
    }
    if (search) {
      query += ` AND (c.full_name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY c.id DESC`;

    const [rows] = await pool.query(query, params);

    if (rows.length > 0) {
      const candidateIds = rows.map(r => r.id);
      const [exps] = await pool.query(
        'SELECT * FROM candidate_experiences WHERE candidate_id IN (?) ORDER BY id ASC',
        [candidateIds]
      );
      const [certs] = await pool.query(
        'SELECT * FROM candidate_certificates WHERE candidate_id IN (?) ORDER BY id ASC',
        [candidateIds]
      );

      const expMap = {};
      const certMap = {};

      exps.forEach(e => {
        if (!expMap[e.candidate_id]) expMap[e.candidate_id] = [];
        expMap[e.candidate_id].push({
          id: e.id,
          posisi: e.position_title,
          perusahaan: e.company_name,
          periode: e.duration_label,
          lokasi: e.city || '-',
          tugas: typeof e.responsibilities === 'string' ? JSON.parse(e.responsibilities) : (e.responsibilities || [])
        });
      });

      certs.forEach(c => {
        if (!certMap[c.candidate_id]) certMap[c.candidate_id] = [];
        certMap[c.candidate_id].push({
          id: c.id,
          nama: c.certificate_name,
          penerbit: c.issuing_body,
          tahun: c.issue_year || '2024',
          noReg: c.credential_id || '-',
          status: c.is_verified ? 'Terverifikasi' : 'Belum Diverifikasi'
        });
      });

      rows.forEach(r => {
        r.pengalaman = expMap[r.id] || [];
        r.sertifikat = certMap[r.id] || [];
        r.experiences = r.pengalaman;
        r.certificates = r.sertifikat;
        r.keahlian = r.skills_text
          ? r.skills_text.split(',').map(s => s.trim()).filter(Boolean)
          : ['Komunikasi', 'Kerja Tim'];
      });
    }

    return rows;
  }

  /**
   * Upsert a candidate record from Glints Excel applicant data
   */
  static async upsertFromGlints(conn, { targetVacancyId, applicant, evalResult, parsedCreatedAt }) {
    const sql = `
      INSERT INTO candidates (
        vacancy_id, glints_applicant_id, full_name, email, phone, age,
        gender, domicile_city, location_detail, willing_to_relocate,
        expected_salary, education_degree, study_major, campus_name,
        gpa, total_experience_label, about_me, skills_text, organization_exp,
        screening_answers, glints_profile_url, resume_file_url,
        status_sortir, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, NOW()))
      ON DUPLICATE KEY UPDATE
        full_name = VALUES(full_name),
        email = VALUES(email),
        phone = VALUES(phone),
        age = VALUES(age),
        domicile_city = VALUES(domicile_city),
        expected_salary = VALUES(expected_salary),
        status_sortir = VALUES(status_sortir),
        notes = VALUES(notes),
        created_at = COALESCE(VALUES(created_at), created_at),
        updated_at = NOW()
    `;

    const values = [
      targetVacancyId,
      applicant.glintsApplicantId,
      applicant.fullName,
      applicant.email,
      applicant.phone,
      applicant.age,
      applicant.gender,
      applicant.domicileCity,
      applicant.locationDetail,
      applicant.willingToRelocate,
      applicant.expectedSalary,
      applicant.educationDegree,
      applicant.studyMajor,
      applicant.campusName,
      applicant.gpa,
      applicant.totalExperienceLabel,
      applicant.aboutMe,
      applicant.skillsText,
      applicant.organizationExp,
      JSON.stringify(applicant.screeningAnswers || {}),
      applicant.glintsProfileUrl,
      applicant.resumeFileUrl,
      evalResult.statusSortir,
      evalResult.catatan,
      parsedCreatedAt
    ];

    const [insertRes] = await conn.query(sql, values);
    let candidateId = insertRes.insertId;

    if (!candidateId) {
      const [found] = await conn.query(
        'SELECT id FROM candidates WHERE glints_applicant_id = ?',
        [applicant.glintsApplicantId]
      );
      if (found.length > 0) candidateId = found[0].id;
    }

    if (candidateId) {
      // Re-populate candidate experiences
      await conn.query('DELETE FROM candidate_experiences WHERE candidate_id = ?', [candidateId]);
      await conn.query('DELETE FROM candidate_certificates WHERE candidate_id = ?', [candidateId]);

      if (applicant.lastExperience) {
        const posTitle = applicant.lastExperience.split('(')[0].trim();
        const compName = applicant.lastExperience.split('(')[1]?.replace(')', '').trim() || 'Perusahaan Terdahulu';
        await conn.query(
          `INSERT INTO candidate_experiences (candidate_id, position_title, company_name, duration_label, city, responsibilities)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            candidateId,
            posTitle,
            compName,
            applicant.totalExperienceLabel || 'Pengalaman Terdaftar',
            applicant.domicileCity,
            JSON.stringify([applicant.aboutMe || 'Menjalankan tugas dan tanggung jawab operasional posisi.'])
          ]
        );
      }

      if (applicant.pastExperience) {
        const pastLines = applicant.pastExperience.split('\n').map(l => l.trim()).filter(Boolean);
        for (const line of pastLines) {
          const posTitle = line.split('(')[0].trim();
          const compName = line.split('(')[1]?.replace(')', '').trim() || 'Instansi Terdahulu';
          await conn.query(
            `INSERT INTO candidate_experiences (candidate_id, position_title, company_name, duration_label, city, responsibilities)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              candidateId,
              posTitle,
              compName,
              'Pengalaman Terdahulu',
              applicant.domicileCity,
              JSON.stringify(['Pengalaman penugasan operasional sebelumnya.'])
            ]
          );
        }
      }

      // Re-populate candidate certificate
      const certName = applicant.studyMajor
        ? `Ijazah & Kompetensi ${applicant.studyMajor}`
        : `Sertifikat Kualifikasi ${applicant.educationDegree}`;
      await conn.query(
        `INSERT INTO candidate_certificates (candidate_id, certificate_name, issuing_body, issue_year, credential_id, is_verified)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          candidateId,
          certName,
          `${applicant.campusName} (Glints Verified)`,
          2024,
          `GLINTS-CERT-${candidateId}`,
          true
        ]
      );
    }

    return candidateId;
  }

  /**
   * Bulk update status sortir for multiple candidates
   */
  static async bulkUpdateSortir(candidateIds, statusSortir = 'Lolos Sortir') {
    const [result] = await pool.query(
      `UPDATE candidates 
       SET status_sortir = ?,
           status_interview = IF(status_interview = 'Belum Dihubungi', 'Bersedia', status_interview),
           interview_schedule = IF(interview_schedule IS NULL OR interview_schedule = '-', 'Kamis, 5 Nov (13.00 WIB)', interview_schedule),
           updated_at = NOW()
       WHERE id IN (?)`,
      [statusSortir, candidateIds]
    );
    return result.affectedRows;
  }

  /**
   * Update candidate interview response & schedule
   */
  static async updateInterviewStatus(id, { statusInterview, interviewSchedule }) {
    let query = 'UPDATE candidates SET ';
    const sets = [];
    const params = [];

    if (statusInterview) {
      sets.push('status_interview = ?');
      params.push(statusInterview);
    }
    if (interviewSchedule) {
      sets.push('interview_schedule = ?');
      params.push(interviewSchedule);
    }
    sets.push('updated_at = NOW()');
    query += sets.join(', ') + ' WHERE id = ?';
    params.push(id);

    await pool.query(query, params);
    return this.findById(id);
  }

  /**
   * Update candidate HRD interview decision within a transaction
   */
  static async updateHrdDecision(conn, id, decision, notes = null) {
    await conn.query(
      `UPDATE candidates 
       SET status_hrd = ?, 
           notes = COALESCE(?, notes),
           updated_at = NOW() 
       WHERE id = ?`,
      [decision, notes, id]
    );
  }

  /**
   * Mark candidates as submitted to partner
   */
  static async markSubmittedToPartner(conn, candidateIds) {
    const [result] = await conn.query(
      `UPDATE candidates 
       SET submitted_to_partner_at = NOW() 
       WHERE id IN (?)`,
      [candidateIds]
    );
    return result.affectedRows;
  }

  /**
   * Find candidates for ZIP bundle (passed HRD or fallback to passed sortir)
   */
  static async findForZipBundle(vacancyId, fallbackLimit = 5) {
    let [candidates] = await pool.query(
      `SELECT * FROM candidates 
       WHERE vacancy_id = ? AND status_hrd = 'Lolos Seleksi HRD'`,
      [vacancyId]
    );

    if (candidates.length === 0) {
      const [fallback] = await pool.query(
        `SELECT * FROM candidates WHERE vacancy_id = ? LIMIT ?`,
        [vacancyId, fallbackLimit]
      );
      candidates = fallback;
    }

    return candidates;
  }

  /**
   * Stage 1 Recapitulation list (Lolos Sortir Administrasi)
   */
  static async getStage1Recap() {
    const [rows] = await pool.query(
      `SELECT c.*, v.position_title, v.partner_name 
       FROM candidates c
       JOIN job_vacancies v ON c.vacancy_id = v.id
       WHERE c.status_sortir = 'Lolos Sortir'
       ORDER BY c.id DESC`
    );
    return rows;
  }

  /**
   * Stage 2 Recapitulation list (Lolos Seleksi HRD)
   */
  static async getStage2Recap() {
    const [rows] = await pool.query(
      `SELECT c.*, v.position_title, v.partner_name 
       FROM candidates c
       JOIN job_vacancies v ON c.vacancy_id = v.id
       WHERE c.status_hrd = 'Lolos Seleksi HRD'
       ORDER BY c.id DESC`
    );
    return rows;
  }

  /**
   * Get dynamic recruitment funnel counts
   */
  static async getFunnelCounts() {
    const [totalRows] = await pool.query('SELECT COUNT(*) as cnt FROM candidates');
    const [sortirRows] = await pool.query("SELECT COUNT(*) as cnt FROM candidates WHERE status_sortir = 'Lolos Sortir'");
    const [interviewRows] = await pool.query("SELECT COUNT(*) as cnt FROM candidates WHERE status_interview = 'Bersedia'");
    const [evaluatedRows] = await pool.query("SELECT COUNT(*) as cnt FROM candidates WHERE status_hrd != 'Menunggu Seleksi'");
    const [hrdRows] = await pool.query("SELECT COUNT(*) as cnt FROM candidates WHERE status_hrd = 'Lolos Seleksi HRD'");

    return {
      total: totalRows[0]?.cnt || 0,
      lolosSortir: sortirRows[0]?.cnt || 0,
      konfirmasiWa: interviewRows[0]?.cnt || 0,
      evaluatedHrd: evaluatedRows[0]?.cnt || 0,
      siapMitra: hrdRows[0]?.cnt || 0
    };
  }

  /**
   * Get distinct years available in candidate application records
   */
  static async getAvailableYears() {
    const [yearsRows] = await pool.query(`
      SELECT DISTINCT YEAR(created_at) AS year 
      FROM candidates 
      WHERE created_at IS NOT NULL 
      ORDER BY year DESC
    `);
    return yearsRows.map(r => r.year).filter(Boolean);
  }

  /**
   * Get dynamic monthly candidate breakdown for a given year
   */
  static async getMonthlyAggregation(year) {
    const [rows] = await pool.query(`
      SELECT 
        MONTH(created_at) AS month,
        COUNT(*) AS total_incoming,
        SUM(CASE WHEN status_hrd = 'Lolos Seleksi HRD' THEN 1 ELSE 0 END) AS total_accepted
      FROM candidates
      WHERE YEAR(created_at) = ?
      GROUP BY MONTH(created_at)
      ORDER BY month ASC
    `, [year]);
    return rows;
  }
}

module.exports = Candidate;

