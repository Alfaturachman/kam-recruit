const { Candidate, Vacancy } = require('../models');

/**
 * DASHBOARD CONTROLLER
 * Aggregates real-time KPIs, recruitment funnel, vacancies summary, and monthly analytics.
 */

/**
 * GET /api/v1/dashboard/metrics
 * Get dynamic real-time dashboard metrics from MySQL
 */
async function getDashboardMetrics(req, res) {
  try {
    const funnel = await Candidate.getFunnelCounts();
    const quotaTarget = await Vacancy.getTotalQuota() || 50;

    const sortirRate = funnel.total > 0 ? Math.round((funnel.lolosSortir / funnel.total) * 100) : 0;
    const waResponseRate = funnel.lolosSortir > 0 ? Math.round((funnel.konfirmasiWa / funnel.lolosSortir) * 100) : 0;
    const dropWa = Math.max(0, funnel.lolosSortir - funnel.konfirmasiWa);

    return res.status(200).json({
      success: true,
      data: {
        totalApplicants: funnel.total,
        totalPassedSortir: funnel.lolosSortir,
        sortirRate: sortirRate,
        totalInterviewConfirmed: funnel.konfirmasiWa,
        totalInterviewDrop: dropWa,
        totalInterviewTarget: funnel.lolosSortir,
        interviewResponseRate: waResponseRate,
        totalInterviewEvaluated: funnel.evaluatedHrd,
        totalReadyPartner: funnel.siapMitra,
        quotaFilled: funnel.siapMitra,
        quotaTarget: quotaTarget
      }
    });
  } catch (err) {
    console.error('[METRICS ERROR]', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil metrik dashboard.', error: err.message });
  }
}

/**
 * GET /api/v1/dashboard/vacancies
 * Get all job vacancies with dynamic applicant statistics per position
 */
async function getVacancies(req, res) {
  try {
    const rows = await Vacancy.findAllWithMetrics();
    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (err) {
    console.error('[GET VACANCIES ERROR]', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data lowongan mitra.', error: err.message });
  }
}

/**
 * GET /api/v1/dashboard/monthly-stats
 * Get monthly recruitment statistics (incoming vs accepted) dynamically from MySQL candidates table
 */
async function getMonthlyStats(req, res) {
  try {
    const currentYear = new Date().getFullYear();
    const requestedYear = req.query.year ? parseInt(req.query.year, 10) : currentYear;

    let availableYears = await Candidate.getAvailableYears();
    if (availableYears.length === 0) availableYears = [currentYear];
    if (!availableYears.includes(requestedYear)) availableYears.unshift(requestedYear);

    const monthlyRows = await Candidate.getMonthlyAggregation(requestedYear);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthFullNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const monthlyData = [];
    let sumMasuk = 0;
    let sumDiterima = 0;
    let peakMonth = { name: '-', value: 0 };

    for (let m = 1; m <= 12; m++) {
      const found = monthlyRows.find(r => r.month === m);
      const masuk = found ? parseInt(found.total_incoming, 10) : 0;
      const diterima = found ? parseInt(found.total_accepted, 10) : 0;
      const rate = masuk > 0 ? Math.round((diterima / masuk) * 100) : 0;

      sumMasuk += masuk;
      sumDiterima += diterima;

      if (masuk > peakMonth.value) {
        peakMonth = { name: monthFullNames[m - 1], value: masuk };
      }

      monthlyData.push({
        month: m,
        monthShort: monthNames[m - 1],
        monthFull: monthFullNames[m - 1],
        masuk: masuk,
        diterima: diterima,
        persentaseDiterima: `${rate}%`
      });
    }

    const avgAcceptanceRate = sumMasuk > 0 ? ((sumDiterima / sumMasuk) * 100).toFixed(1) : '0.0';

    return res.status(200).json({
      success: true,
      year: requestedYear,
      availableYears: availableYears,
      summary: {
        totalMasuk: sumMasuk,
        totalDiterima: sumDiterima,
        rataRataPenerimaan: `${avgAcceptanceRate}%`,
        bulanTertinggi: peakMonth.value > 0 ? `${peakMonth.name} (${peakMonth.value} Kandidat)` : 'Belum Ada Data'
      },
      data: monthlyData
    });
  } catch (err) {
    console.error('[MONTHLY STATS ERROR]', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik rekrutmen bulanan.',
      error: err.message
    });
  }
}

module.exports = {
  getDashboardMetrics,
  getVacancies,
  getMonthlyStats
};
