const { Router } = require('express');
const { getDetails: getDetails } = require('../controllers/detailsController');

const router = Router();

/**
 * GET /api/details    
 * Query params opcionales:
 *   - date   (YYYY-MM-DD)  → filtra por fecha específica (default: hoy)
 *   - limit  (number)      → cantidad de resultados (default: 100, max: 500)
 *   - offset (number)      → desplazamiento para paginación (default: 0)
 */
router.get('/', getDetails);



module.exports = router;
