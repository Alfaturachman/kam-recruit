/**
 * KAM RECRUIT - Jadwal & Follow-up Wawancara (WA Gateway) Module
 */

let interviewCurrentPage = 1;
let interviewPageSize = 5;
let currentInterviewList = [];

    function filterInterviewStatus(filter) {
      currentInterviewFilter = filter;
      interviewCurrentPage = 1;
      renderInterviewCards(filter);

      const btnAll = document.getElementById('btn-filter-int-all');
      const btnBersedia = document.getElementById('btn-filter-int-bersedia');
      const btnDrop = document.getElementById('btn-filter-int-drop');

      const activeClass = 'px-2.5 py-1 rounded-lg bg-blue-900 text-white font-bold cursor-pointer transition';
      const inactiveClass = 'px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer transition';

      if (btnAll) btnAll.className = (filter === 'ALL') ? activeClass : inactiveClass;
      if (btnBersedia) btnBersedia.className = (filter === 'Bersedia') ? activeClass : inactiveClass;
      if (btnDrop) btnDrop.className = (filter === 'Tidak Merespons') ? activeClass : inactiveClass;
    }

    function renderInterviewCards(filter = currentInterviewFilter) {
      const listContainer = document.getElementById('interview-list');
      if (!listContainer) return;
      listContainer.innerHTML = '';

      const lolosSortirCandidates = candidates.filter(c => c.statusSortir === 'Lolos Sortir');
      const totalLolos = lolosSortirCandidates.length;
      const confirmed = lolosSortirCandidates.filter(c => c.statusInterview === 'Bersedia').length;
      const notConfirmed = lolosSortirCandidates.filter(c => c.statusInterview !== 'Bersedia').length;

      const hdrBadge = document.getElementById('interview-header-badge');
      if (hdrBadge) hdrBadge.textContent = `Konfirmasi: ${confirmed} Bersedia | ${notConfirmed} Tidak Respons`;
      
      const cntAll = document.getElementById('count-interview-all');
      if (cntAll) cntAll.textContent = totalLolos;
      const cntBersedia = document.getElementById('count-interview-bersedia');
      if (cntBersedia) cntBersedia.textContent = confirmed;
      const cntDrop = document.getElementById('count-interview-drop');
      if (cntDrop) cntDrop.textContent = notConfirmed;

      let filtered = lolosSortirCandidates;
      if (filter === 'Bersedia') {
        filtered = filtered.filter(c => c.statusInterview === 'Bersedia');
      } else if (filter === 'Tidak Merespons') {
        filtered = filtered.filter(c => 
          c.statusInterview === 'Tidak Merespons' || 
          c.statusInterview === 'Menolak' || 
          (c.statusHRD && typeof c.statusHRD === 'string' && c.statusHRD.includes('Tidak Lolos'))
        );
      }

      // Automatically select first candidate for WA preview if none selected
      if (!selectedWaCandidate && filtered.length > 0) {
        selectedWaCandidate = filtered[0];
      }
      updateWaPreviewText();

      // Empty State (Apple HIG Clean Card)
      const paginationContainer = document.getElementById('interview-pagination');
      if (filtered.length === 0) {
        if (paginationContainer) paginationContainer.innerHTML = '';
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
            <h4 class="text-xs font-bold text-slate-800">Tidak Ada Pelamar di Kategori "${filter === 'ALL' ? 'Semua' : filter}"</h4>
            <p class="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
              Saat ini belum ada kandidat lolos sortir yang memenuhi filter ini. Anda dapat meloloskan kandidat lain dari Bank Pelamar atau melihat semua pelamar lolos sortir.
            </p>
          </div>
          <div class="flex items-center justify-center gap-2 pt-1">
            <button onclick="filterInterviewStatus('ALL')" class="px-3.5 py-1.5 rounded-xl bg-blue-900 text-white font-bold text-xs hover:bg-blue-800 transition cursor-pointer">
              Tampilkan Semua Pelamar Lolos
            </button>
            <button onclick="switchTab('pelamar')" class="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer">
              Buka Bank Pelamar
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
          interviewBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap shrink-0">&bull; Bersedia Hadir</span>';
        } else {
          interviewBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap shrink-0">&bull; Tidak Merespons</span>';
        }

        let hrdBadge = '';
        if (c.statusHRD === 'Lolos Seleksi HRD') {
          hrdBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 whitespace-nowrap shrink-0">&check; Lolos Wawancara HRD</span>';
        } else if (c.statusHRD === 'Tidak Lolos') {
          hrdBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200 whitespace-nowrap shrink-0">&times; Tidak Lolos HRD</span>';
        } else {
          hrdBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap shrink-0">Menunggu Evaluasi HRD</span>';
        }

        const initials = c.nama.split(' ').map(n => n[0]).slice(0, 2).join('');
        const isSelectedForWa = selectedWaCandidate && selectedWaCandidate.id == c.id;

        const avatarHtml = isSelectedForWa
          ? `<div class="w-9 h-9 rounded-xl bg-blue-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs ring-2 ring-blue-900/20">${initials}</div>`
          : `<div class="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">${initials}</div>`;

        const waSelectedBadge = isSelectedForWa
          ? `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-900 text-white shadow-2xs whitespace-nowrap shrink-0 flex items-center gap-1.5">
               <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
               <span>Aktif di WA</span>
             </span>`
          : '';

        const waButtonHtml = isSelectedForWa
          ? `<button onclick="selectCandidateForWa(${c.id})" title="Kandidat ini sedang aktif di formulir WhatsApp"
              class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center space-x-1.5 shadow-2xs cursor-pointer">
              <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span>Aktif di WA</span>
            </button>`
          : `<button onclick="selectCandidateForWa(${c.id})" title="Siapkan template dan kirim WhatsApp"
              class="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer">
              <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span>Kirim WA</span>
            </button>`;

        const div = document.createElement('div');
        div.className = `p-4 sm:p-5 transition space-y-3 ${
          isSelectedForWa
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
                  ${c.posisi} &bull; Mitra: <strong class="text-slate-700 font-bold">${c.mitra}</strong>
                </p>
              </div>
            </div>

            <!-- Status Badges Toolbar -->
            <div class="flex flex-wrap items-center gap-1.5 shrink-0">
              ${waSelectedBadge}
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200 whitespace-nowrap shrink-0">
                Tahap I Lolos
              </span>
              ${interviewBadge}
              ${hrdBadge}
            </div>
          </div>

          <!-- Row 2: Schedule, WhatsApp Phone & Notes Bar -->
          <div class="p-2.5 rounded-xl ${isSelectedForWa ? 'bg-white/90 border border-blue-200/80 shadow-2xs' : 'bg-slate-50 border border-slate-100'} flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 font-mono">
            <span class="flex items-center gap-1.5 font-sans">
              <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span>Jadwal:</span> <strong class="text-slate-800 font-semibold font-mono">${c.jadwalInterview}</strong>
            </span>
            <span class="flex items-center gap-1.5 font-sans">
              <svg class="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>WA:</span> <strong class="text-slate-800 font-semibold font-mono">${c.phone}</strong>
            </span>
            ${(c.catatan && c.catatan !== '-') ? `
              <span class="text-slate-500 italic flex items-center gap-1 font-sans">
                <span class="text-slate-400 not-italic">Catatan:</span>
                <span>&ldquo;${c.catatan}&rdquo;</span>
              </span>
            ` : ''}
          </div>

          <!-- Row 3: Action Buttons Toolbar (Dedicated bottom bar without squeezing) -->
          <div class="pt-1 border-t border-slate-100 flex flex-wrap items-center justify-between sm:justify-end gap-2">
            <button onclick="openCandidateDetail(${c.id})" title="Buka Pratinjau Berkas CV Lengkap"
              class="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition flex items-center space-x-1.5 shadow-2xs cursor-pointer">
              <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              <span>Detail CV</span>
            </button>
            <button onclick="prepareScoringModal(${c.id})" title="Formulir Penilaian Wawancara HRD"
              class="px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs transition flex items-center space-x-1.5 shadow-xs cursor-pointer">
              <svg class="w-3.5 h-3.5 text-blue-200" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              <span>Keputusan Wawancara</span>
            </button>
            <button onclick="toggleCandidateInterviewStatus(${c.id})" title="Ubah status konfirmasi kehadiran"
              class="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition flex items-center space-x-1.5 cursor-pointer">
              <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              <span>Ubah Respon</span>
            </button>
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
          pageSizeOptions: [3, 5, 8, 15],
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

    async function toggleCandidateInterviewStatus(id) {
      const cand = candidates.find(c => c.id == id);
      if (!cand) {
        showToast('Kandidat tidak ditemukan.');
        return;
      }

      const newStatus = cand.statusInterview === 'Bersedia' ? 'Tidak Merespons' : 'Bersedia';
      const newSchedule = newStatus === 'Bersedia' ? 'Kamis, 5 Nov (14.00 WIB)' : '-';

      try {
        const res = await fetch(`/api/v1/candidates/${cand.id}/interview-status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            statusInterview: newStatus,
            interviewSchedule: newSchedule
          })
        });
        const json = await res.json();
        if (json.success) {
          showToast(`Status wawancara ${cand.nama} diperbarui ke '${newStatus}'.`);
          await fetchApplicants();
          await fetchDashboardMetrics();
          return;
        }
      } catch (err) {
        console.warn('Fallback local interview toggle:', err);
      }

      cand.statusInterview = newStatus;
      cand.jadwalInterview = newSchedule;
      persistCandidates();
      renderInterviewCards(currentInterviewFilter);
      fetchDashboardMetrics();
      showToast(`Status wawancara ${cand.nama} diubah ke '${newStatus}'.`);
    }

    function selectCandidateForWa(id) {
      const c = candidates.find(item => item.id == id);
      if (!c) return;
      selectedWaCandidate = c;

      const nameEl = document.getElementById('wa-target-name');
      const posEl = document.getElementById('wa-target-posisi');
      const badgeEl = document.getElementById('wa-target-badge');

      if (nameEl) nameEl.textContent = c.nama;
      if (posEl) posEl.textContent = `${c.posisi} • Mitra: ${c.mitra}`;
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

Sehubungan dengan proses seleksi penerimaan tenaga kerja di PT Kinarya Alihdaya Mandiri (PT KAM), kami menginformasikan bahwa berkas lamaran Anda untuk posisi {posisi} telah memenuhi kualifikasi seleksi administrasi.

Bersama ini kami mengundang Anda untuk mengikuti sesi Wawancara HRD yang akan dilaksanakan pada:

Hari, Tanggal : {jadwal}
Waktu         : Sesuai Jadwal
Media / Lokasi: Kantor Operasional PT KAM Semarang / Google Meet

Mohon memberikan konfirmasi kehadiran dengan membalas pesan resmi ini menggunakan format:
1. BERSEDIA HADIR
2. MENOLAK / MENGUNDURKAN DIRI
3. MOHON RESCHEDULE

Demikian informasi ini kami sampaikan. Atas perhatian dan kerja sama Anda, kami ucapkan terima kasih.

Tim Rekrutmen dan Seleksi
PT Kinarya Alihdaya Mandiri`,

      reminder: `Yth. {nama},

Mengingatkan kembali jadwal pelaksanaan Wawancara HRD PT Kinarya Alihdaya Mandiri untuk posisi {posisi} (Mitra: {mitra}) yang akan diselenggarakan pada:

Jadwal: {jadwal}

Mohon mempersiapkan berkas dokumen pendukung (KTP, Ijazah, CV) dan telah bersiap 15 menit sebelum jadwal wawancara dimulai.

Terima kasih,
Tim Rekrutmen PT KAM`,

      lolos: `Yth. {nama},

Berdasarkan hasil evaluasi dan penilaian Wawancara HRD yang telah dilaksanakan, kami menginformasikan bahwa Anda dinyatakan LOLOS seleksi internal PT Kinarya Alihdaya Mandiri untuk posisi {posisi}.

Berkas rekomendasi dan CV Anda saat ini telah kami teruskan kepada mitra pengguna ({mitra}) untuk tahap tindak lanjut penempatan kerja alih daya.

Tim operasional kami akan segera menghubungi Anda terkait proses administrasi penempatan selanjutnya.

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
          lblEditingName.textContent = currentWaTemplate === 'undangan' ? 'Undangan Wawancara' : (currentWaTemplate === 'reminder' ? 'Reminder H-1' : 'Pengumuman Lolos HRD');
        }
      } else {
        if (lblToggle) lblToggle.textContent = 'Edit Template';
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
        } catch (e) {}
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
          lblEditingName.textContent = type === 'undangan' ? 'Undangan Wawancara' : (type === 'reminder' ? 'Reminder H-1' : 'Pengumuman Lolos HRD');
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