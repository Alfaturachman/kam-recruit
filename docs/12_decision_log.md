# ARCHITECTURE DECISION RECORDS (ADR)
## KAM RECRUIT - SISTEM MANAJEMEN REKRUTMEN TENAGA KERJA OUTSOURCING
### PT KINARYA ALIHDAYA MANDIRI (PT KAM)

---

| Dokumen ID | Versi | Status | Metode Keputusan | Arsitek Keputusan |
| :--- | :--- | :--- | :--- | :--- |
| **ADR-KAM-12** | **1.0.0** | Final Disetujui | Michael Nygard ADR Template | Tim Pengembang Kerja Praktik |

---

## 1. Daftar Catatan Keputusan Arsitektur (*Decision Index*)

| ID Keputusan | Judul Keputusan Arsitektur | Tanggal | Status | Kategori |
| :---: | :--- | :---: | :---: | :--- |
| **ADR-001** | Penggunaan 1 Master Database Terintegrasi Menggantikan Berkas Spreadsheet Terpisah | 30 Okt 2026 | **Diterima** | Database / Data Integrity |
| **ADR-002** | Penetapan Batas Sistem: Pasca-Glints hingga Penyerahan Berkas ke Mitra | 30 Okt 2026 | **Diterima** | Project Scope & Boundary |
| **ADR-003** | Adopsi Apple Human Interface Guidelines (HIG) & Larangan Ornamen AI-Slop | 30 Okt 2026 | **Diterima** | UI/UX & Design System |
| **ADR-004** | Penghapusan Karakter Emoji pada Seluruh Template Komunikasi Resmi WhatsApp | 30 Okt 2026 | **Diterima** | Business Ethics / Branding |
| **ADR-005** | Solusi Definitif Pencegahan Teks Badge Terlipat (*Anti-Wrapping Layout Rule*) | 30 Okt 2026 | **Diterima** | Frontend CSS & Responsiveness |
| **ADR-006** | Pemilihan RDBMS Relasional (MySQL/PostgreSQL) daripada Basis Data NoSQL | 30 Okt 2026 | **Diterima** | Database Architecture |
| **ADR-007** | Penggunaan Dropdown Langsung (Lolos / Tidak Lolos) Menggantikan Rubrik Angka Bobot | 31 Okt 2026 | **Diterima** | Business Logic & Operational |
| **ADR-008** | Pemilihan Node.js (Express.js) sebagai Backend API & Kontainerisasi Docker | 31 Okt 2026 | **Diterima** | Backend & DevOps |
| **ADR-009** | Dekomposisi Modular Komponen Frontend (Component-Based View Architecture) | 31 Okt 2026 | **Diterima** | Frontend Architecture |
| **ADR-010** | Penerapan Arsitektur MVC Murni & Pembentukan Lapisan Model Mandiri (`src/models/`) | 31 Okt 2026 | **Diterima** | Software Design Pattern |

---

## 2. Rincian Catatan Keputusan (*Detailed Decision Records*)

### ADR-001: Penggunaan 1 Master Database Terintegrasi Menggantikan Berkas Spreadsheet Terpisah
* **Konteks**:  
  Sebelumnya, tim HRD PT KAM mengelola proses seleksi menggunakan satu master spreadsheet Excel yang diedit secara berkelanjutan dari fase sortir kualifikasi (Tahap I) hingga penilaian wawancara HRD (Tahap II). Terjadi kekhawatiran apakah sistem baru harus memecah data menjadi berkas/tabel terpisah untuk setiap tahapan.
* **Keputusan yang Diambil**:  
  Sistem **TIDAK membuat berkas/tabel baru yang terpisah**, melainkan mengadopsi **1 Master Relational Table** (`candidates`) dengan penandaan status bertahap (*stage flagging*) dan pencatatan riwayat perubahan (*audit trail*).
* **Konsekuensi & Manfaat**:
  - **Positif**: Menghilangkan 100% risiko penimpaan data (*overwriting*), tidak ada inkonsistensi duplikasi baris antar-tahap, dan menjaga keutuhan riwayat awal pelamar.
  - **Negatif / Tantangan**: Antarmuka pengguna harus memiliki logika filter kueri terpisah agar pada Tab Rekapitulasi Tahap I dan Tahap II hanya menampilkan kandidat yang relevan.

---

