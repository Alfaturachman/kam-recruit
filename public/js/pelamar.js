/**
 * KAM RECRUIT - Master Data Pelamar Module
 */

let pelamarCurrentPage = 1;
let pelamarPageSize = 10;
let currentPelamarList = [];

async function fetchApplicants() {
  try {
    const res = await fetch('/api/v1/applicants');
    if (!res.ok) return;
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      candidates = json.data.map(d => ({
        id: d.id,
        nama: d.full_name,
        email: d.email,
        phone: d.phone,
        posisi: d.position_title || 'Customer Service Rep',
        mitra: d.partner_name || 'PT Telkom Akses',
        pendidikan: d.education_degree,
        kampus: d.campus_name + (d.study_major ? ` (${d.study_major})` : ''),
        usia: d.age,
        domisili: d.domicile_city,
        tglDaftar: d.created_at ? new Date(d.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '30 Okt 2026',
        statusSortir: d.status_sortir,
        statusInterview: d.status_interview,
        jadwalInterview: d.interview_schedule || '-',
        skorWawancara: d.status_hrd === 'Lolos Seleksi HRD' ? 85 : 0,
        statusHRD: d.status_hrd,
        diserahkan: d.submitted_to_partner_at || null,
        catatan: d.notes || '-',
        ringkasan: d.about_me || 'Profil pendaftar terverifikasi Glints.',
        pengalaman: (d.pengalaman && d.pengalaman.length > 0) ? d.pengalaman : (d.total_experience_label ? [{ posisi: 'Riwayat Kerja Terdata', perusahaan: 'Instansi Terdahulu', periode: d.total_experience_label, lokasi: d.domicile_city, tugas: [d.about_me || 'Pengalaman operasional.'] }] : []),
        sertifikat: (d.sertifikat && d.sertifikat.length > 0) ? d.sertifikat : [{ nama: `Kompetensi ${d.education_degree}`, penerbit: `${d.campus_name} (Glints Verified)`, status: 'Terverifikasi' }],
        keahlian: (d.keahlian && d.keahlian.length > 0) ? d.keahlian : (d.skills_text ? d.skills_text.split(',').map(s => s.trim()) : ['Komunikasi', 'Kerja Tim'])
      }));

      persistCandidates();
      renderCandidateTable();
      renderInterviewCards();
      renderThirdPartyGrid();
    }
  } catch (e) {
    console.warn('Menggunakan fallback data lokal:', e);
    loadPersistedCandidates();
    renderCandidateTable();
    renderInterviewCards();
    renderThirdPartyGrid();
  }
}

