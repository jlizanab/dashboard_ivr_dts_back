const { pool } = require('../config/database');


//getAbandonment

async function getAbandonments(req, res) {
  try {
    const { date, limit = 100, offset = 0 } = req.query;

    // Fecha a consultar: parámetro o hoy por defecto
    const targetDate = date || new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    console.log(`Consultando eventos de abandono para fecha: ${targetDate}, limit: ${limit}, offset: ${offset}`);

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
    SELECT accion as actionCode, count(*) as total
    FROM telephony_eventos
    WHERE tipo_origen = 'IVR' 
    AND accion != 'bienvenida' 
    and uniqueid in (SELECT uniqueid
        FROM telephony_eventos
        WHERE evento = 'ABANDON'
    `;

    if (req.query.date) { 
      query += `and DATE(fecha_hora) = ? `;
    } else if(req.query.week) {
      query += `and YEARWEEK(fecha_hora, 1) = YEARWEEK(CURDATE(), 1) `;
    } else if(req.query.month) {
      query += `and fecha_hora >= DATE_FORMAT(NOW(), '%Y-%m-01') AND fecha_hora < DATE_FORMAT(NOW(), '%Y-%m-01') + INTERVAL 1 MONTH `;
    }

    query += `GROUP BY uniqueid)
    group by accion
    `;

    console.log('Query de abandonments:', query);


    // Query para total de registros (paginación)
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM telephony_eventos 
      WHERE DATE(fecha_hora) = ? AND accion = 'abandonment'
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
    console.error('Error en getAbandonment:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
}

module.exports = { getAbandonments: getAbandonments };
