# KAM RECRUIT
## Sistem Manajemen Rekrutmen Tenaga Kerja Outsourcing
### PT Kinarya Alihdaya Mandiri (PT KAM)

---

Aplikasi terpadu pengelolaan seleksi pelamar alihdaya (*outsourcing*) PT Kinarya Alihdaya Mandiri yang mengintegrasikan ingesti data pelamar dari portal Glints, penyaringan kualifikasi administratif otomatis, modul komunikasi WhatsApp formal non-emoji, evaluasi wawancara HRD kualitatif (*Lolos / Tidak Lolos*), master data permintaan mitra rekanan (*Job Vacancies CRUD*), grafik analitik bulanan dinamis MySQL, dan pembuatan bundel arsip ZIP dokumen CV untuk diserahkan kepada perusahaan mitra pihak ketiga.

---

## Tumpukan Teknologi (Tech Stack)

* **Runtime & Framework**: Node.js (LTS v20+) & Express.js
* **Basis Data**: MySQL 8.0 (Engine InnoDB dengan Transaksi ACID)
* **Pustaka Backend**:
  * `exceljs`: Parser berkas ekspor Glints 28 kolom (*Flexible Nullable Design*)
  * `archiver`: Streaming pembuat berkas bundel `.zip` CV kandidat mitra
  * `multer`: Penanganan berkas unggahan Excel dan PDF
  * `mysql2`: Pool koneksi dan transaksi basis data
  * `cors` & `helmet`: Pengamanan header HTTP dan kontrol domain
* **Frontend Architecture**:
  * Modular Component-Based Views (`public/components/` & `public/js/`)
  * Layout compiler otomatis (`src/utils/viewAssembler.js`)
  * Standar desain **Apple Human Interface Guidelines (HIG)**
  * Tailwind CSS & Vanilla JavaScript modern
  * Client-Server HTML5 History API Routing (`pushState` & `popstate`)
* **Kontainerisasi & Proksi**: Docker, Docker Compose & Nginx Reverse Proxy
* **Pipeline Otomasi**: GitHub Actions Workflow (Linting, Testing, Trivy Scan, SSH Continuous Deployment)

---

## Arsitektur Rute Antarmuka (Dedicated URL Routing)

Sistem mengadopsi perutean *Dedicated URL Routing* yang memungkinkan setiap modul diakses langsung via URL spesifik (*deep-linking*), mendukung penyegaran peramban (*refresh*), serta kompatibel dengan tombol riwayat peramban (*Back / Forward*):

| Alamat URL Peramban | Modul Antarmuka | Fungsi Utama |
| :--- | :--- | :--- |
| `http://localhost:3000/dashboard` | Dashboard & Funnel | Metrik KPI real-time & grafik rekapitulasi rekrutmen bulanan (Jan-Des) |
| `http://localhost:3000/pelamar` | Data Pelamar | Master Data Pelamar, sortir administratif otomatis, dan dossier CV |
| `http://localhost:3000/interview` | Jadwal & Follow-up | Pelacakan konfirmasi wawancara & integrasi template WhatsApp resmi |
| `http://localhost:3000/rekapitulasi` | Rekapitulasi Dua Tahap | Matriks rekapitulasi kelulusan Tahap I & Tahap II serta ekspor CSV |
| `http://localhost:3000/mitra` | Master Mitra & Kirim CV | CRUD permintaan mitra aktif & penyerahan berkas CV kandidat lolos HRD |

---

## Modul Utama Sistem

1. **Dashboard & Analitik Rekrutmen Bulanan**:
   * Menampilkan 4 KPI utama: Total Pelamar, Lolos Sortir, Terkonfirmasi Interview, dan Kandidat Siap Mitra.
   * Grafik visualisasi rekrutmen 12 bulan (Januari hingga Desember) yang 100% dinamis dihitung melalui agregasi SQL riil dari tabel `candidates` tanpa data fiktif atau hardcoded.

2. **Master Data Pelamar Glints (Penyortiran Tahap I)**:
   * Ekstraksi cerdas 28 kolom data Glints Excel/CSV.
   * Evaluasi kesesuaian kualifikasi administratif otomatis (usia, pendidikan, dan domisili).
   * Pratinjau dossier CV eksekutif terstandarisasi siap cetak A4.

