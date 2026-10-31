/**
 * KAM RECRUIT - Rekapitulasi Dua Tahap Module
 */

let rekapCurrentPage = 1;
let rekapPageSize = 5;
let currentRekapList = [];

function setRekapPhase(phase, resetPage = true) {
  currentRekapPhase = phase;
  if (resetPage) {
    rekapCurrentPage = 1;
  }

  const btn1 = document.getElementById('btn-rekap-tahap1');
  const btn2 = document.getElementById('btn-rekap-tahap2');
  const thead = document.getElementById('rekap-thead');
  const tbody = document.getElementById('rekap-tbody');
  const titleLbl = document.getElementById('rekap-title-lbl');
  const descLbl = document.getElementById('rekap-desc-lbl');
  const paginationContainer = document.getElementById('rekapitulasi-pagination');

  if (!tbody || !thead) return;

  if (phase === 'tahap1') {
    if (btn1) btn1.className = 'px-3.5 py-1.5 rounded-lg bg-blue-900 text-white font-bold shadow-xs transition cursor-pointer flex items-center space-x-1.5';
    if (btn2) btn2.className = 'px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition cursor-pointer flex items-center space-x-1.5';
    if (titleLbl) titleLbl.textContent = 'Daftar Rekapitulasi Tahap I (Kandidat Lolos Sortir Administrasi Glints)';
    if (descLbl) descLbl.textContent = 'Daftar kandidat yang telah lolos verifikasi kualifikasi lowongan dan berhak mengikuti tahap wawancara.';

    thead.innerHTML = `
      <tr>
        <th class="p-3">No</th>
        <th class="p-3">Nama & Kontak</th>
        <th class="p-3">Posisi</th>
        <th class="p-3">Pendidikan</th>
        <th class="p-3">Status Konfirmasi</th>
      </tr>
    `;

    tbody.innerHTML = '';
    currentRekapList = (candidates || []).filter(c => c.statusSortir === 'Lolos Sortir');

    if (currentRekapList.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="p-8 text-center text-slate-400">
            Belum ada data kandidat lolos sortir pada Tahap I.
          </td>
        </tr>
      `;
      if (paginationContainer) paginationContainer.innerHTML = '';
      return;
    }

    const totalPages = Math.max(1, Math.ceil(currentRekapList.length / rekapPageSize));
    if (rekapCurrentPage > totalPages) rekapCurrentPage = totalPages;
    const startIndex = (rekapCurrentPage - 1) * rekapPageSize;
    const pageItems = currentRekapList.slice(startIndex, startIndex + rekapPageSize);

    pageItems.forEach((c, idx) => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50 transition';
      tr.innerHTML = `
        <td class="p-3 font-bold text-slate-400">${startIndex + idx + 1}</td>
        <td class="p-3">
          <button onclick="openCandidateDetail(${c.id})" class="text-left font-bold text-slate-900 hover:text-blue-900 hover:underline cursor-pointer block leading-tight">${c.nama}</button>
          <span class="text-[11px] text-slate-500 block font-mono mt-0.5">${c.phone}</span>
        </td>
        <td class="p-3 font-semibold text-slate-800">${c.posisi}<br><span class="text-[11px] text-slate-400 font-normal">${c.mitra}</span></td>
        <td class="p-3">${c.pendidikan} (${c.kampus})</td>
        <td class="p-3">
          ${c.statusInterview === 'Bersedia'
          ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap shrink-0">Bersedia Hadir</span>'
          : '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap shrink-0">Tidak Merespons</span>'}
        </td>
      `;
      tbody.appendChild(tr);
    });

  } else {
    if (btn2) btn2.className = 'px-3.5 py-1.5 rounded-lg bg-red-600 text-white font-bold shadow-xs transition cursor-pointer flex items-center space-x-1.5';
    if (btn1) btn1.className = 'px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition cursor-pointer flex items-center space-x-1.5';
    if (titleLbl) titleLbl.textContent = 'Daftar Rekapitulasi Tahap II (Hasil Wawancara & Keputusan Kelulusan HRD)';
    if (descLbl) descLbl.textContent = 'Hasil pembaruan keputusan wawancara pada master data yang sama; kandidat siap diserahkan kepada pihak ketiga.';

    thead.innerHTML = `
      <tr>
        <th class="p-3">No</th>
        <th class="p-3">Nama Kandidat</th>
        <th class="p-3">Posisi Outsourcing</th>
        <th class="p-3">Hasil Wawancara</th>
        <th class="p-3">Catatan Evaluator HRD</th>
        <th class="p-3">Status Serah</th>
      </tr>
    `;

    tbody.innerHTML = '';
    currentRekapList = (candidates || []).filter(c => c.statusHRD === 'Lolos Seleksi HRD' || c.statusHRD === 'Tidak Lolos');

    if (currentRekapList.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="p-8 text-center text-slate-400">
            Belum ada data evaluasi wawancara kandidat pada Tahap II.
          </td>
        </tr>
      `;
      if (paginationContainer) paginationContainer.innerHTML = '';
      return;
    }

    const totalPages = Math.max(1, Math.ceil(currentRekapList.length / rekapPageSize));
    if (rekapCurrentPage > totalPages) rekapCurrentPage = totalPages;
    const startIndex = (rekapCurrentPage - 1) * rekapPageSize;
    const pageItems = currentRekapList.slice(startIndex, startIndex + rekapPageSize);

    pageItems.forEach((c, idx) => {
      const isLolos = c.statusHRD === 'Lolos Seleksi HRD';
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50 transition';
      tr.innerHTML = `
        <td class="p-3 font-bold text-slate-400">${startIndex + idx + 1}</td>
        <td class="p-3">
          <strong class="text-slate-900 block leading-tight">${c.nama}</strong>
          <span class="text-[11px] text-slate-500 block font-mono mt-0.5">${c.phone}</span>
        </td>
        <td class="p-3 font-semibold text-slate-800">${c.posisi}<br><span class="text-[11px] text-slate-400 font-normal">${c.mitra}</span></td>
        <td class="p-3">
          ${isLolos
          ? '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap shrink-0">Lolos Seleksi HRD</span>'
          : '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 whitespace-nowrap shrink-0">Tidak Lolos</span>'}
        </td>
        <td class="p-3 text-[11px] text-slate-600 max-w-xs leading-relaxed">${c.catatan || '-'}</td>
        <td class="p-3">
          ${isLolos
          ? '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200 whitespace-nowrap shrink-0">Siap Kirim ke Mitra</span>'
          : '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 whitespace-nowrap shrink-0">Tidak Diserahkan</span>'}
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Render universal pagination bar
  if (typeof renderPaginationBar === 'function') {
    renderPaginationBar({
      containerId: 'rekapitulasi-pagination',
      totalItems: currentRekapList.length,
      currentPage: rekapCurrentPage,
      pageSize: rekapPageSize,
      onPageChange: 'changeRekapPage',
      onPageSizeChange: 'changeRekapPageSize',
      itemLabel: 'kandidat'
    });
  }
}

function changeRekapPage(page) {
  rekapCurrentPage = page;
  setRekapPhase(currentRekapPhase, false);
}

function changeRekapPageSize(size) {
  rekapPageSize = parseInt(size, 10) || 5;
  rekapCurrentPage = 1;
  setRekapPhase(currentRekapPhase, false);
}

function exportRekapExcel() {
  showToast('Mengunduh file rekapitulasi data kandidat PT KAM (.XLSX)...');
  window.location.href = '/api/v1/recapitulation/export-excel';
}

// Modal Operations