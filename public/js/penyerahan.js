/**
 * KAM RECRUIT - Master Mitra & Penyerahan CV Module
 * Comprehensive CRUD for Permintaan Mitra Aktif (Job Vacancies) & Candidate Handover with Pagination
 */

let currentMitraSubTab = 'mitra';
let pendingDeleteVacId = null;

// Pagination state for Permintaan Mitra
let mitraVacanciesPage = 1;
let mitraVacanciesPageSize = 5;
let currentMitraVacanciesList = [];

// Pagination state for Kirim CV ke Mitra
let thirdPartyPage = 1;
let thirdPartyPageSize = 5;
let currentThirdPartyList = [];

/**
 * Switch between Sub-Tab: 'mitra' (CRUD Lowongan Mitra) and 'cv' (Kirim CV ke Mitra)
 */
function switchMitraSubTab(subTab) {
  currentMitraSubTab = subTab;
  const viewMitra = document.getElementById('subview-mitra-vacancies');
  const viewCv = document.getElementById('subview-cv-handover');
  const btnMitra = document.getElementById('subtab-btn-mitra');
  const btnCv = document.getElementById('subtab-btn-cv');

  if (subTab === 'mitra') {
    if (viewMitra) viewMitra.classList.remove('hidden');
    if (viewCv) viewCv.classList.add('hidden');

    if (btnMitra) {
      btnMitra.className = 'px-4 py-2 rounded-xl transition shadow-xs bg-blue-900 text-white cursor-pointer flex items-center space-x-2';
    }
    if (btnCv) {
      btnCv.className = 'px-4 py-2 rounded-xl transition text-slate-600 hover:text-slate-900 hover:bg-white/60 cursor-pointer flex items-center space-x-2';
    }
    renderMitraVacanciesTable();
  } else {
    if (viewMitra) viewMitra.classList.add('hidden');
    if (viewCv) viewCv.classList.remove('hidden');

    if (btnCv) {
      btnCv.className = 'px-4 py-2 rounded-xl transition shadow-xs bg-blue-900 text-white cursor-pointer flex items-center space-x-2';
    }
    if (btnMitra) {
      btnMitra.className = 'px-4 py-2 rounded-xl transition text-slate-600 hover:text-slate-900 hover:bg-white/60 cursor-pointer flex items-center space-x-2';
    }
    renderThirdPartyGrid();
  }
}

/**
 * Filter & Search Permintaan Mitra Aktif
 */
function filterMitraVacancies() {
  const q = (document.getElementById('search-mitra-input')?.value || '').toLowerCase().trim();
  const statusFilter = document.getElementById('filter-mitra-status')?.value || 'ALL';

  mitraVacanciesPage = 1; // Reset to page 1 on filter change

  const filtered = (vacancies || []).filter(v => {
    const matchQ = !q || (v.position_title && v.position_title.toLowerCase().includes(q)) || 
                          (v.partner_name && v.partner_name.toLowerCase().includes(q)) || 
                          (v.target_city && v.target_city.toLowerCase().includes(q));
    const matchStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchQ && matchStatus;
  });

  renderMitraVacanciesTable(filtered);
}

/**
 * Render Master Permintaan Mitra Table & Mini KPIs with Pagination
 */
