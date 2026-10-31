/**
 * KAM RECRUIT - Dashboard & Analytics Module
 * 100% Dynamic MySQL Real-time Analytics (Zero hardcoding, Zero fake data)
 */

async function fetchDashboardMetrics() {
  try {
    const res = await fetch('/api/v1/dashboard/metrics');
    const json = await res.json();
    if (json.success) {
      const d = json.data;

      // Update 4 Top Metrics KPI Cards
      const totalEl = document.getElementById('kpi-total-val');
      if (totalEl) totalEl.innerHTML = `${d.totalApplicants} <span class="text-xs font-medium text-slate-400">Kandidat</span>`;

      const sortirEl = document.getElementById('kpi-sortir-val');
      if (sortirEl) sortirEl.innerHTML = `${d.totalPassedSortir} <span class="text-xs font-medium text-slate-400">Orang</span>`;

      const interviewEl = document.getElementById('kpi-interview-val');
      if (interviewEl) interviewEl.innerHTML = `${d.totalInterviewConfirmed} <span class="text-xs font-medium text-slate-400">Terkonfirmasi</span>`;

      const partnerEl = document.getElementById('kpi-partner-val');
      if (partnerEl) partnerEl.innerHTML = `${d.totalReadyPartner} <span class="text-xs font-medium text-slate-400">Kandidat</span>`;
    }
  } catch (e) {
    console.warn('Gagal memuat metrik real-time:', e);
  }
}

async function fetchVacancies() {
  try {
    const res = await fetch('/api/v1/vacancies');
    const json = await res.json();
    if (json.success && json.data) {
      vacancies = json.data;
      renderVacanciesTable(vacancies);
      if (typeof renderMitraVacanciesTable === 'function') {
        renderMitraVacanciesTable(vacancies);
      }
      if (typeof renderSidebarVacancies === 'function') {
        renderSidebarVacancies(vacancies);
      }
    }
  } catch (e) {
    console.warn('Gagal memuat data lowongan:', e);
  }
}

let dashboardVacanciesPage = 1;
let dashboardVacanciesPageSize = 5;
let currentDashboardVacanciesList = [];

function renderVacanciesTable(items) {
  const tbody = document.getElementById('dashboard-vacancies-tbody');
  currentDashboardVacanciesList = items || vacancies || [];
  const list = currentDashboardVacanciesList;

  if (!tbody) return;
  tbody.innerHTML = '';

  const paginationContainer = document.getElementById('dashboard-vacancies-pagination');

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="p-8 text-center text-slate-400">
          Belum ada data lowongan aktif yang terdaftar.
        </td>
      </tr>
    `;
    if (paginationContainer) paginationContainer.innerHTML = '';
    return;
  }

  // Calculate pagination slice
  const totalPages = Math.max(1, Math.ceil(list.length / dashboardVacanciesPageSize));
  if (dashboardVacanciesPage > totalPages) dashboardVacanciesPage = totalPages;
  const startIndex = (dashboardVacanciesPage - 1) * dashboardVacanciesPageSize;
  const pageItems = list.slice(startIndex, startIndex + dashboardVacanciesPageSize);

  pageItems.forEach(v => {
    const pct = v.quota > 0 ? Math.round((v.passed_hrd / v.quota) * 100) : 0;
    const location = v.work_location || v.target_city;
    const locationText = location ? `, ${location}` : '';
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50/80 transition';
    tr.innerHTML = `
      <td class="p-3">
        <strong class="text-slate-900 block font-bold text-xs sm:text-sm">${v.position_title}</strong>
        <span class="text-[11px] text-slate-500">${v.partner_name}${locationText}</span>
      </td>
      <td class="p-3 font-semibold text-slate-700">${v.quota} Posisi</td>
      <td class="p-3 font-bold text-blue-900">${v.total_applicants} Pelamar</td>
      <td class="p-3 font-semibold text-slate-700">${v.passed_sortir} Lolos</td>
      <td class="p-3">
        <div class="flex items-center space-x-2">
          <span class="font-bold text-emerald-700">${v.passed_hrd}</span>
          <div class="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div class="bg-emerald-600 h-full" style="width: ${Math.min(100, pct)}%"></div>
          </div>
          <span class="text-[10px] text-slate-400">${pct}%</span>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Render Pagination Bar
  if (typeof renderPaginationBar === 'function') {
    renderPaginationBar({
      containerId: 'dashboard-vacancies-pagination',
      totalItems: list.length,
      currentPage: dashboardVacanciesPage,
      pageSize: dashboardVacanciesPageSize,
      onPageChange: 'changeDashboardVacanciesPage',
      onPageSizeChange: 'changeDashboardVacanciesPageSize',
      itemLabel: 'lowongan'
    });
  }
}

