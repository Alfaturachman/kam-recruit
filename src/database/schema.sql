-- ==============================================================================
-- DATABASE SCHEMA: KAM RECRUIT
-- PT KINARYA ALIHDAYA MANDIRI (PT KAM)
-- Engine: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- ==============================================================================

CREATE TABLE IF NOT EXISTS job_vacancies (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    position_title VARCHAR(150) NOT NULL,
    partner_name VARCHAR(150) NOT NULL,
    target_city VARCHAR(100) NOT NULL,
    max_age INT NOT NULL,
    min_education VARCHAR(50) NOT NULL,
    quota INT NOT NULL DEFAULT 10,
    status ENUM('Dibuka', 'Ditutup', 'Arsip') NOT NULL DEFAULT 'Dibuka',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_vacancy_status (status),
    INDEX idx_vacancy_partner (partner_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS candidates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    vacancy_id BIGINT NOT NULL,
    glints_applicant_id VARCHAR(64) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    age INT NOT NULL,
    gender ENUM('Laki-laki', 'Perempuan') NULL,
    domicile_city VARCHAR(100) NOT NULL,
    location_detail VARCHAR(255) NULL,
    willing_to_relocate BOOLEAN DEFAULT FALSE,
    expected_salary VARCHAR(50) NULL,
    education_degree VARCHAR(20) NOT NULL,
    study_major VARCHAR(150) NULL,
    campus_name VARCHAR(150) NOT NULL,
    gpa DECIMAL(4,2) NULL,
    total_experience_label VARCHAR(50) NULL,
    about_me TEXT NULL,
    skills_text TEXT NULL,
    organization_exp TEXT NULL,
    screening_answers JSON NULL,
    glints_profile_url VARCHAR(500) NULL,
    resume_file_url VARCHAR(255) NULL,
    status_sortir ENUM('Belum Disortir', 'Lolos Sortir', 'Tidak Memenuhi Syarat') NOT NULL DEFAULT 'Belum Disortir',
    status_interview ENUM('Belum Dihubungi', 'Bersedia', 'Menolak', 'Tidak Merespons', 'Tidak Diproses') NOT NULL DEFAULT 'Belum Dihubungi',
    interview_schedule VARCHAR(100) NULL,
    status_hrd ENUM('Menunggu Seleksi', 'Lolos Seleksi HRD', 'Tidak Lolos', 'Tidak Hadir', 'Menolak/Batal') NOT NULL DEFAULT 'Menunggu Seleksi',
    notes TEXT NULL,
    submitted_to_partner_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vacancy_id) REFERENCES job_vacancies(id) ON DELETE CASCADE,
    INDEX idx_candidate_vacancy_sortir (vacancy_id, status_sortir),
    INDEX idx_candidate_email (email),
    INDEX idx_candidate_phone (phone),
    INDEX idx_candidate_hrd (status_hrd)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS candidate_experiences (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    candidate_id BIGINT NOT NULL,
    position_title VARCHAR(150) NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    duration_label VARCHAR(100) NOT NULL,
    city VARCHAR(100) NULL,
    responsibilities JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    INDEX idx_exp_candidate (candidate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS candidate_certificates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    candidate_id BIGINT NOT NULL,
    certificate_name VARCHAR(150) NOT NULL,
    issuing_body VARCHAR(150) NOT NULL,
    issue_year INT NULL,
    credential_id VARCHAR(100) NULL,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    INDEX idx_cert_candidate (candidate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS interview_assessments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    candidate_id BIGINT NOT NULL,
    evaluator_name VARCHAR(100) NOT NULL DEFAULT 'HRD Recruiter',
    decision ENUM('Lolos Seleksi HRD', 'Tidak Lolos') NOT NULL,
    notes TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    INDEX idx_assess_candidate (candidate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    candidate_id BIGINT NOT NULL,
    user_name VARCHAR(100) NOT NULL DEFAULT 'HRD Recruiter',
    action_type VARCHAR(50) NOT NULL,
    details JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    INDEX idx_audit_candidate (candidate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