### ADR-002: Penetapan Batas Sistem: Pasca-Glints hingga Penyerahan Berkas ke Mitra
* **Konteks**:  
  Perlu kejelasan apakah sistem harus membangun formulir pendaftaran publik bagi pelamar dan apakah sistem harus mencakup tes teknis internal pihak ketiga.
* **Keputusan yang Diambil**:  
  Lingkup sistem dibatasi secara tegas:
  1. *Hulu*: Dimulai pasca-pelamar mendaftar di Glints (sistem mengimpor berkas pendaftaran Glints).
  2. *Hilir*: Berhenti pada saat penyerahan berkas CV kandidat terpilih (Tahap II) kepada pihak ketiga.
  3. Proses seleksi lanjutan pihak ketiga (seperti tes teknis korporasi mitra dan wawancara *user* klien) berada di luar batas sistem internal PT KAM.
* **Konsekuensi & Manfaat**:
  - **Positif**: Ruang lingkup proyek terfokus, realistis diselesaikan dalam periode kerja praktik, dan secara tepat memecahkan masalah inti operasional HRD PT KAM.
  - **Risiko**: Masih bergantung pada ketersediaan ekspor data dari portal Glints.

---

### ADR-003: Adopsi Apple Human Interface Guidelines (HIG) & Larangan Ornamen AI-Slop
* **Konteks**:  
  Banyak purwarupa perangkat lunak yang dibuat AI menggunakan ornamen generik murahan (*AI slop*), seperti garis aksen vertikal tebal berwarna-warni di tepi kiri kartu (`w-1.5 h-full absolute left-0 top-0`), gradasi gelap berlebihan, dan bayangan hitam kasar.
* **Keputusan yang Diambil**:  
  Seluruh komponen antarmuka wajib mengacu pada **Apple Human Interface Guidelines (HIG)**:
  1. Permukaan kartu operasional utama wajib berlatar putih bersih (`bg-white`).
  2. Menggunakan sudut lengkung halus (*squircle / rounded-2xl & rounded-3xl*).
  3. Menggunakan garis bingkai tipis elegan (`border-slate-200/80`) dan bayangan difus lembut (`shadow-[0_1px_3px_rgba(0,0,0,0.03)]`).
  4. Garis aksen samping tebal (`w-1.5 h-full absolute`) dilarang keras secara mutlak.
* **Konsekuensi & Manfaat**:
  - **Positif**: Tampilan sistem terlihat sangat profesional, berkelas enterprise modern, dan bersih dari kesan generator AI abal-abal.

---

### ADR-004: Penghapusan Karakter Emoji pada Seluruh Template Komunikasi Resmi WhatsApp
* **Konteks**:  
  Pada draf awal template pesan undangan wawancara WhatsApp, terdapat ikon emoji non-formal (seperti 🗓️, ⏰, 📍).
* **Keputusan yang Diambil**:  
  Seluruh karakter emoji **dihapus 100%** dari template pesan WhatsApp resmi PT KAM. Format digantikan dengan tipografi terstruktur resmi bahasa Indonesia:
  ```text
  Hari, Tanggal : Kamis, 5 November 2026
  Waktu         : 09.00 WIB
  Lokasi        : Kantor Operasional PT Kinarya Alihdaya Mandiri Semarang
  ```
* **Konsekuensi & Manfaat**:
  - **Positif**: Menegaskan kredibilitas dan citra formal PT KAM sebagai mitra resmi BUMN/swasta nasional; mencegah pesan dianggap sebagai tawaran kerja palsu (*spam/scam*).

---

### ADR-005: Solusi Definitif Pencegahan Teks Badge Terlipat (*Anti-Wrapping Layout Rule*)
* **Konteks**:  
  Pada resolusi layar laptop kantor (1024px–1366px), 4 kartu KPI atas yang menggunakan grid 4 kolom mengalami himpitan ruang horizontal, menyebabkan lencana status bawah (seperti `+12 Hari Ini`, `40% Respons`, `Siap ke Mitra`) terlipat menjadi 2–3 baris teks dan membengkak menjadi bentuk oval yang rusak.