function changeDashboardVacanciesPage(page) {
  dashboardVacanciesPage = page;
  renderVacanciesTable(currentDashboardVacanciesList);
}

function changeDashboardVacanciesPageSize(size) {
  dashboardVacanciesPageSize = parseInt(size, 10) || 5;
  dashboardVacanciesPage = 1;
  renderVacanciesTable(currentDashboardVacanciesList);
}

function renderSidebarVacancies(items) {
  const list = document.getElementById('sidebar-vacancies-list');
  if (!list) return;
  list.innerHTML = '';

  items.slice(0, 3).forEach(v => {
    const div = document.createElement('div');
    div.className = 'flex justify-between items-center';
    div.innerHTML = `
      <div>
        <strong class="text-slate-800 block text-xs truncate max-w-[130px]">${v.position_title}</strong>
        <span class="text-[10px] text-slate-400 block truncate max-w-[130px]">${v.partner_name}</span>
      </div>
      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-900 whitespace-nowrap shrink-0">${v.quota} Org</span>
    `;
    list.appendChild(div);
  });
}

// ==============================================================
// RECRUITMENT MONTHLY RECAPITULATION CHART (100% DYNAMIC MYSQL)
// ==============================================================
let currentChartYear = 2026;
let monthlyStatsCache = {};

async function loadMonthlyRecruitmentChart(year = currentChartYear) {
  currentChartYear = year;
  try {
    const res = await fetch(`/api/v1/dashboard/monthly-stats?year=${year}`);
    const json = await res.json();
    if (!json.success) return;

    monthlyStatsCache[year] = json;

    // Populate year selector options dynamically from database
    const yrSelect = document.getElementById('monthly-chart-year');
    if (yrSelect && json.availableYears) {
      yrSelect.innerHTML = json.availableYears.map(y => `<option value="${y}" ${y == year ? 'selected' : ''}>${y}</option>`).join('');
    }

    // Update Summary KPI Strip
    const sumMasuk = document.getElementById('sum-masuk-val');
    if (sumMasuk) sumMasuk.textContent = json.summary.totalMasuk;
    const sumDiterima = document.getElementById('sum-diterima-val');
    if (sumDiterima) sumDiterima.textContent = json.summary.totalDiterima;
    const sumRate = document.getElementById('sum-rate-val');
    if (sumRate) sumRate.textContent = json.summary.rataRataPenerimaan;

    // Render 12 months dynamic bars
    renderMonthlyBars(json.data, year);

    // Render Table View
    renderMonthlyTable(json.data);

    // Highlight active month (current month or peak)
    const currentMonthNum = new Date().getMonth() + 1;
    const activeMonth = json.data.find(m => m.month === currentMonthNum) || json.data.find(m => m.masuk > 0) || json.data[0];
    if (activeMonth) {
      updateChartTooltip(activeMonth, year);
    }
  } catch (err) {
    console.warn('Gagal memuat data statistik bulanan real-time dari MySQL:', err);
  }
}

