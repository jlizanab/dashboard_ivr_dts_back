require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');
const eventsRouter = require('./routes/events');
const abandonmentsRouter = require('./routes/abandonments');
const detailsRouter = require('./routes/details');
const phonesRouter = require('./routes/phones');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 3000;


app.use(cors());

// ─── Middlewares globales ────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Rutas ───────────────────────────────────────────────────────────────────
app.use('/api/dailyStats', eventsRouter);
app.use('/api/abandonments', abandonmentsRouter);
app.use('/api/details', detailsRouter);
app.use('/api/phones', phonesRouter);

// ─── Manejo de errores ───────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Inicio del servidor ─────────────────────────────────────────────────────
async function start() {
  await testConnection();         // valida la conexión antes de levantar
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📋 Endpoints disponibles:`);
    console.log(`   GET  /health`);
    console.log(`   GET  /api/events`);
    console.log(`   GET  /api/events?date=YYYY-MM-DD`);
    console.log(`   GET  /api/events?limit=50&offset=0`);
  });
}

start();