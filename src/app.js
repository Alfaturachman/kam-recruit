require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { assembleIndexHtml } = require('./utils/viewAssembler');

const app = express();

// Security & Parsing Middlewares
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts/assets for local Tailwind & prototype
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Compile components on boot
assembleIndexHtml();

// Dynamic HTML Routes: serves compiled component views for all main navigation pages
const serveApp = (req, res) => {
  const html = assembleIndexHtml();
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
};

app.get(['/', '/dashboard', '/pelamar', '/interview', '/jadwal', '/rekapitulasi', '/penyerahan', '/mitra'], serveApp);

// Static Asset Serving (Frontend Client)
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/v1/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/v1/vacancies', require('./routes/vacancyRoutes'));
app.use('/api/v1/applicants', require('./routes/applicantRoutes'));
app.use('/api/v1/candidates', require('./routes/communicationRoutes'));
app.use('/api/v1/recapitulation', require('./routes/recapRoutes'));
app.use('/api/v1/handover', require('./routes/handoverRoutes'));

// Root & Health Check Endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    app: process.env.APP_NAME || 'KAM Recruit',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
