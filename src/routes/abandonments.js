const { Router } = require('express');
const { getAbandonments } = require('../controllers/abandonmentsController');

const router = Router();

/**
 * GET /api/abandonments    
 * Query params opcionales:
 *   - date   (YYYY-MM-DD)  → filtra por fecha específica (default: hoy)
 *   - limit  (number)      → cantidad de resultados (default: 100, max: 500)
 *   - offset (number)      → desplazamiento para paginación (default: 0)
 */
router.get('/', getAbandonments);



module.exports = router;