function renderCandidateTable(filteredList = null) {
  const tbody = document.getElementById('candidate-tbody');
  currentPelamarList = filteredList !== null ? filteredList : (candidates || []);
  const list = currentPelamarList;

  const countLbl = document.getElementById('candidate-count-lbl');
  if (countLbl) countLbl.textContent = `${list.length} Orang`;

  if (!tbody) return;
  tbody.innerHTML = '';

  const paginationContainer = document.getElementById('pelamar-pagination');

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="p-12 text-center">
          <div class="max-w-sm mx-auto space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-900">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <h4 class="text-sm font-bold text-slate-800">Tidak Ada Data Pelamar</h4>
            <p class="text-xs text-slate-500 leading-relaxed">Basis data belum memuat data pelamar atau filter pencarian tidak menemukan hasil. Silakan klik tombol <b>Impor Berkas Glints</b> untuk memasukkan berkas.</p>
          </div>
        </td>
      </tr>
    `;
    if (paginationContainer) paginationContainer.innerHTML = '';
    return;
  }

  // Calculate pagination slice
  const totalPages = Math.max(1, Math.ceil(list.length / pelamarPageSize));
  if (pelamarCurrentPage > totalPages) pelamarCurrentPage = totalPages;
  const startIndex = (pelamarCurrentPage - 1) * pelamarPageSize;
  const pageItems = list.slice(startIndex, startIndex + pelamarPageSize);

  pageItems.forEach(c => {
    // Pengalaman Kerja Quick Previews
    let expTitle = 'Fresh Graduate';
    let expSub = 'Belum memiliki riwayat kerja';

    if (c.pengalaman && c.pengalaman.length > 0) {
      const exp = c.pengalaman[0];
      let pos = (exp.posisi || 'Field Direct Sales Promotor').split(' di ')[0].trim();
      expTitle = pos;

      let rawPeriode = exp.periode || '';
      let rawCompany = exp.perusahaan || '';
      
      if (rawPeriode.includes('(') && rawPeriode.includes(')')) {
        expSub = rawPeriode;
      } else if (rawCompany.match(/\d{4}\s*-\s*\d{4}|\d{4}/)) {
        const dates = rawCompany.split(':')[0].trim();
        const duration = rawPeriode;
        expSub = `${dates} (${duration})`;
      } else if (rawPeriode) {
        expSub = rawPeriode;
      }
    } else if (c.total_experience_label && !c.total_experience_label.toLowerCase().includes('fresh graduate') && !c.total_experience_label.startsWith('0')) {
      expTitle = 'Riwayat Kerja Terdata';
      expSub = c.total_experience_label;
    }

    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition';
    tr.innerHTML = `
      <td class="p-3 text-center"><input type="checkbox" class="row-checkbox" value="${c.id}"></td>
      <td class="p-3">
        <strong class="text-slate-900 block font-bold leading-tight">${c.nama}</strong>
        <span class="text-[11px] text-slate-500 block font-mono mt-0.5">${c.phone}</span>
      </td>
      <td class="p-3">
        <span class="font-semibold text-slate-800">${c.posisi}</span>
        <span class="text-[11px] text-slate-400 block">${c.mitra}</span>
      </td>
      <td class="p-3">
        <span class="font-medium text-slate-700">${c.pendidikan} (${c.kampus})</span>
        <span class="text-[11px] text-slate-400 block">Usia ${c.usia} tahun, ${c.domisili}</span>
      </td>
      <td class="p-3">
        <div class="space-y-0.5 max-w-[210px]">
          <strong class="text-xs font-bold text-slate-800 block truncate" title="${expTitle}">
            ${expTitle}
          </strong>
          <span class="text-[11px] text-slate-500 block truncate" title="${expSub}">
            ${expSub}
          </span>
        </div>
      </td>
      <td class="p-3 text-center">
        <div class="flex flex-col items-center justify-center gap-1.5 min-w-[85px]">
          <button onclick="openCandidateDetail(${c.id})" class="w-full px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer text-xs whitespace-nowrap text-center transition">
            Lihat CV
          </button>
          ${c.statusSortir !== 'Lolos Sortir' ? `
            <button onclick="openConfirmSortirModal(${c.id}, 'approve')" class="w-full px-2.5 py-1 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-semibold cursor-pointer text-xs whitespace-nowrap text-center transition">
              Loloskan
            </button>
          ` : `
            <div class="w-full flex flex-col items-center gap-1">
              <span class="w-full text-[11px] text-blue-900 font-bold px-2 py-0.5 whitespace-nowrap text-center bg-blue-50/70 rounded-md border border-blue-200/60">Siap Interview</span>
              <button onclick="openConfirmSortirModal(${c.id}, 'cancel')" title="Batalkan status lolos dan kembalikan ke Belum Disortir" class="text-[10px] text-slate-400 hover:text-red-600 font-semibold hover:underline cursor-pointer transition">
                Batalkan
              </button>
            </div>
          `}
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Render Pagination Bar
  if (typeof renderPaginationBar === 'function') {
    renderPaginationBar({
      containerId: 'pelamar-pagination',
      totalItems: list.length,
      currentPage: pelamarCurrentPage,
      pageSize: pelamarPageSize,
      onPageChange: 'changePelamarPage',
      onPageSizeChange: 'changePelamarPageSize',
      itemLabel: 'pelamar'
    });
  }
}

function changePelamarPage(page) {
  pelamarCurrentPage = page;
  renderCandidateTable(currentPelamarList);
}

function changePelamarPageSize(size) {
  pelamarPageSize = parseInt(size, 10) || 10;
  pelamarCurrentPage = 1;
  renderCandidateTable(currentPelamarList);
}