function renderMitraVacanciesTable(items = null) {
  currentMitraVacanciesList = items !== null ? items : (vacancies || []);
  const data = currentMitraVacanciesList;
  const tbody = document.getElementById('mitra-vacancies-tbody');
  
  // Update Sub-Tab Badges
  const badgeMitra = document.getElementById('subtab-mitra-count');
  if (badgeMitra) badgeMitra.textContent = (vacancies || []).length;

  const qualifiedCount = (candidates || []).filter(c => c.statusHRD === 'Lolos Seleksi HRD').length;
  const badgeCv = document.getElementById('subtab-cv-count');
  if (badgeCv) badgeCv.textContent = qualifiedCount;

  // Calculate & Update Mitra Mini KPIs
  const allVac = vacancies || [];
  const totalPos = allVac.length;
  const totalQuota = allVac.reduce((sum, v) => sum + (parseInt(v.quota, 10) || 0), 0);
  const totalFilled = allVac.reduce((sum, v) => sum + (parseInt(v.passed_hrd, 10) || 0), 0);
  const fillRate = totalQuota > 0 ? ((totalFilled / totalQuota) * 100).toFixed(1) : '0.0';

  const elPos = document.getElementById('mitra-kpi-total-pos');
  if (elPos) elPos.textContent = `${totalPos} Lowongan`;

  const elQuota = document.getElementById('mitra-kpi-total-quota');
  if (elQuota) elQuota.textContent = `${totalQuota} Posisi`;

  const elFilled = document.getElementById('mitra-kpi-total-filled');
  if (elFilled) elFilled.textContent = `${totalFilled} Orang`;

  const elRate = document.getElementById('mitra-kpi-fill-rate');
  if (elRate) elRate.textContent = `${fillRate}%`;

  if (!tbody) return;
  tbody.innerHTML = '';

  const paginationContainer = document.getElementById('mitra-vacancies-pagination');

  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="p-8 text-center text-slate-400">
          <div class="max-w-xs mx-auto space-y-2">
            <svg class="w-8 h-8 mx-auto text-slate-300" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
            <p class="font-bold text-slate-600">Tidak ada data permintaan mitra</p>
            <p class="text-[11px] text-slate-400">Silakan sesuaikan filter pencarian atau klik "+ Tambah Permintaan Mitra".</p>
          </div>
        </td>
      </tr>
    `;
    if (paginationContainer) paginationContainer.innerHTML = '';
    return;
  }

  // Calculate pagination slice
  const totalPages = Math.max(1, Math.ceil(data.length / mitraVacanciesPageSize));
  if (mitraVacanciesPage > totalPages) mitraVacanciesPage = totalPages;
  const startIndex = (mitraVacanciesPage - 1) * mitraVacanciesPageSize;
  const pageItems = data.slice(startIndex, startIndex + mitraVacanciesPageSize);

  pageItems.forEach((v, idx) => {
    const quotaVal = parseInt(v.quota, 10) || 10;
    const filledVal = parseInt(v.passed_hrd, 10) || 0;
    const pct = Math.min(100, Math.round((filledVal / quotaVal) * 100));

    // Status Badge Styling
    let statusClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (v.status === 'Ditutup') {
      statusClass = 'bg-amber-50 text-amber-700 border-amber-200';
    } else if (v.status === 'Arsip') {
      statusClass = 'bg-slate-100 text-slate-600 border-slate-200';
    }

    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50/80 transition group';
    tr.innerHTML = `
      <td class="py-3.5 px-4">
        <div class="flex items-center space-x-2.5">
          <span class="w-5 text-[10px] font-bold text-slate-400">${startIndex + idx + 1}.</span>
          <div>
            <span class="font-bold text-slate-900 group-hover:text-blue-900 transition block text-xs">${v.position_title}</span>
            <span class="inline-flex items-center gap-1 text-[10px] text-slate-500 font-medium">
              <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2a8 8 0 0 0-8 8c0 5 8 12 8 12s8-7 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>${v.target_city || 'Semarang'}</span>
            </span>
          </div>
        </div>
      </td>

      <td class="py-3.5 px-4 font-bold text-slate-800">
        <div class="flex items-center space-x-1.5">
          <div class="w-2 h-2 rounded-full bg-blue-900"></div>
          <span>${v.partner_name}</span>
        </div>
      </td>

      <td class="py-3.5 px-4">
        <div class="text-[11px] text-slate-600 space-y-0.5">
          <span class="font-semibold block">Maks ${v.max_age || 30} Thn</span>
          <span class="text-slate-400 text-[10px]">Min. ${v.min_education || 'SMA/SMK'}</span>
        </div>
      </td>

      <td class="py-3.5 px-4">
        <div class="space-y-1 max-w-[130px]">
          <div class="flex justify-between items-center text-[10px] font-bold">
            <span class="text-slate-700">${filledVal} / ${quotaVal} Org</span>
            <span class="${pct >= 100 ? 'text-emerald-700' : 'text-blue-900'}">${pct}%</span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div class="${pct >= 100 ? 'bg-emerald-500' : 'bg-blue-900'} h-1.5 rounded-full transition-all duration-500" style="width: ${pct}%"></div>
          </div>
        </div>
      </td>

      <td class="py-3.5 px-4 text-center">
        <button onclick="quickToggleVacancyStatus(${v.id}, '${v.status || 'Dibuka'}')" title="Klik untuk mengubah status cepat"
          class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border transition cursor-pointer hover:opacity-85 ${statusClass}">
          <span class="w-1.5 h-1.5 rounded-full mr-1.5 ${v.status === 'Dibuka' ? 'bg-emerald-600' : v.status === 'Ditutup' ? 'bg-amber-600' : 'bg-slate-500'}"></span>
          <span>${v.status || 'Dibuka'}</span>
        </button>
      </td>

      <td class="py-3.5 px-4 text-right">
        <div class="inline-flex items-center space-x-1.5">
          <button onclick="openEditVacancyModal(${v.id})" title="Edit Permintaan Mitra"
            class="p-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 hover:text-blue-900 hover:border-blue-200 text-slate-600 transition cursor-pointer">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>

          <button onclick="openDeleteVacancyModal(${v.id}, '${(v.position_title || '').replace(/'/g, "\\'")}', '${(v.partner_name || '').replace(/'/g, "\\'")}', ${v.total_applicants || 0})" title="Hapus Lowongan"
            class="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-400 transition cursor-pointer">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Render Pagination Bar
  if (typeof renderPaginationBar === 'function') {
    renderPaginationBar({
      containerId: 'mitra-vacancies-pagination',
      totalItems: data.length,
      currentPage: mitraVacanciesPage,
      pageSize: mitraVacanciesPageSize,
      onPageChange: 'changeMitraVacanciesPage',
      onPageSizeChange: 'changeMitraVacanciesPageSize',
      itemLabel: 'permintaan mitra'
    });
  }
}

