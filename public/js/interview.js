/**
 * KAM RECRUIT - Jadwal & Follow-up Wawancara (WA Gateway) Module
 */

let interviewCurrentPage = 1;
let interviewPageSize = 5;
let currentInterviewList = [];
let currentInterviewOpFilter = 'active'; // 'active' | 'completed' | 'all'

function switchInterviewOperationalFilter(opFilter) {
  currentInterviewOpFilter = opFilter;
  interviewCurrentPage = 1;

  const btnActive = document.getElementById('op-filter-active');
  const btnCompleted = document.getElementById('op-filter-completed');
  const btnAll = document.getElementById('op-filter-all');

  const activeClass = 'px-4 py-2 rounded-xl transition shadow-xs bg-blue-900 text-white cursor-pointer flex items-center space-x-2';
  const inactiveClass = 'px-4 py-2 rounded-xl transition text-slate-600 hover:text-slate-900 hover:bg-white/60 cursor-pointer flex items-center space-x-2';

  if (btnActive) btnActive.className = (opFilter === 'active') ? activeClass : inactiveClass;
  if (btnCompleted) btnCompleted.className = (opFilter === 'completed') ? activeClass : inactiveClass;
  if (btnAll) btnAll.className = (opFilter === 'all') ? activeClass : inactiveClass;

  const updateOpBadgeStyle = (btn, isActive) => {
    const badge = btn ? btn.querySelector('span:last-child') : null;
    if (badge) {
      badge.className = isActive
        ? 'px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white'
        : 'px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700';
    }
  };
  updateOpBadgeStyle(btnActive, opFilter === 'active');
  updateOpBadgeStyle(btnCompleted, opFilter === 'completed');
  updateOpBadgeStyle(btnAll, opFilter === 'all');

  const titleEl = document.getElementById('interview-list-title');
  const descEl = document.getElementById('interview-list-desc');
  if (titleEl && descEl) {
    if (opFilter === 'active') {
      titleEl.textContent = 'Antrean Kandidat Wawancara Aktif';
      descEl.textContent = 'Pelamar yang perlu diatur jadwalnya, dikonfirmasi kehadiran via WA, dan dinilai HRD';
    } else if (opFilter === 'completed') {
      titleEl.textContent = 'Kandidat Selesai Wawancara & Diserahkan';
      descEl.textContent = 'Kandidat yang telah selesai dievaluasi HRD atau telah diserahkan berkasnya ke mitra';
    } else {
      titleEl.textContent = 'Seluruh Riwayat Kandidat Lolos Seleksi Berkas';
      descEl.textContent = 'Menampilkan semua kandidat lolos tahap sortir berkas dari awal siklus';
    }
  }

  renderInterviewCards(currentInterviewFilter);
}

function filterInterviewStatus(filter) {
  currentInterviewFilter = filter;
  interviewCurrentPage = 1;
  renderInterviewCards(filter);

  const btnAll = document.getElementById('btn-filter-int-all');
  const btnBersedia = document.getElementById('btn-filter-int-bersedia');
  const btnDrop = document.getElementById('btn-filter-int-drop');

  const activeClass = 'px-2.5 py-1 rounded-lg bg-blue-900 text-white font-bold cursor-pointer transition flex items-center';
  const inactiveClass = 'px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer transition flex items-center';

  if (btnAll) btnAll.className = (filter === 'ALL') ? activeClass : inactiveClass;
  if (btnBersedia) btnBersedia.className = (filter === 'Bersedia') ? activeClass : inactiveClass;
  if (btnDrop) btnDrop.className = (filter === 'Tidak Merespons') ? activeClass : inactiveClass;

  const updateBadgeStyle = (btn, isActive) => {
    const badge = btn ? btn.querySelector('span:last-child') : null;
    if (badge) {
      badge.className = isActive
        ? 'ml-1.5 px-1.5 py-0.2 rounded text-[10px] bg-white/20 font-bold leading-tight text-white'
        : 'ml-1.5 px-1.5 py-0.2 rounded text-[10px] bg-slate-200/80 font-bold leading-tight text-slate-700';
    }
  };
  updateBadgeStyle(btnAll, filter === 'ALL');
  updateBadgeStyle(btnBersedia, filter === 'Bersedia');
  updateBadgeStyle(btnDrop, filter === 'Tidak Merespons');
}