3. **Jadwal & Komunikasi WhatsApp Formal**:
   * Pemantauan status kehadiran wawancara: *Bersedia Hadir*, *Menolak*, atau *Reschedule*.
   * Generator pesan WhatsApp bisnis otomatis tanpa emoji berbasis tautan `https://wa.me/`.

4. **Rekapitulasi Dua Tahap (Single Master Database)**:
   * Sinkronisasi status seleksi administratif (Tahap I) dan wawancara HRD (Tahap II) dalam satu sumber kebenaran data (*Single Source of Truth*).
   * Fitur ekspor laporan hasil seleksi ke format spreadsheet CSV.

5. **Master Mitra Rekanan & Penyerahan Berkas CV**:
   * **Sub-modul Permintaan Mitra (CRUD Penuh)**:
     * Pengelolaan kuota lowongan posisi dari perusahaan mitra (PT Telkom Akses, Indonusa Telemedia, Logistik Prima, dll.).
     * Operasi Tambah, Edit, Ubah Status Cepat (Dibuka / Ditutup / Arsip), dan Hapus dengan proteksi relasi pelamar.
     * 4 Mini KPI Cards pemantauan target kuota dan rasio pemenuhan penempatan.
   * **Sub-modul Penyerahan Berkas CV**:
     * Tata letak satu kolom vertikal memanjang ke bawah untuk kenyamanan pemindaian berkas.
     * Pengemasan otomatis berkas PDF dan lembar penilaian HRD ke dalam bundel arsip `.zip`.

---

## Struktur Direktori Proyek

```text
kam-recruit/
├── src/
│   ├── app.js                   # Inisialisasi Express, routing modul & assembler
│   ├── server.js                # Entry point server (port 3000)
│   ├── config/
│   │   └── database.js          # Pool koneksi MySQL 8.0 (mysql2/promise)
│   ├── controllers/
│   │   ├── applicantController.js      # Ingesti Glints & Master Data Pelamar
│   │   ├── communicationController.js  # Generator WA & Konfirmasi Respon
│   │   ├── dashboardController.js      # Metrik KPI & Agregasi Bulanan Dinamis
│   │   ├── handoverController.js       # Bundel ZIP CV & Serah Terima Mitra
│   │   ├── interviewController.js      # Evaluasi Wawancara HRD & Audit Log
│   │   ├── recapController.js          # Rekapitulasi Tahap I & II (Single DB)
│   │   └── vacancyController.js        # RESTful CRUD Permintaan Mitra (Lowongan)
│   ├── database/
│   │   ├── schema.sql           # Skema DDL tabel relasional MySQL
│   │   └── seed.js              # Inisialisasi struktur dan data master lowongan
│   ├── middlewares/
│   │   └── upload.js            # Middleware Multer (Unggah berkas Excel/CSV)
│   ├── routes/
│   │   ├── applicantRoutes.js   # Rute API /api/v1/applicants
│   │   ├── communicationRoutes.js # Rute API /api/v1/candidates
│   │   ├── dashboardRoutes.js   # Rute API /api/v1/dashboard
│   │   ├── handoverRoutes.js    # Rute API /api/v1/handover
│   │   ├── recapRoutes.js       # Rute API /api/v1/recapitulation
│   │   └── vacancyRoutes.js     # Rute API /api/v1/vacancies (CRUD Lowongan)
│   ├── services/
│   │   ├── glintsParser.js      # Parser tangguh 28 kolom berkas Glints
│   │   ├── screeningEngine.js   # Mesin sortir administratif otomatis
│   │   ├── waService.js         # Template pesan WhatsApp formal non-emoji
│   │   └── zipBundler.js        # Generator arsip ZIP secara streaming
│   └── utils/
│       └── viewAssembler.js     # Compiler modular HTML components ke index.html
├── public/
│   ├── components/              # Komponen Antarmuka Terisolasi
│   │   ├── header.html          # Top bar, status Glints, jam real-time
│   │   ├── sidebar.html         # Navigasi utama samping desktop bersih
│   │   ├── tab-dashboard.html   # Tampilan dashboard & grafik bulanan Jan-Des
│   │   ├── tab-pelamar.html     # Bank pelamar Glints & sortir kualifikasi
│   │   ├── tab-interview.html   # Pelacak jadwal wawancara & preview WA
│   │   ├── tab-rekapitulasi.html# Rekapitulasi dua tahap & ekspor CSV
│   │   ├── tab-penyerahan.html  # Master mitra CRUD & kartu kandidat vertikal
│   │   ├── modals.html          # Modal Dossier, Penilaian, Impor, dan Lowongan
│   │   ├── toast.html           # Komponen notifikasi mengambang
│   │   └── mobile-nav.html      # Dock bar navigasi melayang khusus layar ponsel
│   ├── js/                      # Modul Skrip Klien Terisolasi
│   │   ├── app.js               # Router HTML5, inisialisasi, dan state global
│   │   ├── dashboard.js         # Pengambil metrik real-time & perender grafik
│   │   ├── interview.js         # Logika jadwal wawancara & template WhatsApp
│   │   ├── modals.js            # Penanganan interaksi dialog modal
│   │   ├── pelamar.js           # Filter dinamis, sortir administratif, & tabel
│   │   ├── penyerahan.js        # Logika CRUD lowongan mitra & serah terima CV
│   │   └── rekapitulasi.js      # Pengalih fase rekapitulasi & ekspor berkas
│   ├── index.template.html      # Shell layout induk arsitektur komponen
│   └── index.html               # Berkas antarmuka terkompilasi siap saji
├── sample_data/
│   ├── Data_Pelamar_Glints_Dummy.xlsx  # Berkas sampel Glints 28 kolom
│   └── Data_Pelamar_Glints_Dummy.csv   # Berkas sampel Glints versi CSV
├── tests/
│   ├── applicantApi.test.js
│   ├── database.test.js
│   ├── frontendIntegration.test.js
│   ├── glintsParser.test.js
│   ├── interviewController.test.js
│   ├── recapController.test.js
│   ├── screeningEngine.test.js
│   ├── server.test.js
│   ├── waService.test.js
│   └── zipBundler.test.js
├── docker/
│   └── nginx/
│       └── nginx.conf           # Konfigurasi reverse proxy & cache Nginx
├── uploads/                     # Direktori penyimpanan runtime berkas unggahan
├── .github/
│   └── workflows/
│       └── ci-cd.yml            # Pipeline CI/CD GitHub Actions
├── Dockerfile                   # Multi-stage Docker build (node:20-alpine)
├── docker-compose.yml           # Orkestrasi kontainer (nginx, app, db, redis)
├── .env.example                 # Template variabel lingkungan
├── package.json
└── README.md
```

