/**
 * KAM RECRUIT - Core Application State & Navigation Router
 */
let candidates = [];
let vacancies = [];
let currentSelectedCandidateId = null;
let currentRekapPhase = 'tahap1';
let currentInterviewFilter = 'ALL';
let selectedWaCandidate = null;
let currentWaTemplate = 'undangan';

// Real-time Clock
function updateClock() {
  const clockEl = document.getElementById('live-clock');
  if (clockEl) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
    clockEl.textContent = `${timeStr}`;
  }
}
setInterval(updateClock, 1000);
updateClock();

// URL Routing Mapping (HTML5 PushState SPA Router)
const tabToRouteMap = {
  dashboard: '/dashboard',
  pelamar: '/pelamar',
  interview: '/interview',
  rekapitulasi: '/rekapitulasi',
  penyerahan: '/mitra'
};

const routeToTabMap = {
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/pelamar': 'pelamar',
  '/interview': 'interview',
  '/jadwal': 'interview',
  '/rekapitulasi': 'rekapitulasi',
  '/penyerahan': 'penyerahan',
  '/mitra': 'penyerahan'
};

function getTabFromCurrentPath() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  return routeToTabMap[path] || 'dashboard';
}

// Tab Switcher Router (Apple HIG Seamless Segmented Control)
function switchTab(tabId, updateHistory = true) {
  const nav = document.getElementById('sidebar-nav');
  if (nav && !nav.classList.contains('hidden') && window.innerWidth < 1024) {
    nav.classList.add('hidden');
  }

  const tabs = ['dashboard', 'pelamar', 'interview', 'rekapitulasi', 'penyerahan'];
  tabs.forEach(t => {
    const section = document.getElementById(`tab-${t}`);
    const navBtn = document.getElementById(`nav-${t}`);
    const mobileBtn = document.getElementById(`mobile-nav-${t}`);

    if (section) section.classList.add('hidden');
    if (navBtn) {
      navBtn.classList.remove('bg-blue-900', 'text-white', 'shadow-xs');
      navBtn.classList.add('text-slate-600', 'hover:bg-slate-100');
    }
    if (mobileBtn) {
      mobileBtn.classList.remove('text-blue-900', 'font-bold');
      mobileBtn.classList.add('text-slate-400');
    }
  });

  const activeSection = document.getElementById(`tab-${tabId}`);
  const activeNav = document.getElementById(`nav-${tabId}`);
  const activeMobile = document.getElementById(`mobile-nav-${tabId}`);

  if (activeSection) activeSection.classList.remove('hidden');
  if (activeNav) {
    activeNav.classList.remove('text-slate-600', 'hover:bg-slate-100');
    activeNav.classList.add('bg-blue-900', 'text-white', 'shadow-xs');
  }
  if (activeMobile) {
    activeMobile.classList.remove('text-slate-400');
    activeMobile.classList.add('text-blue-900', 'font-bold');
  }

  // Update browser URL route dynamically
  if (updateHistory) {
    const targetUrl = tabToRouteMap[tabId] || '/dashboard';
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({ tab: tabId }, '', targetUrl);
    }
  }

  if (tabId === 'dashboard') {
    if (typeof fetchDashboardMetrics === 'function') fetchDashboardMetrics();
    if (typeof fetchVacancies === 'function') fetchVacancies();
    if (typeof loadMonthlyRecruitmentChart === 'function') loadMonthlyRecruitmentChart();
  }
  if (tabId === 'pelamar' && typeof renderCandidateTable === 'function') renderCandidateTable();
  if (tabId === 'interview' && typeof renderInterviewCards === 'function') renderInterviewCards();
  if (tabId === 'rekapitulasi' && typeof setRekapPhase === 'function') setRekapPhase('tahap1');
  if (tabId === 'penyerahan') {
    if (typeof renderMitraVacanciesTable === 'function') renderMitraVacanciesTable();
    if (typeof renderThirdPartyGrid === 'function') renderThirdPartyGrid();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Browser Navigation Popstate Listener (Handle Back & Forward buttons)
window.addEventListener('popstate', () => {
  const currentTab = getTabFromCurrentPath();
  switchTab(currentTab, false);
});

function toggleMobileMenu() {
  const nav = document.getElementById('sidebar-nav');
  if (nav) {
    nav.classList.toggle('hidden');
  }
}

function showToast(msg, isError = false) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  const toastIcon = document.getElementById('toast-icon');

  if (!toast || !toastMsg || !toastIcon) return;

  toastMsg.textContent = msg;
  if (isError) {
    toastIcon.className = 'w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white';
    toastIcon.textContent = '✕';
  } else {
    toastIcon.className = 'w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white';
    toastIcon.textContent = '✓';
  }

  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('hidden');
}

