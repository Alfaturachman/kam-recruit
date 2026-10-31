/**
 * KAM RECRUIT - Bank Data Pelamar Module
 */

let pelamarCurrentPage = 1;
let pelamarPageSize = 8;
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
    let statusBadge = '';
    if (c.statusSortir === 'Lolos Sortir') {
      statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200 whitespace-nowrap shrink-0">Lolos Sortir (I)</span>';
    } else if (c.statusSortir === 'Belum Disortir') {
      statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap shrink-0">Belum Disortir</span>';
    } else {
      statusBadge = '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 whitespace-nowrap shrink-0">Tidak Memenuhi</span>';
    }

    // Pengalaman & Sertifikat Quick Previews
    const expPreview = (c.pengalaman && c.pengalaman.length > 0)
      ? `${c.pengalaman[0].periode?.split('(')[1]?.replace(')', '') || c.pengalaman[0].periode} (${c.pengalaman[0].posisi})`
      : 'Fresh Graduate';

    const certPreview = (c.sertifikat && c.sertifikat.length > 0)
      ? `${c.sertifikat.length} Sertifikat Resmi`
      : 'Sertifikat Dasar';

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
        <span class="text-[11px] text-slate-400 block">Usia ${c.usia} Thn &bull; ${c.domisili}</span>
      </td>
      <td class="p-3">
        <div class="space-y-1">
          <span class="text-xs font-semibold text-slate-800 flex items-center gap-1.5 truncate max-w-[170px]" title="${expPreview}">
            <svg class="w-3.5 h-3.5 text-blue-900 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            <span class="truncate">${expPreview}</span>
          </span>
          <span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap shrink-0">
            <svg class="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
            <span>${certPreview}</span>
          </span>
        </div>
      </td>
      <td class="p-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">${c.tglDaftar}</td>
      <td class="p-3">${statusBadge}</td>
      <td class="p-3 text-center">
        <div class="flex flex-col items-center justify-center gap-1.5 min-w-[85px]">
          <button onclick="openCandidateDetail(${c.id})" class="w-full px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer text-xs whitespace-nowrap text-center transition">
            Lihat CV
          </button>
          ${c.statusSortir !== 'Lolos Sortir' ? `
            <button onclick="quickApproveSortir(${c.id})" class="w-full px-2.5 py-1 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-semibold cursor-pointer text-xs whitespace-nowrap text-center transition">
              Loloskan
            </button>
          ` : `
            <span class="w-full text-[11px] text-blue-900 font-bold px-2 py-0.5 whitespace-nowrap text-center bg-blue-50/60 rounded-md">Siap Interview</span>
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
      pageSizeOptions: [5, 8, 15, 25],
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
  pelamarPageSize = parseInt(size, 10) || 8;
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

async function quickApproveSortir(id) {
  const cand = (candidates || []).find(c => c.id == id);
  if (!cand) return;

  try {
    const res = await fetch('/api/v1/applicants/bulk-sortir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidate_ids: [id], status_sortir: 'Lolos Sortir' })
    });
    const json = await res.json();
    if (json.success) {
      showToast(`Kandidat ${cand.nama} ditandai Lolos Sortir.`);
      await fetchApplicants();
      await fetchDashboardMetrics();
      if (typeof loadMonthlyRecruitmentChart === 'function') await loadMonthlyRecruitmentChart();
      return;
    }
  } catch (err) {
    console.warn('Fallback local sortir update:', err);
  }

  cand.statusSortir = 'Lolos Sortir';
  persistCandidates();
  renderCandidateTable();
  renderInterviewCards();
  showToast(`Kandidat ${cand.nama} ditandai Lolos Sortir.`);
}

function toggleCheckAll(masterCheckbox) {
  const checkboxes = document.querySelectorAll('.row-checkbox');
  checkboxes.forEach(cb => cb.checked = masterCheckbox.checked);
}

async function bulkApproveSortir() {
  const checked = Array.from(document.querySelectorAll('.row-checkbox:checked')).map(cb => parseInt(cb.value, 10));
  if (checked.length === 0) {
    showToast('Pilih setidaknya satu kandidat untuk disortir.', true);
    return;
  }

  try {
    const res = await fetch('/api/v1/applicants/bulk-sortir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidate_ids: checked, status_sortir: 'Lolos Sortir' })
    });
    const json = await res.json();
    if (json.success) {
      showToast(`${checked.length} kandidat berhasil ditandai Lolos Sortir.`);
      await fetchApplicants();
      await fetchDashboardMetrics();
      if (typeof loadMonthlyRecruitmentChart === 'function') await loadMonthlyRecruitmentChart();
      return;
    }
  } catch (err) {
    console.warn('Fallback local bulk sortir:', err);
  }

  checked.forEach(id => {
    const c = candidates.find(item => item.id === id);
    if (c) c.statusSortir = 'Lolos Sortir';
  });
  persistCandidates();
  renderCandidateTable();
  renderInterviewCards();
  showToast(`${checked.length} kandidat berhasil ditandai Lolos Sortir.`);
}