function renderMonthlyBars(monthsData, year) {
  const grid = document.getElementById('monthly-bars-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const maxVal = Math.max(...monthsData.map(m => m.masuk), 1);

  monthsData.forEach(m => {
    const masukPct = m.masuk > 0 ? Math.max(6, Math.round((m.masuk / maxVal) * 85)) : 0;
    const diterimaPct = m.diterima > 0 ? Math.max(4, Math.round((m.diterima / maxVal) * 85)) : 0;

    const col = document.createElement('div');
    col.className = 'group flex flex-col items-center justify-end h-full cursor-pointer relative';
    col.onclick = () => updateChartTooltip(m, year);
    col.onmouseenter = () => updateChartTooltip(m, year);

    col.innerHTML = `
      <div class="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-full pb-1">
        <!-- Masuk Bar (Blue) -->
        <div class="w-full max-w-[14px] sm:max-w-[18px] bg-blue-900 group-hover:bg-blue-800 rounded-t-md transition-all duration-500 relative flex flex-col justify-between items-center ${m.masuk === 0 ? 'bg-slate-200/60' : ''}"
             style="height: ${m.masuk > 0 ? masukPct + '%' : '3px'}" title="${m.monthFull}: ${m.masuk} Masuk">
          ${m.masuk > 0 ? `<span class="text-[8px] sm:text-[9px] font-bold text-slate-700 -top-4 absolute hidden group-hover:block whitespace-nowrap">${m.masuk}</span>` : ''}
        </div>

        <!-- Diterima Bar (Emerald) -->
        <div class="w-full max-w-[14px] sm:max-w-[18px] bg-emerald-600 group-hover:bg-emerald-500 rounded-t-md transition-all duration-500 relative flex flex-col justify-between items-center ${m.diterima === 0 ? 'bg-slate-200/40' : ''}"
             style="height: ${m.diterima > 0 ? diterimaPct + '%' : '3px'}" title="${m.monthFull}: ${m.diterima} Diterima">
          ${m.diterima > 0 ? `<span class="text-[8px] sm:text-[9px] font-bold text-emerald-700 -top-4 absolute hidden group-hover:block whitespace-nowrap">${m.diterima}</span>` : ''}
        </div>
      </div>
      <span class="text-[9px] sm:text-[11px] font-bold text-slate-600 group-hover:text-blue-900 group-hover:underline transition text-center pt-1 border-t border-slate-200 w-full block">
        ${m.monthShort}
      </span>
    `;
    grid.appendChild(col);
  });
}

function updateChartTooltip(m, year) {
  const tipMonth = document.getElementById('tip-month-name');
  const tipDetail = document.getElementById('tip-detail-text');
  const tipNote = document.getElementById('tip-note-text');

  if (tipMonth) tipMonth.textContent = `${m.monthFull} ${year}:`;
  if (tipDetail) {
    if (m.masuk === 0) {
      tipDetail.innerHTML = `<span class="text-slate-400">Tidak ada pendaftaran berkas pada bulan ini</span>`;
    } else {
      tipDetail.innerHTML = `<strong>${m.masuk}</strong> Kandidat Masuk, <strong class="text-emerald-700">${m.diterima}</strong> Diterima (${m.persentaseDiterima})`;
    }
  }
  if (tipNote) {
    tipNote.textContent = '';
  }
}

function renderMonthlyTable(monthsData) {
  const tbody = document.getElementById('monthly-table-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  monthsData.forEach(m => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition';
    tr.innerHTML = `
      <td class="p-3 font-bold text-slate-900">${m.monthFull}</td>
      <td class="p-3 text-center font-bold ${m.masuk > 0 ? 'text-blue-900' : 'text-slate-400'}">${m.masuk} Kandidat</td>
      <td class="p-3 text-center font-bold ${m.diterima > 0 ? 'text-emerald-700' : 'text-slate-400'}">${m.diterima} Orang</td>
      <td class="p-3 text-center">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${m.masuk > 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-400'}">
          ${m.persentaseDiterima}
        </span>
      </td>
      <td class="p-3 text-slate-500 text-xs">${m.masuk > 0 ? 'Selesai Direkap' : 'Nihil'}</td>
    `;
    tbody.appendChild(tr);
  });
}

function toggleChartView(view) {
  const chartContainer = document.getElementById('chart-view-container');
  const tableContainer = document.getElementById('table-view-container');
  const btnChart = document.getElementById('btn-view-chart');
  const btnTable = document.getElementById('btn-view-table');

  if (view === 'chart') {
    if (chartContainer) chartContainer.classList.remove('hidden');
    if (tableContainer) tableContainer.classList.add('hidden');
    if (btnChart) btnChart.className = 'px-2.5 py-1 rounded-lg bg-white text-blue-900 font-bold shadow-2xs transition cursor-pointer';
    if (btnTable) btnTable.className = 'px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 transition cursor-pointer';
  } else {
    if (chartContainer) chartContainer.classList.add('hidden');
    if (tableContainer) tableContainer.classList.remove('hidden');
    if (btnChart) btnChart.className = 'px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 transition cursor-pointer';
    if (btnTable) btnTable.className = 'px-2.5 py-1 rounded-lg bg-white text-blue-900 font-bold shadow-2xs transition cursor-pointer';
  }
}
