const app = require('./app');

const PORT = process.env.APP_PORT || 3000;

app.listen(PORT, () => {
  console.log(`[KAM RECRUIT] Server running on http://localhost:${PORT}`);
  console.log(`[KAM RECRUIT] Health check at http://localhost:${PORT}/api/v1/health`);
});

