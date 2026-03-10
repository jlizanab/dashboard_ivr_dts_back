const { pool } = require('../config/database');


//getDetails

async function getDetailsByPhone(req, res) {
  try {
    const { phone, download } = req.query;

    console.log(`Consultando detalles de eventos para telefono: ${phone}, download: ${download}`);
   

    // Query principal 
    let query = `
    select
    callerid_num, accion, descripcion, fecha_hora
    from telephony_eventos
    `;
    if (req.query.phone) { query += `where callerid_num=? `;} 
    query += `and accion NOT IN ('bienvenida', 'timeout')`;

    console.log('Query de details:', query);
    const [rows]    = await pool.execute(query, [phone]);

    if (download === 'true') {
      const csvHeaders = 'callerid_num,accion,descripcion,fecha_hora\n';
      const csvRows = rows.map(row => `${row.callerid_num},${row.accion},${row.descripcion},${row.fecha_hora}`).join('\n');
      const csvData = csvHeaders + csvRows;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="details_${phone}.csv"`);
      return res.status(200).send(csvData);
      
    } else {
      return res.status(200).json({
        success: true,
        data: rows,
      });
    }

    


  } catch (error) {
    console.error('Error en get details by phone:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
}

module.exports = { getDetailsByPhone: getDetailsByPhone };