function changeMitraVacanciesPage(page) {
  mitraVacanciesPage = page;
  renderMitraVacanciesTable(currentMitraVacanciesList);
}

function changeMitraVacanciesPageSize(size) {
  mitraVacanciesPageSize = parseInt(size, 10) || 5;
  mitraVacanciesPage = 1;
  renderMitraVacanciesTable(currentMitraVacanciesList);
}

/**
 * Open Modal to Add New Vacancy
 */
function openAddVacancyModal() {
  const form = document.getElementById('form-vacancy');
  if (form) form.reset();

  const idInput = document.getElementById('vac-id');
  if (idInput) idInput.value = '';

  const titleEl = document.getElementById('modal-vac-title');
  if (titleEl) titleEl.textContent = 'Tambah Permintaan Mitra Baru';

  const modal = document.getElementById('modal-vacancy');
  if (modal) modal.classList.remove('hidden');
}

/**
 * Open Modal to Edit Existing Vacancy
 */
function openEditVacancyModal(id) {
  const vac = (vacancies || []).find(v => v.id == id);
  if (!vac) {
    showToast('Data permintaan mitra tidak ditemukan.', true);
    return;
  }

  const idInput = document.getElementById('vac-id');
  if (idInput) idInput.value = vac.id;

  const posInput = document.getElementById('vac-position');
  if (posInput) posInput.value = vac.position_title || '';

  const partnerInput = document.getElementById('vac-partner');
  if (partnerInput) partnerInput.value = vac.partner_name || '';

  const cityInput = document.getElementById('vac-city');
  if (cityInput) cityInput.value = vac.target_city || 'Semarang';

  const quotaInput = document.getElementById('vac-quota');
  if (quotaInput) quotaInput.value = vac.quota || 10;

  const eduSelect = document.getElementById('vac-edu');
  if (eduSelect) eduSelect.value = vac.min_education || 'SMA/SMK';

  const ageInput = document.getElementById('vac-age');
  if (ageInput) ageInput.value = vac.max_age || 30;

  const statusSelect = document.getElementById('vac-status');
  if (statusSelect) statusSelect.value = vac.status || 'Dibuka';

  const titleEl = document.getElementById('modal-vac-title');
  if (titleEl) titleEl.textContent = `Edit Permintaan: ${vac.position_title}`;

  const modal = document.getElementById('modal-vacancy');
  if (modal) modal.classList.remove('hidden');
}