* **Keputusan yang Diambil**:  
  Diterapkan solusi defensif 3 lapis:
  1. **Penguncian Lencana**: Menambahkan kelas CSS `whitespace-nowrap shrink-0` pada seluruh elemen badge.
  2. **Pengendalian Teks Pendamping**: Menambahkan kelas `min-w-0 flex-1 truncate` pada label sisi kiri.
  3. **Penyesuaian Breakpoint Grid**: Mengubah breakpoint grid menjadi `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4`. Di layar laptop (di bawah 1280px), kartu otomatis tertata 2×2 yang sangat lapang (~340px per kartu).
* **Konsekuensi & Manfaat**:
  - **Positif**: Tidak ada lagi elemen badge yang terlipat (*zero-wrapping*) dalam resolusi peramban apa pun.

---

### ADR-006: Pemilihan RDBMS Relasional (MySQL/PostgreSQL) daripada Basis Data NoSQL
* **Konteks**:  
  Memilih arsitektur basis data antara dokumen NoSQL (MongoDB) atau basis data relasional SQL (MySQL 8.0 / PostgreSQL 15).
* **Keputusan yang Diambil**:  
  Memilih **Basis Data Relasional SQL (Engine InnoDB)** dengan pemanfaatan kolom tipe `JSON` untuk rincian tanggung jawab pengalaman dan lisensi.
* **Alasan Pemilihan**:
  1. Menjamin integritas transaksi **ACID** pada saat status seleksi diubah dan nilai wawancara dimasukkan.
  2. Mempermudah relasi data dan pembuatan laporan rekapitulasi bertahap menggunakan kueri SQL baku (*Relational Views*).
  3. Dukungan tipe data JSON pada MySQL 8.0+ memberikan fleksibilitas dokumen tanpa mengorbankan integritas relasional antar tabel.


---

### ADR-007: Penggunaan Dropdown Langsung (Lolos / Tidak Lolos) Menggantikan Rubrik Angka Bobot
* **Konteks**:  
  Pada draf perancangan awal, sistem memuat form penilaian dengan skala angka numerik terbobot (Komunikasi 30%, Sikap 30%, Teknis 40%, dengan batas ambang >= 75). Namun, dalam operasional rekrutmen riil di PT Kinarya Alihdaya Mandiri, recruiter membutuhkan proses evaluasi yang cepat, lugas, dan kualitatif tanpa beban kalkulasi rumus numerik yang memperlambat alur kerja harian.
* **Keputusan yang Diambil**:  
  Sistem **menghilangkan seluruh input angka pembobotan**, dan menggantikannya dengan:
  1. Dropdown keputusan langsung: **`Lolos Seleksi HRD`** dan **`Tidak Lolos`**.
  2. Bidang teks area **Catatan Evaluator Wawancara HRD** untuk mencatat observasi kualitatif (kesiapan kerja shift, sikap, dan keunggulan kompetensi).
* **Konsekuensi & Manfaat**:
  - **Positif**: Alur kerja recruiter menjadi jauh lebih cepat, bebas friksi perhitungan matematis, sesuai dengan SOP operasional alihdaya riil di PT KAM, serta memudahkan evaluasi pihak ketiga tanpa kebingungan menginterpretasikan angka skor yang relatif.
  - **Dampak Data**: Kolom di database langsung mengunci `status_hrd` dan catatan kualitatif tanpa memerlukan penyimpanan kolom skor numerik terpisah.

---

### ADR-008: Pemilihan Node.js (Express.js) sebagai Backend API, Peran index.html sebagai UI/UX Reference, serta Kontainerisasi Docker dan Pipeline CI/CD
* **Konteks**:  
  Menentukan arsitektur teknologi backend, peran berkas prototipe antarmuka `index.html`, serta standar deployment dan otomasi integrasi perangkat lunak pada sistem KAM Recruit.
* **Keputusan yang Diambil**:  
  1. **Backend REST API**: Menggunakan **Node.js (LTS v20) dengan Express.js** sebagai server aplikasi utama. Memanfaatkan paket `multer` (penanganan berkas), `exceljs` (parser Glints 28 kolom), `archiver` (streaming bundel ZIP CV mitra), dan `mysql2` (transaksi ACID pool).
  2. **Peran File `index.html`**: Ditetapkan secara formal bahwa `index.html` **bukan aplikasi mandiri tanpa backend**, melainkan bertindak sebagai **Acuan Referensi Desain Interaktif UI/UX (*Living UI/UX Design Reference*)** berstandar Apple HIG. Pada fase produksi Express.js, antarmuka ini disajikan secara statis (`express.static('public')`) dan mengonsumsi REST API backend menggunakan `fetch()`.
  3. **Kontainerisasi & CI/CD**: Mengadopsi arsitektur kontainer **Docker & Docker Compose** (multi-stage build) serta pipeline **GitHub Actions** untuk otomasi linting, unit testing (Jest/Supertest), vulnerability scanning (Trivy), dan deployment tanpa henti (*zero-downtime rolling deployment*) dengan verifikasi health check otomatis.
