const { Router } = require('express');
const { getDailyStats } = require('../controllers/eventsController');

const router = Router();

/**
 * GET /api/events
 * Query params opcionales:
 *   - date   (YYYY-MM-DD)  → filtra por fecha específica (default: hoy)
 *   - limit  (number)      → cantidad de resultados (default: 100, max: 500)
 *   - offset (number)      → desplazamiento para paginación (default: 0)
 */
router.get('/', getDailyStats);



module.exports = router;