// Filter Candidate Table
function filterCandidateTable() {
  const q = (document.getElementById('search-candidate')?.value || '').trim().toLowerCase();
  const pos = (document.getElementById('filter-posisi')?.value || 'ALL').toUpperCase();
  const status = document.getElementById('filter-status')?.value || 'ALL';
  const edu = document.getElementById('filter-pendidikan')?.value || 'ALL';

  pelamarCurrentPage = 1; // Reset to page 1 on filter change

  const filtered = (candidates || []).filter(c => {
    const matchQ = !q || (c.nama && c.nama.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.kampus && c.kampus.toLowerCase().includes(q));
    const matchPos = pos === 'ALL' || (c.posisi && c.posisi.toUpperCase() === pos);
    const matchStatus = status === 'ALL' || c.statusSortir === status;
    const matchEdu = edu === 'ALL' || (c.pendidikan && c.pendidikan.includes(edu));
    return matchQ && matchPos && matchStatus && matchEdu;
  });

  renderCandidateTable(filtered);
}

function filterByPosisi(posisiName) {
  switchTab('pelamar');
  const posEl = document.getElementById('filter-posisi');
  if (posEl) posEl.value = posisiName;
  filterCandidateTable();
}

let currentSortirAction = null; // { type: 'approve' | 'cancel' | 'bulk-approve' | 'bulk-cancel', targetIds: [id, ...] }

function openConfirmSortirModal(targetId, actionType = 'approve') {
  currentSortirAction = {
    type: actionType,
    targetIds: targetId ? [targetId] : []
  };

  const modal = document.getElementById('modal-confirm-sortir');
  const titleEl = document.getElementById('confirm-sortir-title');
  const descEl = document.getElementById('confirm-sortir-desc');
  const cardNameEl = document.getElementById('confirm-sortir-cand-name');
  const cardMetaEl = document.getElementById('confirm-sortir-cand-meta');
  const actionBtn = document.getElementById('confirm-sortir-btn-action');
  const iconBox = document.getElementById('confirm-sortir-icon-box');
  const iconCheck = document.getElementById('confirm-sortir-icon-check');
  const iconUndo = document.getElementById('confirm-sortir-icon-undo');

  if (!modal) return;

  if (actionType === 'approve') {
    const cand = (candidates || []).find(c => c.id == targetId);
    titleEl.textContent = 'Konfirmasi Loloskan Pelamar';
    descEl.textContent = 'Apakah Anda yakin ingin meloloskan kandidat ini ke tahap wawancara (Tahap I)?';
    cardNameEl.textContent = cand ? cand.nama : 'Kandidat Terpilih';
    cardMetaEl.textContent = cand ? `${cand.posisi} • Mitra ${cand.mitra}` : '-';

    actionBtn.className = 'px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition shadow-xs cursor-pointer';
    actionBtn.textContent = 'Ya, Loloskan';

    iconBox.className = 'w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-center mx-auto';
    if (iconCheck) iconCheck.classList.remove('hidden');
    if (iconUndo) iconUndo.classList.add('hidden');
  } else if (actionType === 'cancel') {
    const cand = (candidates || []).find(c => c.id == targetId);
    titleEl.textContent = 'Batalkan Status Lolos Interview';
    descEl.textContent = 'Apakah Anda yakin ingin membatalkan status lolos kandidat ini? Status akan dikembalikan ke Belum Disortir.';
    cardNameEl.textContent = cand ? cand.nama : 'Kandidat Terpilih';
    cardMetaEl.textContent = cand ? `${cand.posisi} • Mitra ${cand.mitra}` : '-';

    actionBtn.className = 'px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition shadow-xs cursor-pointer';
    actionBtn.textContent = 'Ya, Batalkan Lolos';

    iconBox.className = 'w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto';
    if (iconCheck) iconCheck.classList.add('hidden');
    if (iconUndo) iconUndo.classList.remove('hidden');
  } else if (actionType === 'bulk-approve') {
    const checked = Array.from(document.querySelectorAll('.row-checkbox:checked')).map(cb => parseInt(cb.value, 10));
    currentSortirAction.targetIds = checked;
    titleEl.textContent = 'Konfirmasi Loloskan Pelamar Terpilih';
    descEl.textContent = `Apakah Anda yakin ingin meloloskan ${checked.length} kandidat terpilih ke tahap wawancara (Tahap I)?`;
    cardNameEl.textContent = `${checked.length} Kandidat Terpilih`;
    cardMetaEl.textContent = 'Kandidat akan berstatus Siap Interview';

    actionBtn.className = 'px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition shadow-xs cursor-pointer';
    actionBtn.textContent = `Ya, Loloskan (${checked.length})`;

    iconBox.className = 'w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-center mx-auto';
    if (iconCheck) iconCheck.classList.remove('hidden');
    if (iconUndo) iconUndo.classList.add('hidden');
  } else if (actionType === 'bulk-cancel') {
    const checked = Array.from(document.querySelectorAll('.row-checkbox:checked')).map(cb => parseInt(cb.value, 10));
    currentSortirAction.targetIds = checked;
    titleEl.textContent = 'Konfirmasi Batalkan Sortir Terpilih';
    descEl.textContent = `Apakah Anda yakin ingin membatalkan status lolos ${checked.length} kandidat terpilih? Status akan dikembalikan ke Belum Disortir.`;
    cardNameEl.textContent = `${checked.length} Kandidat Terpilih`;
    cardMetaEl.textContent = 'Status akan dikembalikan ke Belum Disortir';

    actionBtn.className = 'px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition shadow-xs cursor-pointer';
    actionBtn.textContent = `Ya, Batalkan (${checked.length})`;

    iconBox.className = 'w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto';
    if (iconCheck) iconCheck.classList.add('hidden');
    if (iconUndo) iconUndo.classList.remove('hidden');
  }

  modal.classList.remove('hidden');
}