* **Konsekuensi & Manfaat**:
  - **Efisiensi Pengembangan**: Arsitektur Full-Stack JavaScript menyederhanakan siklus pengembangan dan menghilangkan kerumitan beralih bahasa antara frontend dan backend.
  - **Performa & Reliabilitas**: Parsing data Glints dan pembentukan file ZIP dilakukan secara streaming tanpa membebani memori server.
  - **Konsistensi Lingkungan**: Docker menjamin aplikasi berjalan identik di lingkungan pengembang lokal dan server produksi PT KAM.

---

### ADR-009: Dekomposisi Modular Komponen Frontend (Component-Based View Architecture)
* **Konteks**:  
  Berkas template index.html awalnya berukuran ribuan baris kode monolitik, menyulitkan pemeliharaan dan rawan konflik antar-bagian UI (Dashboard, Pelamar, Wawancara, Rekapitulasi, dan Penyerahan).
* **Keputusan yang Diambil**:  
  Mendekomposisi antarmuka menjadi komponen terpisah:
  1. Direktori public/components/: Berkas HTML struktural murni (Passive View) seperti tab-dashboard.html, tab-pelamar.html, tab-interview.html, tab-rekapitulasi.html, dan modals.html.
  2. Direktori public/js/: Berkas JavaScript presenter terisolasi untuk manipulasi DOM dan konsumsi API.
  3. Kompiler perakitan otomatis (src/utils/viewAssembler.js): Menyusun template modular menjadi public/index.html saat server dinyalakan.
* **Konsekuensi & Manfaat**:
  - **Positif**: Kode antarmuka sangat terorganisir, mudah dirawat (maintainable), dan mendukung pembaruan parsial per modul tanpa merusak modul lainnya.

---

### ADR-010: Penerapan Arsitektur MVC Murni & Pembentukan Lapisan Model Mandiri (src/models/)
* **Konteks**:  
  Pada implementasi awal backend Express, kueri SQL mentah ditulis langsung di dalam fungsi Controller (Fat Controller). Hal ini menimbulkan inkonsistensi arsitektur MVC karena Controller mengemban dua tanggung jawab sekaligus: mengelola protokol HTTP dan mengakses basis data secara langsung.
* **Keputusan yang Diambil**:  
  Menerapkan refaktorisasi arsitektur **Model-View-Controller (MVC) Murni**:
  1. Membentuk direktori src/models/ dengan kelas-kelas model mandiri:
     - Candidate.js: Mengenkapsulasi operasi data kandidat, pengalaman kerja, sertifikasi, sortir massal, dan agregasi rekapitulasi.
     - Vacancy.js: Mengenkapsulasi CRUD permintaan lowongan mitra dan kalkulasi kuota.
     - Assessment.js: Mengenkapsulasi pencatatan evaluasi kualitatif wawancara HRD.
     - AuditLog.js: Mengenkapsulasi jejak audit aktivitas recruiter.
  2. Membersihkan seluruh berkas Controller dari string SQL langsung sehingga Controller 100% murni bertindak sebagai orkestrator HTTP (req/res).
* **Konsekuensi & Manfaat**:
  - **Separation of Concerns (SoC)**: Pemisahan peran yang tegas antara lapisan data, alur bisnis, dan antarmuka.
  - **Kerapian Kode**: Ukuran berkas controller berkurang drastis (contoh: applicantController.js turun dari 387 baris menjadi 175 baris yang bersih dan deklaratif).
  - **Kemudahan Pengujian**: Logika manipulasi data dapat diuji secara independen tanpa keterikatan erat pada siklus request/response HTTP.
  - **Kesesuaian Standar Akademik**: Memenuhi ekspektasi dosen penguji Kerja Praktik terhadap implementasi arsitektur MVC yang bersih dan profesional.