---

## Panduan Memulai (Quick Start)

### 1. Prasyarat Sistem
* Node.js v20 LTS atau versi yang lebih baru
* MySQL Server 8.0 aktif pada port 3306 (atau via Laragon / XAMPP / Docker)

### 2. Pemasangan Dependensi
```bash
cd kam-recruit
npm install
```

### 3. Konfigurasi Variabel Lingkungan
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Sesuaikan kredensial koneksi basis data (`DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`).

### 4. Migrasi & Seeder Database
Jalankan skrip migrasi untuk membuat seluruh tabel dan data lowongan mitra default:
```bash
node src/database/seed.js
```

### 5. Menjalankan Server Aplikasi
* **Mode Produksi**:
  ```bash
  npm start
  ```
* **Mode Pengembangan (Hot Reload)**:
  ```bash
  npm run dev
  ```
Akses aplikasi melalui peramban: **`http://localhost:3000`**

---

## Pengujian Otomatis (Automated Testing)

Jalankan seluruh suite pengujian otomatis Jest (10 test suites, 22 unit & integration tests):
```bash
npm test
```

Seluruh pengujian mencakup verifikasi kesehatan server, parser 28 kolom Glints, logika penyortiran administratif, gateway WhatsApp non-emoji, evaluasi wawancara HRD, bundling ZIP berkas CV, koneksi basis data, dan integritas penyajian antarmuka klien.

---

## Menjalankan via Docker Compose

Untuk menjalankan seluruh ekosistem kontainer terisolasi (Nginx, Express, MySQL, Redis):
```bash
docker compose up -d --build
```
Akses aplikasi melalui web server Nginx pada: **`http://localhost`** (Port 80).
Layanan backend akan secara otomatis terhubung ke kontainer MySQL dengan persistent volume data.
