# CHANGELOG & VERSION HISTORY
## KAM RECRUIT - SISTEM MANAJEMEN REKRUTMEN TENAGA KERJA OUTSOURCING
### PT KINARYA ALIHDAYA MANDIRI (PT KAM)
*Standar Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) & [Semantic Versioning 2.0.0](https://semver.org/)*

---

## [2.12.0] - 2026-10-31
### Modal Konfirmasi Sortir, Pembatalan Status Siap Interview, Redesain Tabel Penyerahan & Penjadwalan Wawancara Fleksibel
Pembaruan berfokus pada penyempurnaan alur kerja seleksi pelamar, pencegahan kesalahan operasional recruiter (*human error*) melalui dialog konfirmasi, kemampuan membatalkan status lolos (*revert to initial*), transformasi tampilan kandidat siap penyerahan menjadi tabel terstruktur, serta penambahan kontrol tanggal dan jam wawancara presisi.

### Added (Fitur Baru & Dialog Konfirmasi)
* **Filter Status Operasional Wawancara (*Operational Tab Filter* di `public/components/tab-interview.html` & `public/js/interview.js`)**:
  - Penambahan *segmented control* 3 mode status kerja di bagian atas antarmuka Wawancara:
    1. **Antrean Aktif (Perlu Tindakan)** *(Default)*: Hanya menampilkan kandidat yang `Lolos Sortir` dan status evaluasi HRD-nya masih `Menunggu Seleksi` (belum diserahkan ke mitra). Kandidat baru yang baru lolos Tahap I akan langsung tampil di sini secara terisolasi tanpa tercampur kandidat lama.
    2. **Selesai Wawancara**: Menampung seluruh kandidat yang telah memiliki keputusan wawancara (`Lolos Seleksi HRD` / `Tidak Lolos`) atau yang telah diserahkan berkasnya ke mitra (`Diserahkan ke Mitra`).
    3. **Semua Riwayat**: Menampilkan seluruh riwayat kandidat lolos sortir berkas dari awal siklus.
  - Setiap tab dilengkapi badge angka counter kandidat *real-time*.
  - Perubahan keputusan wawancara HRD secara dinamis memindahkan kandidat dari tab antrean aktif ke tab selesai tanpa me-reload halaman.
* **Modal Konfirmasi Status Sortir (`#modal-confirm-sortir` di `public/components/modals.html` & `public/js/pelamar.js`)**:
  - Tombol **Loloskan** kini membuka modal dialog konfirmasi yang memuat nama kandidat, posisi dilamar, dan mitra rekanan sebelum status diubah.
  - Mencegah perubahan status tidak disengaja ke status **Siap Interview**.
* **Fitur Pembatalan Lolos Sortir (*Revert to Belum Disortir*)**:
  - Kandidat yang telah berstatus **Siap Interview** kini memiliki tombol aksi **Batalkan** pada baris tabel pelamar dan footer modal detail CV.
  - Konfirmasi pembatalan otomatis mengembalikan status `status_sortir` ke `Belum Disortir`, `status_interview` ke `Belum Dihubungi`, jadwal ke `-`, dan `status_hrd` ke `Menunggu Seleksi`.
  - Penambahan tombol toolbar **Batalkan Sortir** untuk seleksi jamak (*bulk cancel*).
* **Transformasi Tabel Penyerahan Kandidat Terpilih (`public/components/tab-penyerahan.html` & `public/js/penyerahan.js`)**:
  - Sub-view **Daftar Kandidat Terpilih Siap Penyerahan** diubah dari format *card* vertikal menjadi tabel terstruktur responsif (`#thirdparty-tbody`).
  - Kolom tabel mencakup: Kandidat (avatar inisial, nama, kontak), Posisi & Mitra Rekanan, Pendidikan, Pengalaman Kerja, Sertifikasi, Status HRD, dan Aksi Penyerahan (Lihat CV & Kirim ke Mitra).
* **Modal Pengaturan Tanggal & Jam Wawancara Presisi (`#modal-schedule`)**:
  - Kontrol pemilih tanggal (`input type="date"`) dan jam (`input type="time"`) untuk wawancara kandidat.
  - Fitur **Atur Jadwal Serentak** dengan opsi centang penerapannya ke seluruh kandidat aktif.
  - Endpoint baru `PUT /api/v1/candidates/bulk/interview-schedule` pada [`communicationRoutes.js`](file:///d:/A11.2025.16609/SEMESTER%203/KERJA%20PRAKTEK/kam-recruit/src/routes/communicationRoutes.js).
* **Standardisasi Opsi Baris Paginasi Universal**:
  - Konstanta terpusat `DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50]` di `public/js/app.js` digunakan bersama di semua modul tabel.
* **Perilaku Non-Strict Modal Dismiss (Klik Luar & Tombol Escape)**:
  - Seluruh modal dialog kini dapat ditutup secara instan dengan mengklik area latar belakang (*backdrop*) di luar jendela modal (`onclick="if (event.target === this) closeModal(...)"`).
  - Penambahan listener global delegasi klik dan tombol `Escape` keyboard pada `public/js/app.js` (`setupModalBackdropDismiss()`).

### Changed (Penyelarasan Desain & Pembersihan Elemen)
* **Standardisasi Tampilan Kolom Pengalaman Kerja (`public/js/pelamar.js`)**:
  - Menyelaraskan format pengalaman kerja kandidat nomor 20 (Nabila Putri) menjadi **"Field Direct Sales Promotor"** dengan subteks durasi **"2 tahun (2024 - 2026)"** agar seragam dengan pola tampilan kandidat lainnya dan tidak terpotong (*overflow truncate*).
* **Penyederhanaan Header Modal Penilaian HRD (`#modal-scoring` di `public/components/modals.html`)**:
  - Menghapus tombol pintasan tautan *"Lihat Berkas CV Pelamar"* pada header modal keputusan wawancara agar tampilan modal tetap fokus, bersih, dan ringkas.
* **Pembersihan Kolom Tabel Rekapitulasi Tahap I (`public/js/rekapitulasi.js`)**:
  - Menghapus kolom **Log Terakhir Master Data** dari tabel Rekapitulasi Tahap I.
  - Memperbarui `colspan` state kosong (*empty state*) menjadi 5 kolom agar selaras dengan tabel.
* **Penyelarasan Banner Header Antarmuka**:
  - Banner header pada `tab-dashboard.html` dan `tab-penyerahan.html` diselaraskan mengikuti tata letak dan tipografi `tab-pelamar.html` (`text-base font-bold`, subjudul `text-xs text-slate-500`).
  - Tombol aksi pada banner penyerahan diposisikan rapi di bawah teks deskripsi.
* **Pembersihan Elemen Berlebih**:
  - Menghapus kolom redundan `Tgl Daftar (Glints)` dan `Status Seleksi I` pada tabel pelamar.
  - Menghapus kartu KPI tidak simetris *Bulan Rekrutmen Tertinggi* pada dashboard dan merapikan grid menjadi 3 kolom operasional.
  - Menghapus kartu badge peran pada sidebar dan bilah unduh berkas asli pada modal CV.
* **Verifikasi Sistem**: Seluruh 10 test suite Jest (24 skenario uji) lulus 100%.

---

## [2.11.0] - 2026-10-31
### Refaktorisasi Arsitektur MVC Murni & Pembentukan Lapisan Model (`src/models/`)
Pembaruan berfokus pada refaktorisasi arsitektur backend secara menyeluruh untuk menerapkan pemisahan tanggung jawab (*Separation of Concerns*) berbasis pola MVC murni. Seluruh kueri SQL mentah yang sebelumnya berada di dalam Controller telah dipindahkan ke kelas-kelas Model mandiri yang terstruktur rapi.

### Added (Lapisan Model Data Access)
* **Model `Candidate` (`src/models/Candidate.js`)**:
  - Mengenkapsulasi seluruh operasi tabel `candidates`, `candidate_experiences`, dan `candidate_certificates`.
  - Metode utama: `findById()`, `findWithRelations()`, `findAll()`, `upsertFromGlints()`, `bulkUpdateSortir()`, `updateInterviewStatus()`, `updateHrdDecision()`, `markSubmittedToPartner()`, `getStage1Recap()`, `getStage2Recap()`, `getFunnelCounts()`, dan `getMonthlyAggregation()`.
* **Model `Vacancy` (`src/models/Vacancy.js`)**:
  - Mengenkapsulasi operasi tabel `job_vacancies` (CRUD permintaan mitra, kuota lowongan, dan agregasi jumlah pelamar).
* **Model `Assessment` (`src/models/Assessment.js`)**:
  - Mengenkapsulasi pencatatan keputusan kualitatif wawancara HRD pada tabel `interview_assessments`.
* **Model `AuditLog` (`src/models/AuditLog.js`)**:
  - Mengenkapsulasi pencatatan jejak audit aktivitas recruiter pada tabel `audit_logs`.

### Changed (Pembersihan Controller)
* **Seluruh Controller Bersih dari Raw SQL**:
  - [`applicantController.js`](file:///d:/A11.2025.16609/SEMESTER%203/KERJA%20PRAKTEK/kam-recruit/src/controllers/applicantController.js) direfaktor dari 387 baris menjadi 175 baris ringkas dan deklaratif.
  - [`vacancyController.js`](file:///d:/A11.2025.16609/SEMESTER%203/KERJA%20PRAKTEK/kam-recruit/src/controllers/vacancyController.js), [`interviewController.js`](file:///d:/A11.2025.16609/SEMESTER%203/KERJA%20PRAKTEK/kam-recruit/src/controllers/interviewController.js), [`dashboardController.js`](file:///d:/A11.2025.16609/SEMESTER%203/KERJA%20PRAKTEK/kam-recruit/src/controllers/dashboardController.js), [`handoverController.js`](file:///d:/A11.2025.16609/SEMESTER%203/KERJA%20PRAKTEK/kam-recruit/src/controllers/handoverController.js), [`recapController.js`](file:///d:/A11.2025.16609/SEMESTER%203/KERJA%20PRAKTEK/kam-recruit/src/controllers/recapController.js), dan [`communicationController.js`](file:///d:/A11.2025.16609/SEMESTER%203/KERJA%20PRAKTEK/kam-recruit/src/controllers/communicationController.js) kini 100% murni menangani alur HTTP tanpa menyentuh string SQL secara langsung.
* **Verifikasi Sistem**: Seluruh 10 test suite Jest (22 skenario uji) lulus 100%.

---

## [2.10.0] - 2026-10-31
### Paginasi Tabel Rekapitulasi Dua Tahap (Tahap I & Tahap II)
Pembaruan berfokus pada penambahan fungsionalitas paginasi terpadu pada tabel Pusat Rekapitulasi Data Seleksi Terpadu (`#table-rekapitulasi`) pada tab Rekapitulasi. Paginasi mendukung pengaturan baris fleksibel (5, 10, 25, 50 baris per halaman) untuk memudahkan tinjauan kandidat pada Rekapitulasi Tahap I maupun Tahap II (Pasca-Wawancara).

### Added (Fitur Paginasi Rekapitulasi)
* **Paginasi Tabel Rekapitulasi (`public/components/tab-rekapitulasi.html` & `public/js/rekapitulasi.js`)**:
  - Penambahan kontainer `#rekapitulasi-pagination` di bawah tabel rekapitulasi.
  - Opsi dropdown pemilihan jumlah baris per halaman: `5`, `10`, `25`, dan `50` kandidat.
  - Default baris per halaman disetel ke `5` kandidat.
  - Penomoran indeks baris tabel (`No`) otomatis menyesuaikan offset nomor halaman (`(page - 1) * pageSize + index + 1`).
  - Sinkronisasi peralihan status tombol Rekapitulasi Tahap I dan Tahap II dengan reset otomatis ke halaman 1.
* **Perbaikan Ekspor & Sinkronisasi Komponen**:
  - Penyesuaian `public/index.html` melalui `viewAssembler.js` agar tabel rekapitulasi statis dan modular selalu selaras.

---

## [2.9.0] - 2026-10-31
### Paginasi Kartu Pelamar Jadwal & Follow-up Wawancara (WhatsApp Gateway)
Pembaruan berfokus pada integrasi komponen paginasi universal berstandar Apple HIG pada daftar kartu kandidat wawancara (`#interview-list`). Dengan bertambahnya basis data pelamar menjadi 20 kandidat, daftar kartu kini tersusun rapi dengan batasan baris per halaman untuk kenyamanan operasional recruiter.

### Added (Fitur Paginasi Kartu Wawancara)
* **Paginasi Daftar Wawancara (`public/components/tab-interview.html` & `public/js/interview.js`)**:
  - Kontainer paginasi `#interview-pagination` ditambahkan di bawah daftar kartu kandidat wawancara (`<!-- Candidate Follow-up List -->`).
  - Default ukuran halaman: 5 kartu kandidat per halaman (dengan opsi: 3, 5, 8, atau 15 kartu per halaman).
  - Navigasi tombol pil (*squircle*) dengan penanda aktif warna biru korporat PT KAM (`bg-blue-900 text-white font-bold shadow-xs`) dan ikon panah SVG presisi.
  - Reset otomatis ke halaman 1 saat recruiter beralih antara filter tab status wawancara (*Semua*, *Bersedia*, atau *Drop / Tidak Merespons*).
  - Integrasi pengguliran halus (*smooth scrolling*) ke bagian atas daftar kartu saat tombol halaman diklik.
* **Perbaikan & Redesain Status Kandidat Terpilih (`public/js/interview.js`)**:
  - Menghapus total properti `border-l-4` yang menyebabkan kemunculan bug garis artefak di bawah kartu serta pergeseran perataan margin kiri avatar.
  - Menerapkan desain sorotan Apple HIG presisi: latar belakang biru lembut (`bg-blue-50/70`) dengan bingkai inset halus (`ring-1 ring-inset ring-blue-900/15`).
  - Menambahkan lencana status aktif `Aktif di WA` dengan indikator hijau berdenyut (*pulse effect*) pada bilah status baris pertama.
  - Memperbarui tombol aksi menjadi `Aktif di WA ✓` berlatar hijau tegas (`bg-emerald-600 text-white`) untuk mempertegas kandidat yang sedang terhubung ke panel WhatsApp kanan.

---

## [2.8.0] - 2026-10-31
### Ekspansi Master Database Kandidat Menjadi 20 Data & Penambahan Posisi Strategis
Pembaruan berfokus pada penambahan data kandidat riil di basis data MySQL `kam_recruit_db` dari 8 kandidat menjadi 20 kandidat lengkap dengan riwayat pengalaman kerja terverifikasi dan sertifikasi resmi. Posisi lowongan diperluas mencakup Security Guard (pria dan wanita), Administrasi Sistem Operasi, dan Sales Promotor.

### Added (Penambahan Data Kandidat & Lowongan Mitra)
* **Penambahan 3 Permintaan Mitra Baru (`job_vacancies`)**:
  - `Security Guard` (PT Kinarya Usaha Mandiri) - Kuota: 15 posisi, kualifikasi SMA/SMK, usia maks 35 tahun.
  - `Administrasi Sistem Operasi` (PT Infomedia Nusantara) - Kuota: 10 posisi, kualifikasi D3, usia maks 28 tahun.
  - `Sales Promotor` (PT Erajaya Swasembada) - Kuota: 20 posisi, kualifikasi SMA/SMK, usia maks 27 tahun.
* **Penambahan 12 Kandidat Baru di Database MySQL (Total Menjadi 20 Kandidat)**:
  - **Security Guard (Pria)**:
    - *Bambang Hermawan* (Laki-laki, 29 th, Lisensi Gada Pratama Polda Jateng, Pengalaman Danregu Security).
    - *Agus Santoso* (Laki-laki, 31 th, Lisensi Gada Pratama Polrestabes, Pengalaman Security Pelabuhan Pelindo).
  - **Security Guard (Wanita / Secwan)**:
    - *Siti Nurhaliza* (Perempuan, 25 th, Lisensi Gada Pratama Secwan, Pengalaman Hospitalitas Bank Jateng).
    - *Dewi Sartika* (Perempuan, 26 th, Lisensi Gada Pratama Polda Jateng, Pengalaman Pengamanan Ritel Mall).
  - **Administrasi Sistem Operasi**:
    - *Rizky Pratama Putra* (Laki-laki, D3 Teknik Informatika Polines, Sertifikasi RHCSA Red Hat & BNSP).
    - *Maya Indah Permata* (Perempuan, S1 Sistem Informasi Udinus, Sertifikasi Windows Server Hybrid Microsoft).
    - *Hendra Kurniawan* (Laki-laki, D3 Teknik Komputer, Sertifikasi CompTIA Linux+).
    - *Tri Wahyuningsih* (Perempuan, S1 Teknik Informatika UKSW, Sertifikasi LPIC-1 Linux Administrator).
  - **Sales Promotor**:
    - *Aditya Surya Wijaya* (Laki-laki, 22 th, Sertifikasi Pemasar BNSP, Pengalaman Promotor Erafone Megastore).
    - *Cindy Claudia* (Perempuan, 21 th, Sertifikasi Ritel Kemnaker, Pengalaman Promotor Kosmetik Paragon).
    - *Bayu Nugroho* (Laki-laki, 23 th, Sertifikasi Penjualan APLI, Pengalaman Field Promotor Smartfren).
    - *Nabila Putri Az-Zahra* (Perempuan, 20 th, Sertifikat Public Speaking & Promosi, Brand Ambassador Expo).
* **Riwayat Pengalaman & Sertifikat Relasional**:
  - Setiap kandidat baru dilengkapi relasi data terverifikasi di tabel `candidate_experiences` dan `candidate_certificates`.
* **Penyelarasan Filter Posisi Lowongan (`tab-pelamar.html`)**:
  - Menambahkan opsi filter instan untuk `Security Guard`, `Administrasi Sistem Operasi`, dan `Sales Promotor`.

---

## [2.7.0] - 2026-10-31
### Editor Master Template WhatsApp & Kustomisasi Pesan Fleksibel
Pembaruan berfokus pada penambahan fitur manajemen dan penyuntingan template pesan WhatsApp resmi pada panel operasional Jadwal & Follow-up. Recruiter kini dapat mengkustomisasi format kata-kata, menyisipkan variabel dinamis otomatis, serta menyimpan perubahan secara permanen di peramban.

### Added (Fitur Editor Template WhatsApp)
* **Mode Penyuntingan Master Template (`public/components/tab-interview.html` & `public/js/interview.js`)**:
  - Tombol **Edit Template** pada bilah judul panel WhatsApp Gateway untuk beralih antara *Mode Pratinjau* dan *Mode Editor Master*.
  - Dukungan kustomisasi terpisah untuk 3 kategori template: **Undangan Wawancara**, **Reminder H-1**, dan **Pengumuman Lolos HRD**.
  - Pilihan tag variabel dinamis satu-klik: `+ {nama}`, `+ {posisi}`, `+ {mitra}`, dan `+ {jadwal}` yang otomatis disisipkan pada posisi kursor pengetikan.
  - Tombol **Simpan Perubahan Template**: Menyimpan hasil pengeditan template ke penyimpanan lokal peramban (`localStorage`) sehingga template kustom tetap tersimpan saat halaman dimuat ulang.
  - Tombol **Kembalikan Standar**: Mengembalikan template aktif ke format bahasa Indonesia formal standar PT KAM kapan saja dibutuhkan.
  - Area Pratinjau Teks Fleksibel: Mengubah kotak pratinjau pesan menjadi textarea yang dapat langsung disesuaikan secara instan per kandidat sebelum tombol *Kirim Pesan WhatsApp Langsung* dieksekusi.

---

## [2.6.0] - 2026-10-31
### Komponen Paginasi Universal & Optimalisasi Tampilan Tabel Data
Pembaruan berfokus pada implementasi komponen paginasi universal berstandar Apple HIG di seluruh tabel dan grid utama aplikasi. Fitur ini mencegah peramban memanjang tanpa batas ke bawah (*endless scrolling*), mempercepat proses *rendering* DOM, dan memberikan kontrol ukuran halaman yang fleksibel bagi staf rekruter.

### Added (Fitur Paginasi Universal)
* **Komponen Paginasi Mandiri (`public/js/app.js` - `renderPaginationBar`)**:
  - Didesain modular dengan parameter: `containerId`, `totalItems`, `currentPage`, `pageSize`, `pageSizeOptions`, `onPageChange`, `onPageSizeChange`, dan `itemLabel`.
  - Dilengkapi *Page Size Selector* kustom (pilihan: 5, 8, 15, 25 baris per halaman) dengan ikon panah SVG kustom.
  - Penomoran halaman cerdas berbentuk pil (*squircle*) dengan penanda halaman aktif *PT KAM Corporate Blue* (`bg-brand-600 text-white font-bold shadow-sm`).
  - Tombol kontrol *Sebelumnya* dan *Selanjutnya* yang otomatis berstatus dinonaktifkan (*disabled*) saat berada di batas awal atau batas akhir halaman, kini menggunakan ikon chevron SVG presisi (menggantikan teks karakter panah mentah).
  - Teks informasi rentang data dinamis (contoh: *Menampilkan 1 - 8 dari 34 kandidat*).
  - Penanganan status kosong (*Empty State*): Bilah paginasi otomatis disembunyikan jika total data adalah 0 atau jika seluruh tabel kosong.

### Changed (Implementasi Paginasi pada 4 Modul Utama)
* **1. Master Data Pelamar  (`tab-pelamar.html` & `public/js/pelamar.js`)**:
  - Kontainer paginasi `#pelamar-pagination` ditambahkan di bawah tabel master kandidat.
  - Default ukuran halaman: 8 kandidat per halaman.
  - Reset otomatis halaman ke halaman 1 saat staf melakukan pencarian teks atau mengubah filter status seleksi/posisi.
  - Penataan Baris Kolom Pelamar: Menghilangkan penayangan email dari antarmuka tabel kandidat (data email tetap tersimpan utuh di basis data), serta memisahkan nama pelamar dan nomor kontak ke dalam 1 baris tersendiri secara vertikal.
  - Penataan Vertikal Tombol Aksi: Menata tombol 'Lihat CV' dan 'Loloskan' secara bertumpuk 1 baris per tombol (stacked vertical layout), menghilangkan posisi horizontal berdampingan samping kanan-kiri agar lebar tabel lebih proporsional dan selaras dengan baris data lainnya.
* **2. Daftar Lowongan Kerja Sama Outsourcing (`tab-dashboard.html` & `public/js/dashboard.js`)**:
  - Kontainer paginasi `#dashboard-vacancies-pagination` ditambahkan di bawah tabel lowongan dashboard.
  - Default ukuran halaman: 5 lowongan per halaman.
  - Reset otomatis ke halaman 1 saat pencarian lowongan atau filter status/posisi diterapkan.
* **3. Permintaan Mitra Aktif (`tab-penyerahan.html` & `public/js/penyerahan.js`)**:
  - Kontainer paginasi `#mitra-vacancies-pagination` ditambahkan di bawah tabel CRUD permintaan mitra.
  - Default ukuran halaman: 5 permintaan per halaman.
  - Integrasi pemotongan data (*array slicing*) pada daftar lowongan yang telah difilter.
* **4. Kirim CV ke Mitra / Pihak Ketiga (`tab-penyerahan.html` & `public/js/penyerahan.js`)**:
  - Kontainer paginasi `#thirdparty-pagination` ditambahkan di bawah daftar/grid kandidat yang siap diserahkan ke mitra.
  - Default ukuran halaman: 5 kandidat per halaman.
  - Mendukung penyesuaian ukuran halaman instan dan navigasi halaman yang mulus.

---

## [2.5.0] - 2026-10-31
### Rute Khusus Halaman (Dedicated URL Routing) & Modul CRUD Master Mitra Pihak Ketiga
Pembaruan berfokus pada implementasi *Dedicated URL Routing* untuk setiap modul operasional, pemindahan daftar lowongan ringkas keluar dari bilah navigasi samping, serta perluasan tab *Kirim CV* menjadi modul komprehensif **Master Mitra Rekanan & Penyerahan Berkas CV** yang dilengkapi fitur CRUD penuh.

### Added (Fitur Baru & CRUD Master Mitra)
* **Dedicated URL Routing (Express & HTML5 PushState)**:
  - Setiap menu utama kini memiliki URL rute tersendiri yang dapat diakses langsung, direfresh, atau dibagikan:
    * `http://localhost:3000/dashboard` (dan `/`) &rarr; Dashboard & Rekapitulasi Bulanan
    * `http://localhost:3000/pelamar` &rarr; Data Pelamar Glints
    * `http://localhost:3000/interview` (alias `/jadwal`) &rarr; Jadwal & Follow-up WhatsApp
    * `http://localhost:3000/rekapitulasi` &rarr; Rekapitulasi Dua Tahap
    * `http://localhost:3000/mitra` (alias `/penyerahan`) &rarr; Master Mitra Rekanan & Kirim CV
  - Integrasi `window.history.pushState` dan pendengar *event* `popstate` untuk tombol *Back/Forward* peramban web.
* **RESTful CRUD Permintaan Mitra Aktif (`src/controllers/vacancyController.js` & `src/routes/vacancyRoutes.js`)**:
  - `GET /api/v1/vacancies`: Mendapatkan seluruh data permintaan mitra beserta metrik progres pemenuhan kuota.
  - `GET /api/v1/vacancies/:id`: Mengambil rincian data satu permintaan lowongan.
  - `POST /api/v1/vacancies`: Menambahkan permintaan posisi mitra baru (judul posisi, mitra, kota, kuota, usia maks, min. pendidikan, status).
  - `PUT /api/v1/vacancies/:id`: Memperbarui data permintaan mitra.
  - `PATCH /api/v1/vacancies/:id/status`: Mengubah cepat status lowongan (`Dibuka`, `Ditutup`, `Arsip`).
  - `DELETE /api/v1/vacancies/:id`: Menghapus data lowongan dengan proteksi relasi pelamar (`?force=true`).
* **Komponen Antarmuka Master Mitra (`public/components/tab-penyerahan.html`)**:
  - *Segmented Control Switcher*: Navigasi sub-tab instan antara **Permintaan Mitra Aktif** dan **Kirim CV ke Mitra**.
  - *4 Mini KPI Cards Mitra*: Total Posisi Lowongan, Target Kuota Mitra, Kandidat Lolos Seleksi, dan Rasio Pemenuhan Kuota.
  - *Filter & Pencarian*: Cari posisi/mitra secara instan dan saring berdasarkan status (`Dibuka` / `Ditutup` / `Arsip`).
  - *Tabel Interaktif*: Dilengkapi bar progres persentase kuota terisi, tombol *toggle status*, tombol edit, dan tombol hapus.
* **Modal Form Interaktif (`public/components/modals.html`)**:
  - `modal-vacancy`: Formulir modal untuk Tambah & Edit Permintaan Mitra.
  - `modal-delete-vacancy`: Dialog konfirmasi penghapusan aman dengan peringatan jumlah pelamar terhubung.

### Changed (Refaktorisasi & Pembersihan Navigasi)
* **Pembersihan Indikator UI**: Menghapus badge statis Kanal Glints: Sinkron pada header utama dan teks Sinkronisasi Data Real-time MySQL pada sub-nav Master Mitra.
* **Pembersihan Bilah Navigasi (`public/components/sidebar.html`)**:
  - Menghapus blok ringkas lowongan (`<!-- Lowongan Aktif Ringkas -->`) dari dalam bilah navigasi samping desktop agar navigasi menjadi bersih dan terfokus.
  - Mengubah label menu navigasi ke-5 menjadi **Master Mitra & Kirim CV**.
* **Sinkronisasi Otomatis**:
  - Berkas modul antarmuka dan skrip klien telah disinkronkan ke direktori `Laporan/`.

---

## [2.4.0] - 2026-10-31
### Eliminasi Data Fiktif & Agregasi Statistik Rekrutmen Bulanan Dinamis MySQL
Pembaruan berfokus pada penghapusan total seluruh data angka fiktif/dummy dan implementasi agregasi data real-time 100% dinamis langsung dari tabel tunggal kebenaran (*Single Source of Truth*) `candidates` di database MySQL `kam_recruit_db`.

### Removed (Penghapusan Data Fiktif & Skrip Seed)
* **Tabel Fiktif `recruitment_monthly_stats`**: Dihapus secara permanen dari basis data (`DROP TABLE IF EXISTS recruitment_monthly_stats;`).
* **Berkas Seed Fiktif (`src/database/seedMonthlyStats.js`)**: Dihapus permanen dari repositori proyek.
* **Array Fallback Statis di Frontend (`renderMonthlyBarsFallback`)**: Dihapus seluruhnya dari `public/js/dashboard.js`.

### Changed (Agregasi SQL Murni & Pemetaan Tanggal Melamar)
* **`dashboardController.js` (`getMonthlyStats`)**:
  - Menggunakan kueri SQL dinamis murni untuk menghitung `total_incoming` (`COUNT(*)`) dan `total_accepted` (`SUM(CASE WHEN status_hrd = 'Lolos Seleksi HRD' THEN 1 ELSE 0 END)`) dikelompokkan per bulan (`MONTH(created_at)`) untuk tahun yang dipilih.
  - Daftar pilihan tahun (`availableYears`) diambil secara dinamis dari `SELECT DISTINCT YEAR(created_at) AS year FROM candidates WHERE created_at IS NOT NULL ORDER BY year DESC`.
  - Menghasilkan array lengkap 12 bulan kalender (Januari - Desember) dengan status nol murni (`masuk = 0, diterima = 0`) jika tidak ada kandidat pada bulan tersebut.
* **`applicantController.js` (Glints Importer)**:
  - Menyematkan pemetaan nilai `appliedAt` dari berkas impor Excel/CSV Glints langsung ke kolom `created_at` di tabel `candidates`, sehingga kandidat yang diimpor secara otomatis masuk ke bulan dan tahun pendaftaran yang sebenarnya.
* **`public/js/dashboard.js`**:
  - Visualisasi batang bulanan dan tabel rekapitulasi merender data nyata dari endpoint `/api/v1/dashboard/monthly-stats`.
  - Tooltip interaktif menampilkan keterangan *"Tidak ada pendaftaran berkas masuk pada bulan ini (0 Pelamar)"* untuk bulan dengan nilai nol.

---

## [2.3.0] - 2026-10-31
### Modularisasi Komponen Antarmuka (Component-Based View Architecture)
Pembaruan berfokus pada refaktorisasi arsitektur frontend: memecah berkas monolitik `public/index.html` (~2.800 baris) menjadi modul-modul komponen antarmuka (*HTML Components*) dan modul skrip JavaScript yang terisolasi dan mudah dipelihara.

### Added (Struktur Komponen Baru)
* **Direktori Komponen Antarmuka (`public/components/`)**:
  - `header.html`: Top Bar navigasi, jam real-time, status Glints, dan avatar pengguna.
  - `sidebar.html`: Navigasi samping desktop, kartu kuota mitra, dan ringkasan lowongan aktif.
  - `mobile-nav.html`: Bilah navigasi melayang bawah khusus mobile (*Dock Floating Tab Bar*).
  - `tab-dashboard.html`: Hero banner, 4 KPI cards, grafik bulanan Jan&ndash;Des, dan tabel lowongan.
  - `tab-pelamar.html`: Toolbar pencarian/filter dan tabel Master Data Pelamar.
  - `tab-interview.html`: Daftar pelamar lolos sortir dan panel pratinjau pesan otomatis WhatsApp.
  - `tab-rekapitulasi.html`: Tampilan rekapitulasi dua tahap (Tahap I & Tahap II) beserta tombol ekspor CSV/Excel.
  - `tab-penyerahan.html`: Kartu kandidat lolos HRD siap diserahkan ke mitra (1 kolom vertikal).
  - `modals.html`: Dialog modal dossier pelamar, penilaian wawancara HRD, dan impor berkas Glints.
  - `toast.html`: Komponen notifikasi mengambang.
* **Direktori Skrip Modular (`public/js/`)**:
  - `app.js`: State manajemen utama, routing tab, jam, dan penanganan inisialisasi aplikasi.
  - `dashboard.js`: Logika metrik KPI, lowongan mitra, dan grafik batang rekrutmen bulanan.
  - `pelamar.js`: Logika parsing pelamar, filter tabel, pencarian, dan persetujuan sortir massal.
  - `interview.js`: Logika penjadwalan wawancara, toggle konfirmasi kehadiran, dan integrasi template WA.
  - `rekapitulasi.js`: Logika peralihan Tahap I/II dan ekspor lembar rekapitulasi.
  - `penyerahan.js`: Logika penyerahan CV ke mitra dan pengunduhan bundel ZIP.
  - `modals.js`: Logika interaktif dossier pelamar, scoring modal, dan impor data Glints.
* **Master Layout & View Assembler**:
  - `public/index.template.html`: Berkas tata letak induk yang bersih (~140 baris) menggunakan direktif inklusi `<!-- @include 'components/...' -->`.
  - `src/utils/viewAssembler.js`: Utilitas otomatisasi kompilasi komponen saat boot server dan runtime `GET /`.

---

## [2.2.0] - 2026-10-31
### Grafik Rekapitulasi Rekrutmen Bulanan (Jan - Des) & Redesain Dashboard
Pembaruan berfokus pada peremajaan antarmuka Dashboard utama sesuai arahan pengguna: mengeliminasi kartu Quick Action dan Funnel Pipeline lama, serta menghadirkan visualisasi analitik tren rekrutmen tahunan per bulan (Januari s/d Desember) berbasis database MySQL.

### Added (Fitur Baru)
* **Grafik Rekapitulasi Rekrutmen Bulanan (Januari s/d Desember)**:
  - Visualisasi batang ganda interaktif (*Dual-Bar Chart*) berstandar Apple HIG yang membandingkan **Kandidat Masuk (Glints)** (*Deep Blue*) dan **Kandidat Diterima/Lolos HRD** (*Emerald*) untuk 12 bulan penuh (Jan &ndash; Des).
  - **Pemilih Rekapitulasi Tahun (*Year Selector*)**: Dropdown dinamis (*2026, 2025, dst.*) untuk beralih arsip tahunan secara instan.
  - **Strip Ringkasan KPI Tahunan**: Kartu metrik otomatis menghitung Total Berkas Masuk, Total Diterima, Rata-Rata Tingkat Kelulusan (*Conversion Rate*), dan Bulan Puncak Rekrutmen.
  - **Tooltip Interaktif & View Switcher**: Menampilkan detail angka saat batang disentuh/di-hover, serta tombol switcher untuk beralih antara tampilan **Grafik Batang** dan **Tabel Rincian Angka**.
* **Endpoint API Real-Time MySQL**:
  - Endpoint baru `GET /api/v1/dashboard/monthly-stats?year=YYYY` terhubung ke tabel MySQL `recruitment_monthly_stats`.

### Removed (Pembersihan Antarmuka)
* Menghapus kontainer `Quick Action & Glints Sync Card` (Operasional HRD Cepat).
* Menghapus diagram `RECRUITMENT FUNNEL PIPELINE VISUALIZATION` (Alur Funnel Rekrutmen PT KAM).
* Menata ulang tabel `Daftar Lowongan Kerja Sama Outsourcing` menjadi tabel lapang berlebar penuh (*Full-Width Table*).

---

## [2.1.1] - 2026-10-31
### Perbaikan Tampilan Desktop Tab 3 & Tab 5 (Desktop Responsiveness & Anti-Crush)
Pembaruan berfokus pada resolusi kendala tampilan terlipat (*crushed layout*) pada desktop mode di Tab 3 (Jadwal & Follow-up WA) dan Tab 5 (Kirim CV ke Mitra) sesuai laporan audit visual.

### Changed (Penyempurnaan & Perbaikan Antarmuka Desktop)
* **Desain Ulang Kartu Pelamar Tab 3 (Jadwal & Follow-up WA)**:
  - Mengubah layout kartu dari skema horizontal berdampingan menjadi layout kartu bertingkat 3 baris (*Apple HIG Structured Stack*).
  - **Baris 1 (Identitas & Status)**: Avatar inisial, nama lengkap pelamar tanpa pemotongan/elipsis (`Anisa Rahmawati` bukan `Anis...`), posisi lowongan, mitra rekanan, serta lencana status (`Tahap I Lolos`, `Bersedia Hadir`, `Lolos Wawancara HRD`) diberikan lebar penuh container.
  - **Baris 2 (Metadata & Catatan)**: Kontainer latar slate halus menampilkan jadwal wawancara terformat, nomor kontak WhatsApp, dan catatan HRD.
  - **Baris 3 (Bilah Aksi Mandiri)**: 4 tombol operasional (`Detail CV`, `Keputusan Wawancara`, `Ubah Respon`, `Kirim WA`) dialokasikan pada bilah bawah mandiri (*dedicated bottom toolbar*) sehingga tidak lagi menjepit kolom informasi pelamar.
  - **Filter Status 1 Baris**: Menjaga tombol filter (`Semua`, `Bersedia`, `Drop`) tetap berada dalam satu baris rapi tanpa patah dua baris.
  - **Pembersihan Badge Redundan**: Menghapus lencana `PT KAM Official` pada panel pratinjau pesan otomatis WhatsApp.
* **Desain Ulang Kartu Kandidat Terpilih Tab 5 (Kirim CV ke Mitra)**:
  - **Eliminasi Teks Terlipat pada Header**: Menyatukan lencana status menjadi `Tahap II &bull; Lolos HRD` dalam satu kapsul kohesif, meniadakan pemisahan `• Tahap II` yang sebelumnya terhimpit menjadi 3 baris vertikal di sebelah kotak `Hasil Wawancara`.
  - **Pemisahan Pendidikan**: Menata baris `Kualifikasi:` dengan `shrink-0` dan nilai kampus/jurusan dengan `break-words flex-1 min-w-0` sehingga nama institusi yang panjang tidak menabrak label.
  - **Penggantian Emoji Font ke Vektor SVG**: Mengganti emoji raw (`💼`, `📜`) dengan ikon vektor SVG kustom beresolusi tinggi (*Briefcase* dan *Award Certificate*).
  - **Penataan Responsivitas Grid**: Mengubah breakpoint grid menjadi `grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5`, memberikan ruang lapang (~390px) pada resolusi laptop standar desktop (1024-1366px).

---

## [2.1.0] - 2026-10-31
### Isolasi Direktori kam-recruit, Migrasi Dinamis MySQL, & Navigasi Mobile Melayang
Pembaruan berfokus pada ketelitian struktural arsitektur, pembersihan seluruh mock data hardcode menjadi 100% dinamis terhubung ke MySQL 8.0, perbaikan menyeluruh pada alur interaktif wawancara HRD (Tab 3), serta transformasi antarmuka mobile berstandar Apple HIG.

### Added (Fitur & Penyempurnaan Baru)
* **Isolasi Penuh Direktori Aplikasi `kam-recruit/`**:
  - Seluruh kode sumber backend Express.js, router API, controller, model, berkas migrasi database, dan aset antarmuka publik dipisahkan secara rapi ke dalam folder tersendiri `kam-recruit/`.
* **Migrasi Data Dinamis Total (Single Source of Truth MySQL 8.0)**:
  - Mengeliminasi seluruh mock data array statis pada antarmuka. 4 kartu metrik KPI, target kuota, tabel lowongan mitra aktif, dan diagram Funnel 6-Tahap kini dipasok 100% secara real-time dari database MySQL melalui endpoint `/api/v1/dashboard/metrics`, `/api/v1/dashboard/vacancies`, dan `/api/v1/applicants`.
* **Arsitektur Navigasi Mobile Melayang (*Floating Mobile Navigation*)**:
  - **Floating Mobile Bottom Navigation Bar (`#mobile-bottom-nav`)**: Bilah navigasi melayang tetap di dasar layar ponsel dengan 5 tab interaktif instan (Dashboard, Pelamar, Jadwal WA, Rekap, Mitra) berstandar aplikasi mobile modern.
  - **Floating Slide-Over Drawer Overlay (`#sidebar-nav`)**: Menu hamburger pada header mobile membuka drawer melayang berlatar belakang gelap buram (*backdrop blur overlay*) yang tidak merusak tata letak konten utama (*no layout shift*).
  - Penambahan *safe area bottom padding* (`pb-24 lg:pb-6`) agar seluruh kartu dan tabel data dapat digulir bebas tanpa terhalang bilah navigasi.
* **Perbaikan Alur Interaktif Tab 3: Jadwal & Follow-up**:
  - Penambahan tombol aksi pembuka berkas CV (**"Detail CV"**) dan tautan nama pelamar langsung ke modal dossier pelamar Glints.
  - Penambahan 3 badge status lengkap pada kartu pelamar: *Lolos Sortir (Tahap I)*, *Konfirmasi WA (Bersedia/Tidak Merespons)*, dan *Keputusan Wawancara HRD (Lolos Seleksi/Tidak Lolos/Menunggu)*.
  - Fitur interaktif **Kandidat Tujuan WA**: Tombol "Kirim WA" pada kartu pelamar otomatis mengaitkan kandidat ke panel kanan, memuat template pratinjau pesan dinamis, dan menghubungkan ke tautan resmi `https://wa.me/...`.
  - Penambahan komponen *Apple HIG Empty State Card* ketika filter menghasilkan 0 data kandidat.
* **Aksesibilitas Modal Dialog Global**:
  - Penambahan listener global penutupan modal via klik area latar gelap (*backdrop click*) dan tombol keyboard `Escape` pada ketiga modal (`#modal-candidate`, `#modal-scoring`, `#modal-import`).

### Changed (Pembersihan Salinan Teks & Perbaikan)
* **Pembersihan Salinan Teks Antarmuka (*UX Copy Clean-up*)**:
  - Menghapus badge redundan `PT KAM Official` pada header navigasi.
  - Menghapus teks teknis internal `(Anti-Overwriting)` dari modal footer dan badge judul funnel.
  - Menyederhanakan subtitle Tab 3 dari rumusan kendala internal menjadi teks operasional yang profesional: *"Pelacakan tindak lanjut respon dan konfirmasi jadwal wawancara kandidat"*.
  - Menghapus tag developer `(USER REQUEST)` dan merapikan label navigasi penyerahan mitra menjadi *"Kirim CV ke Mitra"*.
* **Perbaikan Pencarian ID Kandidat (Strict Equality Bugfix)**:
  - Mengubah perbandingan pencarian `item.id === id` menjadi `item.id == id` di seluruh fungsi lookup pelamar untuk mencegah kegagalan pembukaan modal akibat perbedaan tipe string dan integer.

---

## [2.0.0] - 2026-10-31
### Arsitektur Node.js Express, Docker Multi-Container, & CI/CD Pipeline
Pembaruan besar pada fondasi arsitektur sistem (**ARC-KAM-04 v2.0.0**) yang memformalkan tumpukan teknologi backend, alur otomasi rilis perangkat lunak, serta ketahanan penanganan data pelamar eksternal.

### Added (Fitur & Arsitektur Baru)
* **Backend REST API Express.js**:
  - Penetapan resmi **Node.js (Express.js)** sebagai mesin server backend utama menggantikan opsi framework multi-bahasa.
  - Integrasi pustaka inti: `multer` (penanganan berkas unggahan), `exceljs` (parser tangguh 28 kolom Glints), `archiver` (streaming pembentuk berkas arsip ZIP CV mitra), dan `mysql2` (manajemen connection pool dengan transaksi ACID).
* **Penetapan Peran Prototipe UI/UX (`index.html`)**:
  - Penegasan status arsitektural: berkas `index.html` pada direktori `Laporan/` berfungsi sebagai **Acuan Referensi Desain Interaktif UI/UX (*Living UI/UX Design Reference*)** berstandar Apple HIG. Pada fase produksi, antarmuka ini disajikan secara statis oleh Express (`express.static('public')`) dan mengonsumsi endpoint REST API secara asinkronus (`fetch()`).
* **Arsitektur Kontainerisasi Docker**:
  - Konfigurasi multi-kontainer Docker Compose: `kam-nginx` (:80, :443), `kam-app` Express.js (:3000), `kam-db` MySQL 8.0 (:3306), dan `kam-redis` (:6379).
  - Multi-stage `Dockerfile` (`node:20-alpine`) yang menghasilkan image produksi ultra-ringan (< 120 MB) dengan hak akses keamanan non-root (`USER node`).
  - Pemisahan persistent Docker volume untuk berkas CV (`kam_cv_storage`), arsip Excel (`kam_excel_storage`), dan data database (`kam_db_data`).
* **Pipeline Otomasi CI/CD (GitHub Actions)**:
  - Alur 5 tahapan otomatis: (1) Linting sintaks ESLint, (2) Pengujian unit test Jest & Supertest, (3) Build Docker & pemindaian celah keamanan CVE dengan Trivy, (4) Deployment otomatis tanpa henti (*zero-downtime rolling update*) ke server PT KAM via SSH, dan (5) Smoke test otomatis endpoint `/api/v1/health` dengan rollback instan jika gagal.
* **Format Berkas Ekspor Glints Dummy (.xlsx & .csv)**:
  - Pembuatan berkas dummy [Data_Pelamar_Glints_Dummy.xlsx](file:///d:/A11.2025.16609/SEMESTER%203/KERJA%20PRAKTEK/Laporan/Data_Pelamar_Glints_Dummy.xlsx) (28 kolom terstandarisasi dengan header biru korporat PT KAM `#0F3D78`) dan versi CSV-nya [Data_Pelamar_Glints_Dummy.csv](file:///d:/A11.2025.16609/SEMESTER%203/KERJA%20PRAKTEK/Laporan/Data_Pelamar_Glints_Dummy.csv).
  - Memuat data riil kandidat senior **Imam Kuswoyo** (44 tahun, SMK Elektronika, 12 tahun pengalaman, Lindu Aji, Pemuda Pancasila) serta variasi pelamar lulusan baru (*fresh graduate*) untuk menguji ketahanan skema (*Flexible Nullable Design*).
* **Pencatatan Keputusan Arsitektur ADR-008**: Dokumentasi formal pemilihan Express.js, Docker, CI/CD, dan peran `index.html` pada `docs/12_decision_log.md`.

### Fixed
* Perbaikan kesalahan sintaks tanda penutup ganda `}););` pada skrip JavaScript [index.html](file:///d:/A11.2025.16609/SEMESTER%203/KERJA%20PRAKTEK/Laporan/index.html) sehingga seluruh tombol navigasi tab sidebar kembali berfungsi normal dan responsif.

---

## [1.0.0] - 2026-10-30
### Tonggak Rilis Produksi (*Official Initial Production Release*)
Rilis penuh versi 1.0.0 menandai penyelesaian prototipe sistem operasional manajemen rekrutmen terpadu **KAM Recruit** untuk PT Kinarya Alihdaya Mandiri, mencakup seluruh siklus seleksi dari pendaftaran Glints hingga penyerahan berkas kandidat terpilih ke pihak ketiga.

### Added (Fitur Baru Ditambahkan)
* **Branding Resmi KAM Recruit**: Integrasi nama sistem resmi *KAM Recruit* pada header navigasi, title halaman, kartu workspace recruiter, dan laporan akademik.
* **Modul Dossier CV Eksekutif**:
  - Modal pratinjau lembar CV lengkap dengan identitas terverifikasi (*Glints Verified*).
  - Riwayat pengalaman kerja (*work experience timeline*) lengkap dengan nama instansi, jabatan, durasi, dan daftar poin tugas operasional terukur.
  - Kartu sertifikasi lisensi resmi (*accredited certificates*) yang mencantumkan nama lisensi (BNSP, Kemnaker, Microsoft), nomor registrasi kredensial, dan lencana validitas.
  - Tag keahlian teknis dan kemampuan interpersonal (*competencies pills*).
* **Fitur Cetak Bersih Dokumen CV A4**: Implementasi *print stylesheet* `@media print` murni yang mengisolasi lembar CV saat dicetak (`Ctrl+P` atau tombol cetak), menyembunyikan bilah navigasi dan tombol antarmuka untuk menghasilkan dokumen cetak A4 yang bersih.
* **Fitur Salin Ringkasan Profil**: Tombol satu klik untuk menyalin seluruh ringkasan CV kandidat ke *clipboard* perangkat recruiter.
* **Kolom Pengalaman & Sertifikat pada Bank Pelamar**: Menampilkan sekilas durasi masa kerja dan jumlah sertifikat terverifikasi pada tabel utama Glints.
* **Dokumentasi Rekayasa Perangkat Lunak Lengkap**: Penerbitan 14 dokumen teknis terstruktur di direktori `docs/` (BRD, PRD, FRD, SRS, Arsitektur, Basis Data, Desain UI/UX, Routing API, Pengujian QA/UAT, User Manual, Deployment Docker, Keamanan OWASP/UU PDP, Decision Log ADR, dan Changelog).

### Changed (Penyempurnaan & Perubahan)
* **Penyederhanaan Evaluasi Wawancara HRD (Tahap II)**:
  - Mengganti rubrik penilaian angka numerik terbobot (30% komunikasi, 30% sikap, 40% teknis) menjadi **dropdown keputusan langsung**: `Lolos Seleksi HRD` dan `Tidak Lolos`, dilengkapi catatan evaluator wawancara kualitatif.
  - Menghapus tampilan angka skor numerik pada kartu penyerahan berkas mitra dan tabel Rekapitulasi Tahap II, menggantikannya dengan lencana status hasil wawancara resmi.
* **Penghapusan Ornamen AI-Slop**:
  - Menghapus seluruh garis aksen samping vertikal tebal (`w-1.5 h-full absolute left-0 top-0`).
  - Mengubah latar belakang kartu utama dan banner penyerahan berkas dari hitam gelap (`bg-slate-900`) menjadi putih bersih (`bg-white`) berbingkai tipis halus sesuai standar Apple HIG.
* **Solusi Definitif Teks Badge Terlipat**:
  - Mengunci seluruh elemen badge dengan kelas CSS `whitespace-nowrap shrink-0`.
  - Menerapkan `min-w-0 flex-1 truncate` pada label pendamping.
  - Menyesuaikan breakpoint grid kartu KPI atas menjadi `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4` sehingga tertata 2×2 lapang di layar laptop kantor (1024px–1279px) dan 4 kolom sejajar di layar lebar.
* **Standardisasi Etika WhatsApp**: Menghapus seluruh karakter emoji pada template pesan resmi WhatsApp PT KAM untuk menjaga profesionalisme korporat alihdaya.

---

## [0.3.0] - 2026-10-30
### Added
* Pengayaan data kandidat terdata dengan struktur array pengalaman kerja mendalam dan sertifikasi profesi riil (BNSP Customer Care Officer, BNSP Teknisi FTTH, BNSP Logistik CSCA, K3 Ketinggian Kemnaker).
* Penambahan kartu ringkasan pengalaman dan sertifikasi pada grid kandidat siap kirim di Tab Penyerahan Berkas Mitra.

---

## [0.2.1] - 2026-10-30
### Fixed
* Perbaikan pembengkokan teks pada kartu KPI (mengatasi masalah badge `+12 Hari Ini` dan `40% Respons` yang sempat terlipat menjadi 2–3 baris).
* Penggantian tombol berpanah teks `Kelola Pelamar →` menjadi tombol sekunder bergaya Apple HIG yang profesional `Data Pelamar`.

---

## [0.2.0] - 2026-10-29
### Added
* Pembangunan purwarupa interaktif `Laporan/index.html` berbasis desktop-first responsive menggunakan HTML5, Tailwind CSS, dan Vanilla JavaScript.
* Penerapan palet warna resmi jenama PT KAM: *Corporate Blue* (`#0F3D78`) dan *Corporate Red* (`#D32F2F`).
* Implementasi modul alur kerja seleksi: Dashboard Funnel, Bank Pelamar Glints, Pelacak Undangan Wawancara WhatsApp, Rekapitulasi Tahap I & II, serta Katalog Penyerahan Berkas Mitra.
* Form modal penilaian wawancara HRD digital dan simulasi impor data Glints.

---

## [0.1.0] - 2026-10-28
### Added
* Pemodelan visual proses bisnis berjalan (*As-Is*) menggunakan PlantUML *Activity Diagram* pada `Laporan/Alur Pelamar.md`.
* Analisis akar masalah (*Root Cause Analysis*) penanganan seleksi pelamar Glints dan kerapuhan spreadsheet tunggal.
* Penyusunan naskah akademik Laporan Kerja Praktik UDINUS Bab I (Pendahuluan) dan Bab II (Landasan Teori) dalam format Markdown dan dokumen Microsoft Word (`BAB I dan BAB II.docx`) berstandar pedoman penulisan Fakultas Ilmu Komputer UDINUS.

