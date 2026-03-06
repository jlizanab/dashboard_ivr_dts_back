// Manejo de rutas no encontradas (404)
function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
}

// Manejo global de errores
function errorHandler(err, req, res, next) {
  console.error('Error no controlado:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = { notFound, errorHandler };
