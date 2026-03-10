const { pool } = require('../config/database');


//getDetails

async function getDetails(req, res) {
  try {
    const { date, limit = 100, offset = 0 } = req.query;

    // Fecha a consultar: parámetro o hoy por defecto
    const targetDate = date || new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    console.log(`Consultando detalles de eventos de abandono para fecha: ${targetDate}, limit: ${limit}, offset: ${offset}`);

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
    select
    callerid_num, accion, descripcion, fecha_hora
    from telephony_eventos
    `;

    if (req.query.date) { 
      query += `where DATE(fecha_hora) = ? `;
    } else if(req.query.week) {
      query += `where YEARWEEK(fecha_hora, 1) = YEARWEEK(CURDATE(), 1) `;
    } else if(req.query.month) {
      query += `where fecha_hora >= DATE_FORMAT(NOW(), '%Y-%m-01') AND fecha_hora < DATE_FORMAT(NOW(), '%Y-%m-01') + INTERVAL 1 MONTH `;
    }

    query += `and accion NOT IN ('bienvenida', 'timeout')`;

    console.log('Query de details:', query);
    const [rows]    = await pool.execute(query, [targetDate]);

    // return res.status(200).json({
    //   success: true,
    //   date: targetDate,
    //   data: rows,
    // });

    // CSV download logic
    const csv = [
      ['Fecha Hora', 'Caller ID', 'Acción', 'Descripción'],
      ...rows.map(row => [row.fecha_hora, row.callerid_num, row.accion, row.descripcion])
    ].map(r => r.map(v => `"${v}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="details_${targetDate}.csv"`);
    res.send(csv);



  } catch (error) {
    console.error('Error en getDetails:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
}

module.exports = { getDetails: getDetails };