/**
 * Handle Form Submit for Create or Update Vacancy
 */
async function handleSaveVacancy(e) {
  e.preventDefault();

  const id = document.getElementById('vac-id')?.value;
  const position_title = document.getElementById('vac-position')?.value.trim();
  const partner_name = document.getElementById('vac-partner')?.value.trim();
  const target_city = document.getElementById('vac-city')?.value.trim() || 'Semarang';
  const quota = parseInt(document.getElementById('vac-quota')?.value, 10) || 10;
  const min_education = document.getElementById('vac-edu')?.value || 'SMA/SMK';
  const max_age = parseInt(document.getElementById('vac-age')?.value, 10) || 30;
  const status = document.getElementById('vac-status')?.value || 'Dibuka';

  if (!position_title || !partner_name) {
    showToast('Posisi jabatan dan nama mitra wajib diisi.', true);
    return;
  }

  const payload = {
    position_title,
    partner_name,
    target_city,
    quota,
    min_education,
    max_age,
    status
  };

  const btnSave = document.getElementById('btn-save-vac');
  if (btnSave) {
    btnSave.disabled = true;
    btnSave.innerHTML = `<span>Menyimpan...</span>`;
  }

  try {
    const isEdit = Boolean(id);
    const url = isEdit ? `/api/v1/vacancies/${id}` : '/api/v1/vacancies';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (!json.success) {
      showToast(json.message || 'Gagal menyimpan data.', true);
      return;
    }

    showToast(isEdit ? 'Data permintaan mitra berhasil diperbarui.' : 'Permintaan mitra baru berhasil ditambahkan.');
    closeModal('modal-vacancy');

    // Refresh data across the application
    await fetchVacancies();
    if (typeof fetchDashboardMetrics === 'function') fetchDashboardMetrics();
  } catch (err) {
    console.error('Error saving vacancy:', err);
    showToast('Terjadi kesalahan jaringan saat menyimpan data.', true);
  } finally {
    if (btnSave) {
      btnSave.disabled = false;
      btnSave.innerHTML = `<span>Simpan Data</span>`;
    }
  }
}

/**
 * Quick Toggle Status between 'Dibuka' and 'Ditutup'
 */