function renderInterviewCards(filter = currentInterviewFilter) {
  const listContainer = document.getElementById('interview-list');
  if (!listContainer) return;
  listContainer.innerHTML = '';

  const lolosSortirCandidates = (candidates || []).filter(c => c.statusSortir === 'Lolos Sortir');

  // Categorize based on operational status
  const isCompleted = (c) => (c.statusHRD && c.statusHRD !== 'Menunggu Seleksi') || !!c.diserahkan;
  const isActive = (c) => (!c.statusHRD || c.statusHRD === 'Menunggu Seleksi') && !c.diserahkan;

  const activeCandidates = lolosSortirCandidates.filter(isActive);
  const completedCandidates = lolosSortirCandidates.filter(isCompleted);

  // Update Operational Count Badges
  const opActiveBadge = document.getElementById('op-count-active');
  if (opActiveBadge) opActiveBadge.textContent = activeCandidates.length;

  const opCompletedBadge = document.getElementById('op-count-completed');
  if (opCompletedBadge) opCompletedBadge.textContent = completedCandidates.length;

  const opAllBadge = document.getElementById('op-count-all');
  if (opAllBadge) opAllBadge.textContent = lolosSortirCandidates.length;

  // Determine active pool based on selected operational tab
  let opPool = lolosSortirCandidates;
  if (currentInterviewOpFilter === 'active') {
    opPool = activeCandidates;
  } else if (currentInterviewOpFilter === 'completed') {
    opPool = completedCandidates;
  }

  const confirmed = opPool.filter(c => c.statusInterview === 'Bersedia').length;
  const notConfirmed = opPool.filter(c => c.statusInterview !== 'Bersedia').length;

  const hdrBadge = document.getElementById('interview-header-badge');
  if (hdrBadge) hdrBadge.textContent = `${confirmed} Bersedia, ${notConfirmed} Belum Konfirmasi`;

  const cntAll = document.getElementById('count-interview-all');
  if (cntAll) cntAll.textContent = opPool.length;
  const cntBersedia = document.getElementById('count-interview-bersedia');
  if (cntBersedia) cntBersedia.textContent = confirmed;
  const cntDrop = document.getElementById('count-interview-drop');
  if (cntDrop) cntDrop.textContent = notConfirmed;

  let filtered = opPool;
  if (filter === 'Bersedia') {
    filtered = filtered.filter(c => c.statusInterview === 'Bersedia');
  } else if (filter === 'Tidak Merespons') {
    filtered = filtered.filter(c =>
      c.statusInterview === 'Tidak Merespons' ||
      c.statusInterview === 'Menolak' ||
      (c.statusHRD && typeof c.statusHRD === 'string' && c.statusHRD.includes('Tidak Lolos'))
    );
  }

  // Automatically select first candidate for WA preview if none selected or current is out of filtered pool
  if ((!selectedWaCandidate || !filtered.some(c => c.id == selectedWaCandidate.id)) && filtered.length > 0) {
    selectedWaCandidate = filtered[0];
  }
  updateWaPreviewText();

  // Empty State (Apple HIG Clean Card)
  const paginationContainer = document.getElementById('interview-pagination');
  if (filtered.length === 0) {
    if (paginationContainer) paginationContainer.innerHTML = '';
    const emptyCategory = currentInterviewOpFilter === 'active' 
      ? 'Antrean Aktif' 
      : (currentInterviewOpFilter === 'completed' ? 'Selesai Wawancara' : 'Semua Riwayat');
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'p-8 text-center space-y-3 bg-white';
    emptyDiv.innerHTML = `
          <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <h4 class="text-xs font-bold text-slate-800">Tidak Ada Pelamar di ${emptyCategory} (${filter === 'ALL' ? 'Semua' : (filter === 'Bersedia' ? 'Bersedia' : 'Belum Respons')})</h4>
            <p class="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
              ${currentInterviewOpFilter === 'active' 
                ? 'Seluruh kandidat lolos berkas saat ini telah selesai dievaluasi atau diserahkan ke mitra. Anda dapat memeriksa tab Selesai Wawancara atau meloloskan pelamar baru di Master Data Pelamar.' 
                : 'Belum ada kandidat pada kategori filter ini.'}
            </p>
          </div>
          <div class="flex items-center justify-center gap-2 pt-1">
            <button onclick="switchInterviewOperationalFilter('all')" class="px-3.5 py-1.5 rounded-xl bg-blue-900 text-white font-bold text-xs hover:bg-blue-800 transition cursor-pointer">
              Tampilkan Semua Riwayat
            </button>
            <button onclick="switchTab('pelamar')" class="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer">
              Buka Master Data Pelamar
            </button>
          </div>
        `;
    listContainer.appendChild(emptyDiv);
    return;
  }

  currentInterviewList = filtered;

  // Calculate pagination slice
  const totalPages = Math.max(1, Math.ceil(filtered.length / interviewPageSize));
  if (interviewCurrentPage > totalPages) interviewCurrentPage = totalPages;
  const startIndex = (interviewCurrentPage - 1) * interviewPageSize;
  const pageItems = filtered.slice(startIndex, startIndex + interviewPageSize);

  pageItems.forEach(c => {
    // Badges calculation
    let interviewBadge = '';
    if (c.statusInterview === 'Bersedia') {
      interviewBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap shrink-0">Bersedia Hadir</span>';
    } else {
      interviewBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap shrink-0">Belum Respons</span>';
    }

    let hrdBadge = '';
    if (c.diserahkan) {
      hrdBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300 whitespace-nowrap shrink-0">Diserahkan ke Mitra</span>';
    } else if (c.statusHRD === 'Lolos Seleksi HRD') {
      hrdBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300 whitespace-nowrap shrink-0">Lolos Wawancara HRD</span>';
    } else if (c.statusHRD === 'Tidak Lolos') {
      hrdBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200 whitespace-nowrap shrink-0">Tidak Lolos HRD</span>';
    } else {
      hrdBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap shrink-0">Menunggu Evaluasi HRD</span>';
    }

    const initials = c.nama.split(' ').map(n => n[0]).slice(0, 2).join('');
    const isSelectedForWa = selectedWaCandidate && selectedWaCandidate.id == c.id;

    const avatarHtml = isSelectedForWa
      ? `<div class="w-9 h-9 rounded-xl bg-blue-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs ring-2 ring-blue-900/20">${initials}</div>`
      : `<div class="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">${initials}</div>`;

    const waButtonHtml = isSelectedForWa
      ? `<button onclick="selectCandidateForWa(${c.id})" title="Kandidat ini sedang aktif pada formulir pesan WhatsApp"
              class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center space-x-1.5 shadow-2xs cursor-pointer">
              <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span>Penerima Aktif</span>
            </button>`
      : `<button onclick="selectCandidateForWa(${c.id})" title="Siapkan draf pesan WhatsApp untuk kandidat ini"
              class="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer">
              <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span>Kirim Pesan</span>
            </button>`;

    const div = document.createElement('div');
    div.className = `p-4 sm:p-5 transition space-y-3 ${isSelectedForWa
        ? 'bg-blue-50/70 ring-1 ring-inset ring-blue-900/15'
        : 'hover:bg-slate-50/80'
      }`;
    div.innerHTML = `
          <!-- Row 1: Candidate Identity & Badges (Never truncated, full width) -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div class="flex items-center space-x-3 min-w-0">
              ${avatarHtml}
              <div class="min-w-0">
                <button onclick="openCandidateDetail(${c.id})" class="text-slate-900 text-sm font-bold hover:text-blue-900 hover:underline cursor-pointer transition text-left block truncate">
                  ${c.nama}
                </button>
                <p class="text-xs text-slate-500 font-medium truncate">
                  ${c.posisi} <span class="text-slate-400 font-normal">di</span> <strong class="text-slate-700 font-semibold">${c.mitra}</strong>
                </p>
              </div>
            </div>

            <!-- Status Badges Toolbar -->
            <div class="flex flex-wrap items-center gap-1.5 shrink-0">
              ${interviewBadge}
              ${hrdBadge}
            </div>
          </div>

          <!-- Row 2: Schedule, WhatsApp Phone & Notes Bar -->
          <div class="p-2.5 rounded-xl ${isSelectedForWa ? 'bg-white/90 border border-blue-200/80 shadow-2xs' : 'bg-slate-50 border border-slate-100'} flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
            <span class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span>Jadwal:</span> <strong class="text-slate-800 font-semibold">${c.jadwalInterview}</strong>
            </span>
            <span class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>WhatsApp:</span> <strong class="text-slate-800 font-semibold">${c.phone}</strong>
            </span>
            ${(c.catatan && c.catatan !== '-') ? `
              <span class="text-slate-500 italic flex items-center gap-1">
                <span class="text-slate-400 not-italic">Catatan:</span>
                <span>&ldquo;${c.catatan}&rdquo;</span>
              </span>
            ` : ''}
          </div>

          <!-- Row 3: Action Buttons Toolbar (Dedicated bottom bar without squeezing) -->
          <div class="pt-1 flex flex-wrap items-center justify-between sm:justify-end gap-2">
            <button onclick="openCandidateDetail(${c.id})" title="Buka Pratinjau Berkas CV Lengkap"
              class="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition flex items-center space-x-1.5 shadow-2xs cursor-pointer">
              <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              <span>Detail CV</span>
            </button>
            <button onclick="prepareScoringModal(${c.id})" title="Formulir Penilaian Wawancara HRD"
              class="px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs transition flex items-center space-x-1.5 shadow-xs cursor-pointer">
              <svg class="w-3.5 h-3.5 text-blue-200" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              <span>${(c.statusHRD && c.statusHRD !== 'Menunggu Seleksi') ? 'Ubah Nilai HRD' : 'Nilai Wawancara'}</span>
            </button>
            <button onclick="toggleCandidateInterviewStatus(${c.id})" title="Ubah status konfirmasi kehadiran"
              class="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition flex items-center space-x-1.5 cursor-pointer">
              <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              <span>Ubah Kehadiran</span>
            ${waButtonHtml}
          </div>
        `;
    listContainer.appendChild(div);
  });

  // Render Pagination Bar
  if (typeof renderPaginationBar === 'function') {
    renderPaginationBar({
      containerId: 'interview-pagination',
      totalItems: filtered.length,
      currentPage: interviewCurrentPage,
      pageSize: interviewPageSize,
      onPageChange: 'changeInterviewPage',
      onPageSizeChange: 'changeInterviewPageSize',
      itemLabel: 'kandidat wawancara'
    });
  }
}

