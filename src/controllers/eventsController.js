const { pool } = require('../config/database');

/**
 * GET /api/events
 * Retorna eventos del día actual por defecto.
 * Acepta query params opcionales:
 *   - date (YYYY-MM-DD): filtrar por fecha específica
 *   - limit (number):    limitar cantidad de resultados
 *   - offset (number):   paginación
 */
async function getDailyStats(req, res) {
  try {
    const { date, limit = 100, offset = 0 } = req.query;

    // Fecha a consultar: parámetro o hoy por defecto
    const targetDate = date || new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    console.log(`Consultando eventos para fecha: ${targetDate}, limit: ${limit}, offset: ${offset}`);

    // Validar formato de fecha
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(targetDate)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de fecha inválido. Use YYYY-MM-DD',
      });
    }

    // Validar limit y offset
    const parsedLimit  = parseInt(limit, 10);
    const parsedOffset = parseInt(offset, 10);
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 500) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro "limit" debe ser un número entre 1 y 500',
      });
    }

    // Query principal 
    let query = `
      SELECT accion, descripcion, COUNT(accion) as count_accion
      FROM telephony_eventos `;

    if (req.query.date) { 
      query += `WHERE DATE(fecha_hora) = ? `;
    } else if(req.query.week) {
      query += `WHERE YEARWEEK(fecha_hora, 1) = YEARWEEK(CURDATE(), 1) `;
    } else if(req.query.month) {
      query += `WHERE fecha_hora >= DATE_FORMAT(NOW(), '%Y-%m-01') AND fecha_hora < DATE_FORMAT(NOW(), '%Y-%m-01') + INTERVAL 1 MONTH `;
    }

     query+= `and accion NOT IN ('bienvenida', 'timeout')
      group by accion
    `;


    // Query para total de registros (paginación)
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM telephony_eventos 
      WHERE DATE(fecha_hora) = ?
    `;

    const [rows]    = await pool.execute(query, [targetDate]);
    const [countResult] = await pool.execute(countQuery, [targetDate]);
    const total = countResult[0].total;

    return res.status(200).json({
      success: true,
      date: targetDate,
      total,
      data: rows,
    });

  } catch (error) {
    console.error('Error en getDailyStats:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
}



module.exports = { getDailyStats: getDailyStats };