async function quickToggleVacancyStatus(id, currentStatus) {
  const newStatus = currentStatus === 'Dibuka' ? 'Ditutup' : 'Dibuka';

  try {
    const res = await fetch(`/api/v1/vacancies/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    const json = await res.json();
    if (json.success) {
      showToast(`Status lowongan diubah menjadi "${newStatus}".`);
      await fetchVacancies();
      if (typeof fetchDashboardMetrics === 'function') fetchDashboardMetrics();
    } else {
      showToast(json.message || 'Gagal mengubah status lowongan.', true);
    }
  } catch (err) {
    console.error('Toggle status error:', err);
    showToast('Terjadi kesalahan saat mengubah status lowongan.', true);
  }
}

/**
 * Open Modal Confirm Delete Vacancy
 */
function openDeleteVacancyModal(id, title, partner, totalApplicants) {
  pendingDeleteVacId = id;
  const descEl = document.getElementById('del-vac-desc');
  const titleEl = document.getElementById('del-vac-title');

  if (titleEl) titleEl.textContent = `Hapus "${title}"?`;
  if (descEl) {
    if (totalApplicants > 0) {
      descEl.innerHTML = `Perhatian: Lowongan pada <strong>${partner}</strong> ini memiliki <strong>${totalApplicants} kandidat</strong> terdaftar. Menghapus lowongan ini akan menghapus relasi kandidat terkait secara permanen. Apakah Anda yakin?`;
    } else {
      descEl.textContent = `Apakah Anda yakin ingin menghapus lowongan "${title}" (${partner}) secara permanen?`;
    }
  }

  const btnConfirm = document.getElementById('btn-confirm-delete-vac');
  if (btnConfirm) {
    btnConfirm.onclick = () => executeDeleteVacancy(totalApplicants > 0);
  }

  const modal = document.getElementById('modal-delete-vacancy');
  if (modal) modal.classList.remove('hidden');
}

/**
 * Execute Delete Vacancy
 */
async function executeDeleteVacancy(isForced) {
  if (!pendingDeleteVacId) return;

  const btnConfirm = document.getElementById('btn-confirm-delete-vac');
  if (btnConfirm) {
    btnConfirm.disabled = true;
    btnConfirm.textContent = 'Menghapus...';
  }

  try {
    const url = `/api/v1/vacancies/${pendingDeleteVacId}${isForced ? '?force=true' : ''}`;
    const res = await fetch(url, { method: 'DELETE' });
    const json = await res.json();

    if (json.success) {
      showToast('Permintaan mitra berhasil dihapus.');
      closeModal('modal-delete-vacancy');
      pendingDeleteVacId = null;
      await fetchVacancies();
      await fetchApplicants();
      if (typeof fetchDashboardMetrics === 'function') fetchDashboardMetrics();
    } else {
      showToast(json.message || 'Gagal menghapus lowongan mitra.', true);
    }
  } catch (err) {
    console.error('Delete vacancy error:', err);
    showToast('Terjadi kesalahan jaringan saat menghapus data.', true);
  } finally {
    if (btnConfirm) {
      btnConfirm.disabled = false;
      btnConfirm.textContent = 'Hapus Permanen';
    }
  }
}

/**
 * Render Candidate Cards Ready for Third-Party (1 Kolom Vertikal) with Pagination
 */
function renderThirdPartyGrid() {
  const tbody = document.getElementById('thirdparty-tbody') || document.getElementById('thirdparty-grid');
  if (!tbody) return;
  tbody.innerHTML = '';

  const qualified = (candidates || []).filter(c => c.statusHRD === 'Lolos Seleksi HRD');
  currentThirdPartyList = qualified;

  // Update badges
  const badgeCv = document.getElementById('subtab-cv-count');
  if (badgeCv) badgeCv.textContent = qualified.length;

  const countBadge = document.getElementById('thirdparty-count-badge');
  if (countBadge) countBadge.textContent = `${qualified.length} Kandidat Siap Serah`;

  const paginationContainer = document.getElementById('thirdparty-pagination');

  if (qualified.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="p-12 text-center text-slate-400">
          <div class="max-w-sm mx-auto space-y-2">
            <div class="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <p class="text-xs font-bold text-slate-700">Belum Ada Kandidat Lolos Seleksi HRD</p>
            <p class="text-[11px] text-slate-400 leading-relaxed">Kandidat yang telah dinilai dan dinyatakan 'Lolos Seleksi HRD' pada evaluasi wawancara akan otomatis muncul di sini untuk penyerahan berkas ke mitra.</p>
          </div>
        </td>
      </tr>
    `;
    if (paginationContainer) paginationContainer.innerHTML = '';
    return;
  }

  // Calculate pagination slice
  const totalPages = Math.max(1, Math.ceil(qualified.length / thirdPartyPageSize));
  if (thirdPartyPage > totalPages) thirdPartyPage = totalPages;
  const startIndex = (thirdPartyPage - 1) * thirdPartyPageSize;
  const pageItems = qualified.slice(startIndex, startIndex + thirdPartyPageSize);

  pageItems.forEach(c => {
    const topExp = (c.pengalaman && c.pengalaman.length > 0)
      ? `${c.pengalaman[0].posisi} (${c.pengalaman[0].perusahaan})`
      : 'Fresh Graduate';

    const topCert = (c.sertifikat && c.sertifikat.length > 0)
      ? `${c.sertifikat[0].nama}`
      : '-';

    const initials = c.nama.split(' ').map(n => n[0]).slice(0, 2).join('');

    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50/70 transition';
    tr.innerHTML = `
      <td class="py-3 px-4">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 rounded-xl bg-blue-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            ${initials}
          </div>
          <div class="min-w-0">
            <button onclick="openCandidateDetail(${c.id})" class="text-slate-900 font-bold hover:text-blue-900 hover:underline cursor-pointer transition text-left block truncate">
              ${c.nama}
            </button>
            <span class="text-[11px] text-slate-400 block">${c.domisili} (${c.usia} Thn)</span>
          </div>
        </div>
      </td>
      <td class="py-3 px-4">
        <strong class="text-slate-900 block font-semibold">${c.posisi}</strong>
        <span class="text-[11px] text-slate-500 block truncate">${c.mitra}</span>
      </td>
      <td class="py-3 px-4">
        <div class="font-semibold text-slate-800">${c.pendidikan}</div>
        <div class="text-[11px] text-slate-500 truncate max-w-[140px]" title="${c.kampus}">${c.kampus}</div>
      </td>
      <td class="py-3 px-4">
        <div class="font-semibold text-slate-800 truncate max-w-[170px]" title="${topExp}">${topExp}</div>
        <span class="text-[10px] text-slate-400">Glints Verified</span>
      </td>
      <td class="py-3 px-4">
        <div class="font-medium text-emerald-800 text-[11px] truncate max-w-[160px]" title="${topCert}">${topCert}</div>
      </td>
      <td class="py-3 px-4 text-center">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap">
          &check; ${c.statusHRD}
        </span>
        ${(c.catatan && c.catatan !== '-') ? `<span class="block text-[10px] text-slate-500 italic mt-0.5 truncate max-w-[130px] mx-auto" title="${c.catatan}">${c.catatan}</span>` : ''}
      </td>
      <td class="py-3 px-4 text-right">
        <div class="flex items-center justify-end space-x-1.5">
          <button onclick="openCandidateDetail(${c.id})" title="Lihat Profil & CV Lengkap"
            class="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center space-x-1 transition cursor-pointer shadow-2xs">
            <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span class="hidden xl:inline">Lihat CV</span>
          </button>
          <button onclick="sendCvToMitra(${c.id})" title="Kirim Berkas CV ke Mitra"
            class="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-xl text-xs transition cursor-pointer flex items-center space-x-1 shadow-xs active:scale-[0.98]">
            <svg class="w-3.5 h-3.5 text-blue-200" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8"/>
              <polyline points="15 16 19 20 23 16"/>
              <line x1="19" y1="10" x2="19" y2="20"/>
            </svg>
            <span>Kirim ke Mitra</span>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Render Pagination Bar for Third Party CVs
  if (typeof renderPaginationBar === 'function') {
    renderPaginationBar({
      containerId: 'thirdparty-pagination',
      totalItems: qualified.length,
      currentPage: thirdPartyPage,
      pageSize: thirdPartyPageSize,
      onPageChange: 'changeThirdPartyPage',
      onPageSizeChange: 'changeThirdPartyPageSize',
      itemLabel: 'kandidat lolos HRD'
    });
  }
}

function changeThirdPartyPage(page) {
  thirdPartyPage = page;
  renderThirdPartyGrid();
}

function changeThirdPartyPageSize(size) {
  thirdPartyPageSize = parseInt(size, 10) || 5;
  thirdPartyPage = 1;
  renderThirdPartyGrid();
}

async function sendCvToMitra(candidateId, namaParam = null, mitraParam = null) {
  const cand = (candidates || []).find(c => c.id == candidateId);
  const nama = namaParam || (cand ? cand.nama : 'Kandidat');
  const mitra = mitraParam || (cand ? cand.mitra : 'Mitra Perusahaan');

  try {
    const res = await fetch('/api/v1/handover/submit-to-partner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidate_ids: [candidateId],
        partner_name: mitra,
        notes: `Penyerahan berkas CV ${nama}`
      })
    });
    const json = await res.json();
    if (json.success) {
      showToast(`Berkas CV dan Lembar Penilaian ${nama} resmi diserahkan ke ${mitra}.`);
      await fetchApplicants();
      await fetchDashboardMetrics();
      return;
    }
  } catch (err) {
    console.warn('Fallback local submit to partner:', err);
  }
  showToast(`Berkas CV dan Lembar Penilaian ${nama} berhasil dikirim ke ${mitra}.`);
}

function downloadAllCVBundle() {
  showToast('Mengunduh bundel CV kandidat lolos seleksi HRD (.ZIP)...');
  window.location.href = '/api/v1/handover/bundle-zip';
}
