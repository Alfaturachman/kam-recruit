const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure destination directories exist
const excelDir = path.resolve(__dirname, '../../uploads/excels');
const cvDir = path.resolve(__dirname, '../../uploads/cv');
if (!fs.existsSync(excelDir)) fs.mkdirSync(excelDir, { recursive: true });
if (!fs.existsSync(cvDir)) fs.mkdirSync(cvDir, { recursive: true });

// Storage for Glints Excel files
const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, excelDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `glints_${Date.now()}_${cleanName}${ext}`);
  }
});

// Filter for Excel / CSV files
const excelFileFilter = (req, file, cb) => {
  const allowed = ['.xlsx', '.xls', '.csv'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Format berkas tidak valid. Harap unggah berkas .xlsx atau .csv resmi dari Glints.'));
  }
};

const uploadExcel = multer({
  storage: excelStorage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: excelFileFilter
});

module.exports = {
  uploadExcel
};