function changeInterviewPage(page) {
  interviewCurrentPage = page;
  renderInterviewCards(currentInterviewFilter);
  const listContainer = document.getElementById('interview-list');
  if (listContainer) listContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function changeInterviewPageSize(size) {
  interviewPageSize = parseInt(size, 10) || 5;
  interviewCurrentPage = 1;
  renderInterviewCards(currentInterviewFilter);
}

function formatIndonesianSchedule(dateStr, timeStr) {
  if (!dateStr) return 'Kamis, 5 November 2026 pukul 09.00 WIB';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const dayName = days[d.getDay()];
  const dayNum = d.getDate();
  const monthName = months[d.getMonth()];
  const year = d.getFullYear();
  const timeFormatted = timeStr ? timeStr.replace(':', '.') : '09.00';

  return `${dayName}, ${dayNum} ${monthName} ${year} pukul ${timeFormatted} WIB`;
}

function updateSchedulePreview() {
  const dateVal = document.getElementById('sched-date')?.value;
  const timeVal = document.getElementById('sched-time')?.value;
  const previewEl = document.getElementById('sched-preview-text');
  if (previewEl) {
    previewEl.textContent = formatIndonesianSchedule(dateVal, timeVal);
  }
}

function openScheduleModal(id) {
  const cand = candidates.find(c => c.id == id);
  if (!cand) {
    showToast('Kandidat tidak ditemukan.');
    return;
  }

  const idInput = document.getElementById('sched-candidate-id');
  const titleEl = document.getElementById('modal-sched-title');
  const subtitleEl = document.getElementById('modal-sched-subtitle');
  const statusEl = document.getElementById('sched-status');
  const statusContainer = document.getElementById('sched-status-container');
  const applyAllEl = document.getElementById('sched-apply-all');
  const dateInput = document.getElementById('sched-date');
  const timeInput = document.getElementById('sched-time');

  if (idInput) idInput.value = cand.id;
  if (titleEl) titleEl.textContent = `Atur Jadwal - ${cand.nama}`;
  if (subtitleEl) subtitleEl.textContent = `Posisi ${cand.posisi} di ${cand.mitra}`;
  if (statusContainer) statusContainer.classList.remove('hidden');
  if (statusEl) statusEl.value = cand.statusInterview || 'Bersedia';
  if (applyAllEl) applyAllEl.checked = false;

  if (dateInput) {
    dateInput.value = '2026-11-05';
    dateInput.oninput = updateSchedulePreview;
  }
  if (timeInput) {
    timeInput.value = '09:00';
    timeInput.oninput = updateSchedulePreview;
  }

  updateSchedulePreview();
  const modal = document.getElementById('modal-schedule');
  if (modal) modal.classList.remove('hidden');
}

function openBulkScheduleModal() {
  const idInput = document.getElementById('sched-candidate-id');
  const titleEl = document.getElementById('modal-sched-title');
  const subtitleEl = document.getElementById('modal-sched-subtitle');
  const statusContainer = document.getElementById('sched-status-container');
  const applyAllEl = document.getElementById('sched-apply-all');
  const dateInput = document.getElementById('sched-date');
  const timeInput = document.getElementById('sched-time');

  if (idInput) idInput.value = 'BULK';
  if (titleEl) titleEl.textContent = 'Atur Jadwal Wawancara Serentak';
  if (subtitleEl) subtitleEl.textContent = 'Terapkan satu jadwal yang sama ke seluruh kandidat yang lolos seleksi berkas';
  if (statusContainer) statusContainer.classList.add('hidden');
  if (applyAllEl) applyAllEl.checked = true;

  if (dateInput) {
    dateInput.value = '2026-11-05';
    dateInput.oninput = updateSchedulePreview;
  }
  if (timeInput) {
    timeInput.value = '09:00';
    timeInput.oninput = updateSchedulePreview;
  }

  updateSchedulePreview();
  const modal = document.getElementById('modal-schedule');
  if (modal) modal.classList.remove('hidden');
}

async function submitScheduleModal() {
  const idInput = document.getElementById('sched-candidate-id');
  const candId = idInput?.value;
  const statusEl = document.getElementById('sched-status');
  const applyAllEl = document.getElementById('sched-apply-all');
  const dateInput = document.getElementById('sched-date');
  const timeInput = document.getElementById('sched-time');

  const dateVal = dateInput?.value;
  const timeVal = timeInput?.value || '09:00';
  if (!dateVal) {
    showToast('Silakan tentukan tanggal wawancara terlebih dahulu.');
    return;
  }

  const formattedSchedule = formatIndonesianSchedule(dateVal, timeVal);
  const isApplyAll = applyAllEl?.checked || candId === 'BULK';
  const newStatus = statusEl ? statusEl.value : 'Bersedia';

  try {
    if (isApplyAll) {
      const res = await fetch('/api/v1/candidates/bulk/interview-schedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewSchedule: formattedSchedule,
          statusInterview: candId === 'BULK' ? undefined : newStatus
        })
      });
      const json = await res.json();
      if (json.success) {
        candidates.forEach(c => {
          if (c.statusSortir === 'Lolos Sortir') {
            c.jadwalInterview = formattedSchedule;
            if (candId !== 'BULK') c.statusInterview = newStatus;
          }
        });
        if (selectedWaCandidate) {
          selectedWaCandidate.jadwalInterview = formattedSchedule;
          if (candId !== 'BULK') selectedWaCandidate.statusInterview = newStatus;
        }
        showToast(`Jadwal seluruh kandidat berhasil diatur ke: ${formattedSchedule}`);
      }
    } else {
      const res = await fetch(`/api/v1/candidates/${candId}/interview-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statusInterview: newStatus,
          interviewSchedule: formattedSchedule
        })
      });
      const json = await res.json();
      if (json.success) {
        const c = candidates.find(item => item.id == candId);
        if (c) {
          c.statusInterview = newStatus;
          c.jadwalInterview = formattedSchedule;
        }
        if (selectedWaCandidate && selectedWaCandidate.id == candId) {
          selectedWaCandidate.statusInterview = newStatus;
          selectedWaCandidate.jadwalInterview = formattedSchedule;
        }
        showToast(`Jadwal ${c?.nama || 'kandidat'} diperbarui: ${formattedSchedule}`);
      }
    }

    closeModal('modal-schedule');
    await fetchApplicants();
    await fetchDashboardMetrics();
    updateWaPreviewText();
    renderInterviewCards(currentInterviewFilter);
  } catch (err) {
    console.error('Gagal memperbarui jadwal wawancara:', err);
    showToast('Gagal memperbarui jadwal ke server.');
  }
}

async function toggleCandidateInterviewStatus(id) {
  openScheduleModal(id);
}

function selectCandidateForWa(id) {
  const c = candidates.find(item => item.id == id);
  if (!c) return;
  selectedWaCandidate = c;

  const nameEl = document.getElementById('wa-target-name');
  const posEl = document.getElementById('wa-target-posisi');
  const badgeEl = document.getElementById('wa-target-badge');

  if (nameEl) nameEl.textContent = c.nama;
  if (posEl) posEl.textContent = `${c.posisi} di ${c.mitra}`;
  if (badgeEl) badgeEl.textContent = c.phone;

  updateWaPreviewText();
  renderInterviewCards(currentInterviewFilter);
  showToast(`Kandidat ${c.nama} dipilih untuk pesan WhatsApp.`);
}

// ==============================================================
// WHATSAPP TEMPLATE ENGINE & CUSTOM EDITOR
// ==============================================================
const defaultWaTemplates = {
  undangan: `Yth. {nama},

Sehubungan dengan proses seleksi penerimaan tenaga kerja di PT Kinarya Alihdaya Mandiri, kami menginformasikan bahwa berkas lamaran Anda untuk posisi {posisi} telah memenuhi kualifikasi seleksi administrasi.

Bersama ini kami mengundang Anda untuk mengikuti sesi Wawancara HRD pada:

Hari dan Tanggal: {jadwal}
Waktu: Sesuai Jadwal
Lokasi: Kantor Operasional PT KAM Semarang atau daring melalui Google Meet

Mohon konfirmasi kehadiran Anda dengan membalas pesan ini:
1. Hadir
2. Berhalangan
3. Ajukan Jadwal Ulang

Terima kasih atas perhatian dan kerja sama Anda.

Tim Rekrutmen
PT Kinarya Alihdaya Mandiri`,

  reminder: `Yth. {nama},

Mengingatkan kembali jadwal Wawancara HRD PT Kinarya Alihdaya Mandiri untuk penempatan posisi {posisi} di mitra {mitra}:

Waktu Pelaksanaan: {jadwal}

Mohon menyiapkan dokumen pendukung seperti KTP, ijazah, dan CV, serta bersiap 15 menit sebelum sesi dimulai.

Terima kasih,
Tim Rekrutmen PT KAM`,

  lolos: `Yth. {nama},

Berdasarkan hasil evaluasi Wawancara HRD, kami menginformasikan bahwa Anda dinyatakan lolos seleksi internal PT Kinarya Alihdaya Mandiri untuk posisi {posisi}.

Berkas rekomendasi Anda telah kami teruskan ke mitra kerja sama {mitra} untuk proses penempatan.

Tim operasional kami akan segera menghubungi Anda mengenai tahapan administrasi berikutnya.

Terima kasih,
Tim Rekrutmen PT KAM`
};

function loadWaTemplates() {
  try {
    const saved = localStorage.getItem('kam_wa_templates_v1');
    if (saved) {
      return Object.assign({}, defaultWaTemplates, JSON.parse(saved));
    }
  } catch (e) {
    console.warn('Gagal membaca template WA dari localStorage:', e);
  }
  return Object.assign({}, defaultWaTemplates);
}

let waTemplates = loadWaTemplates();
let isWaEditingTemplate = false;

function toggleWaEditTemplateMode(forceState) {
  isWaEditingTemplate = (forceState !== undefined) ? forceState : !isWaEditingTemplate;

  const btnToggle = document.getElementById('btn-toggle-edit-template');
  const lblToggle = document.getElementById('lbl-toggle-edit-template');
  const targetContainer = document.getElementById('wa-target-container');
  const previewContainer = document.getElementById('wa-preview-container');
  const editorContainer = document.getElementById('wa-editor-container');
  const editorTextarea = document.getElementById('wa-template-editor');
  const lblEditingName = document.getElementById('wa-editing-template-name');

  if (isWaEditingTemplate) {
    if (lblToggle) lblToggle.textContent = 'Tutup Editor';
    if (btnToggle) {
      btnToggle.className = 'px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition flex items-center gap-1.5 cursor-pointer shadow-2xs';
    }
    if (targetContainer) targetContainer.classList.add('hidden');
    if (previewContainer) previewContainer.classList.add('hidden');
    if (editorContainer) editorContainer.classList.remove('hidden');

    if (editorTextarea) {
      editorTextarea.value = waTemplates[currentWaTemplate] || defaultWaTemplates[currentWaTemplate];
      editorTextarea.focus();
    }
    if (lblEditingName) {
      lblEditingName.textContent = currentWaTemplate === 'undangan' ? 'Undangan Wawancara' : (currentWaTemplate === 'reminder' ? 'Pesan Pengingat' : 'Hasil Seleksi HRD');
    }
  } else {
    if (lblToggle) lblToggle.textContent = 'Ubah Format';
    if (btnToggle) {
      btnToggle.className = 'px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition flex items-center gap-1.5 cursor-pointer';
    }
    if (targetContainer) targetContainer.classList.remove('hidden');
    if (previewContainer) previewContainer.classList.remove('hidden');
    if (editorContainer) editorContainer.classList.add('hidden');

    updateWaPreviewText();
  }
}

function insertWaPlaceholder(tag) {
  const editor = document.getElementById('wa-template-editor');
  if (!editor) return;

  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const val = editor.value;

  editor.value = val.substring(0, start) + tag + val.substring(end);
  editor.selectionStart = editor.selectionEnd = start + tag.length;
  editor.focus();
}

function saveWaTemplateCustom() {
  const editor = document.getElementById('wa-template-editor');
  if (!editor) return;

  waTemplates[currentWaTemplate] = editor.value;
  try {
    localStorage.setItem('kam_wa_templates_v1', JSON.stringify(waTemplates));
  } catch (e) {
    console.warn('Gagal menyimpan template WA ke localStorage:', e);
  }

  showToast(`Template master ${currentWaTemplate} berhasil disimpan!`);
  toggleWaEditTemplateMode(false);
}

function resetWaTemplateDefault() {
  if (confirm(`Kembalikan template ${currentWaTemplate} ke standar resmi PT KAM?`)) {
    waTemplates[currentWaTemplate] = defaultWaTemplates[currentWaTemplate];
    const editor = document.getElementById('wa-template-editor');
    if (editor) editor.value = defaultWaTemplates[currentWaTemplate];
    try {
      localStorage.setItem('kam_wa_templates_v1', JSON.stringify(waTemplates));
    } catch (e) { }
    showToast(`Template ${currentWaTemplate} dikembalikan ke teks standar.`);
  }
}

// WhatsApp Template Switcher & Dynamic Content
function setWaTemplate(type) {
  currentWaTemplate = type;
  ['undangan', 'reminder', 'lolos'].forEach(t => {
    const btn = document.getElementById(`btn-wa-${t}`);
    if (btn) {
      btn.classList.remove('bg-white', 'text-blue-950', 'font-bold', 'shadow-2xs');
      btn.classList.add('text-slate-600');
    }
  });
  const act = document.getElementById(`btn-wa-${type}`);
  if (act) {
    act.classList.add('bg-white', 'text-blue-950', 'font-bold', 'shadow-2xs');
    act.classList.remove('text-slate-600');
  }

  if (isWaEditingTemplate) {
    const editor = document.getElementById('wa-template-editor');
    const lblEditingName = document.getElementById('wa-editing-template-name');
    if (editor) {
      editor.value = waTemplates[type] || defaultWaTemplates[type];
    }
    if (lblEditingName) {
      lblEditingName.textContent = type === 'undangan' ? 'Undangan Wawancara' : (type === 'reminder' ? 'Pesan Pengingat' : 'Hasil Seleksi HRD');
    }
  } else {
    updateWaPreviewText();
  }
}

function formatWaMessage(templateText, c) {
  const sched = (c.jadwalInterview && c.jadwalInterview !== '-') ? c.jadwalInterview : 'Kamis, 5 November 2026 pukul 09.00 WIB';
  return (templateText || '')
    .replace(/{nama}/g, c.nama || '[Nama Pelamar]')
    .replace(/{posisi}/g, c.posisi || '[Posisi Lowongan]')
    .replace(/{mitra}/g, c.mitra || '[Perusahaan Mitra]')
    .replace(/{jadwal}/g, sched);
}

function updateWaPreviewText() {
  const previewBox = document.getElementById('wa-preview-text');
  if (!previewBox) return;

  const c = selectedWaCandidate || candidates.find(item => item.statusSortir === 'Lolos Sortir') || {
    nama: '[Nama Pelamar]',
    posisi: '[Posisi Lowongan]',
    mitra: '[Perusahaan Mitra]',
    phone: '628xxxxxxxxxx',
    jadwalInterview: 'Kamis, 5 November 2026 pukul 09.00 WIB'
  };

  const rawTemplate = waTemplates[currentWaTemplate] || defaultWaTemplates[currentWaTemplate];
  const renderedText = formatWaMessage(rawTemplate, c);

  if ('value' in previewBox) {
    previewBox.value = renderedText;
  } else {
    previewBox.textContent = renderedText;
  }
}

function sendSimulatedWa() {
  const c = selectedWaCandidate || candidates.find(item => item.statusSortir === 'Lolos Sortir');
  if (!c) {
    showToast('Pilih salah satu kandidat terlebih dahulu.', true);
    return;
  }

  const previewBox = document.getElementById('wa-preview-text');
  const text = previewBox ? (previewBox.value || previewBox.textContent || '') : '';
  let cleanPhone = (c.phone || '').replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);
  if (!cleanPhone.startsWith('62')) cleanPhone = '62' + cleanPhone;

  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;

  navigator.clipboard.writeText(text).then(() => {
    showToast(`Teks WA ${c.nama} disalin ke clipboard! Membuka WhatsApp...`);
  }).catch(() => {
    showToast(`Membuka WhatsApp untuk ${c.nama}...`);
  });

  window.open(waUrl, '_blank');
}

// Rekapitulasi Dua Tahap Logic