function confirmBulkSortir(action = 'approve') {
  const checked = Array.from(document.querySelectorAll('.row-checkbox:checked')).map(cb => parseInt(cb.value, 10));
  if (checked.length === 0) {
    showToast('Pilih setidaknya satu kandidat terlebih dahulu.', true);
    return;
  }
  openConfirmSortirModal(null, action === 'cancel' ? 'bulk-cancel' : 'bulk-approve');
}

function bulkApproveSortir() {
  confirmBulkSortir('approve');
}

async function executeConfirmedSortirAction() {
  if (!currentSortirAction || !currentSortirAction.targetIds || currentSortirAction.targetIds.length === 0) {
    closeModal('modal-confirm-sortir');
    return;
  }

  const { type, targetIds } = currentSortirAction;
  const isApprove = (type === 'approve' || type === 'bulk-approve');
  const targetStatus = isApprove ? 'Lolos Sortir' : 'Belum Disortir';

  closeModal('modal-confirm-sortir');

  try {
    const res = await fetch('/api/v1/applicants/bulk-sortir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidate_ids: targetIds, status_sortir: targetStatus })
    });
    const json = await res.json();
    if (json.success) {
      const msg = isApprove
        ? (targetIds.length === 1 ? 'Kandidat berhasil ditandai Lolos Sortir (Siap Interview).' : `${targetIds.length} kandidat berhasil ditandai Lolos Sortir.`)
        : (targetIds.length === 1 ? 'Status kandidat berhasil dikembalikan ke Belum Disortir.' : `Status ${targetIds.length} kandidat berhasil dibatalkan ke Belum Disortir.`);
      showToast(msg);
      await fetchApplicants();
      await fetchDashboardMetrics();
      if (typeof loadMonthlyRecruitmentChart === 'function') await loadMonthlyRecruitmentChart();
      return;
    }
  } catch (err) {
    console.warn('Fallback local sortir update:', err);
  }

  // Fallback local update
  targetIds.forEach(id => {
    const cand = (candidates || []).find(c => c.id == id);
    if (cand) {
      cand.statusSortir = targetStatus;
      if (!isApprove) {
        cand.statusInterview = 'Belum Dihubungi';
        cand.jadwalInterview = '-';
        cand.statusHRD = 'Menunggu Seleksi';
      }
    }
  });

  persistCandidates();
  renderCandidateTable();
  renderInterviewCards();
  if (typeof renderThirdPartyGrid === 'function') renderThirdPartyGrid();

  const msg = isApprove
    ? (targetIds.length === 1 ? 'Kandidat berhasil ditandai Lolos Sortir (Siap Interview).' : `${targetIds.length} kandidat berhasil ditandai Lolos Sortir.`)
    : (targetIds.length === 1 ? 'Status kandidat berhasil dikembalikan ke Belum Disortir.' : `Status ${targetIds.length} kandidat berhasil dibatalkan ke Belum Disortir.`);
  showToast(msg);
}

async function quickApproveSortir(id) {
  openConfirmSortirModal(id, 'approve');
}

function toggleCheckAll(masterCheckbox) {
  const checkboxes = document.querySelectorAll('.row-checkbox');
  checkboxes.forEach(cb => cb.checked = masterCheckbox.checked);
}