function persistCandidates() {
  try {
    localStorage.setItem('kam_candidates_db', JSON.stringify(candidates));
  } catch (e) {
    console.warn('Gagal menyimpan ke LocalStorage:', e);
  }
}

function loadPersistedCandidates() {
  try {
    const raw = localStorage.getItem('kam_candidates_db');
    if (raw) {
      candidates = JSON.parse(raw);
      return true;
    }
  } catch (e) {
    console.warn('Gagal membaca LocalStorage:', e);
  }
  return false;
}

function resetSimulationData() {
  localStorage.removeItem('kam_candidates_db');
  showToast('Memuat ulang dataset kandidat asli dari server...');
  setTimeout(() => location.reload(), 800);
}

/**
 * Universal Apple HIG Pagination Controller
 */
function renderPaginationBar({
  containerId,
  totalItems,
  currentPage,
  pageSize,
  pageSizeOptions = [5, 8, 15, 25],
  onPageChange,
  onPageSizeChange,
  itemLabel = 'data'
}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (totalItems <= 0) {
    container.innerHTML = '';
    return;
  }

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);
  const startItem = (validPage - 1) * pageSize + 1;
  const endItem = Math.min(validPage * pageSize, totalItems);

  // Generate numbered buttons (up to 5 buttons centered on validPage)
  let pageButtonsHtml = '';
  const maxButtons = 5;
  let startPage = Math.max(1, validPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let p = startPage; p <= endPage; p++) {
    const isActive = p === validPage;
    pageButtonsHtml += `
      <button onclick="${onPageChange}(${p})"
        class="w-8 h-8 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${isActive
        ? 'bg-blue-900 text-white shadow-xs'
        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
      }">
        ${p}
      </button>
    `;
  }

  const prevDisabled = validPage <= 1
    ? 'disabled class="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 font-bold text-xs cursor-not-allowed opacity-50 flex items-center gap-1.5"'
    : `class="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer transition shadow-2xs flex items-center gap-1.5" onclick="${onPageChange}(${validPage - 1})"`;

  const nextDisabled = validPage >= totalPages
    ? 'disabled class="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 font-bold text-xs cursor-not-allowed opacity-50 flex items-center gap-1.5"'
    : `class="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer transition shadow-2xs flex items-center gap-1.5" onclick="${onPageChange}(${validPage + 1})"`;

  let pageSizeSelectHtml = '';
  if (pageSizeOptions && pageSizeOptions.length > 0) {
    pageSizeSelectHtml = `
      <div class="flex items-center space-x-1.5 text-xs text-slate-500">
        <span>Baris:</span>
        <select onchange="${onPageSizeChange}(this.value)" class="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-900 cursor-pointer">
          ${pageSizeOptions.map(opt => `<option value="${opt}" ${opt === pageSize ? 'selected' : ''}>${opt}</option>`).join('')}
        </select>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 w-full text-xs">
      <div class="flex items-center space-x-3 text-slate-500">
        <span>Menampilkan <strong>${startItem} - ${endItem}</strong> dari <strong>${totalItems}</strong> ${itemLabel}</span>
        ${pageSizeSelectHtml ? `<span class="text-slate-300 hidden sm:inline">&bull;</span>` : ''}
        ${pageSizeSelectHtml}
      </div>
      <div class="inline-flex items-center space-x-1.5">
        <button ${prevDisabled}>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Prev</span>
        </button>
        <div class="flex items-center space-x-1">
          ${pageButtonsHtml}
        </div>
        <button ${nextDisabled}>
          <span>Next</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  `;
}

async function initDynamicApp() {
  try {
    await fetchApplicants();
    await fetchDashboardMetrics();
    await fetchVacancies();
    if (typeof loadMonthlyRecruitmentChart === 'function') {
      await loadMonthlyRecruitmentChart();
    }

    // Determine initial route from URL bar
    const initialTab = getTabFromCurrentPath();
    if (initialTab !== 'dashboard') {
      switchTab(initialTab, false);
    }
  } catch (err) {
    console.warn('Dynamic initialization fallback error:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initDynamicApp();
});
