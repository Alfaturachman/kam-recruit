require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function runMigrationAndSeed() {
  console.log('[MIGRATION] Running schema.sql...');
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

  // Split queries by semicolon
  const queries = schemaSql
    .split(';')
    .map(q => q.trim())
    .filter(q => q.length > 0);

  const conn = await pool.getConnection();
  try {
    for (const q of queries) {
      await conn.query(q);
    }
    console.log('[MIGRATION] All tables created successfully!');

    // Check if vacancies already exist
    const [existing] = await conn.query('SELECT COUNT(*) as cnt FROM job_vacancies');
    if (existing[0].cnt === 0) {
      console.log('[SEED] Inserting default partner job vacancies...');
      const vacancies = [
        ['Customer Service Rep', 'PT Telkom Akses', 'Semarang', 27, 'D3', 15, 'Dibuka'],
        ['Teknisi Jaringan Fiber', 'PT Indonusa Telemedia', 'Semarang', 30, 'SMA/SMK', 20, 'Dibuka'],
        ['Admin Logistik Gudang', 'PT Logistik Prima', 'Semarang', 28, 'SMA/SMK', 15, 'Dibuka'],
        ['Security Guard', 'PT Kinarya Usaha Mandiri', 'Semarang', 35, 'SMA/SMK', 15, 'Dibuka'],
        ['Administrasi Sistem Operasi', 'PT Infomedia Nusantara', 'Semarang', 28, 'D3', 10, 'Dibuka'],
        ['Sales Promotor', 'PT Erajaya Swasembada', 'Semarang', 27, 'SMA/SMK', 20, 'Dibuka']
      ];

      for (const v of vacancies) {
        await conn.query(
          `INSERT INTO job_vacancies 
          (position_title, partner_name, target_city, max_age, min_education, quota, status) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          v
        );
      }
      console.log('[SEED] 3 Default partner job vacancies seeded!');
    } else {
      console.log('[SEED] Job vacancies already present, skipping duplicate seed.');
    }
  } catch (err) {
    console.error('[MIGRATION/SEED ERROR]', err);
    throw err;
  } finally {
    conn.release();
  }
}

if (require.main === module) {
  runMigrationAndSeed()
    .then(() => {
      console.log('[DONE] Migration and Seed complete.');
      process.exit(0);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

module.exports = runMigrationAndSeed;

