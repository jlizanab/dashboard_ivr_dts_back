# Events API

API REST con **Node.js + Express + MySQL** para consultar eventos.

## Estructura del proyecto

```
events-api/
├── src/
│   ├── config/
│   │   └── database.js          # Pool de conexiones MySQL
│   ├── controllers/
│   │   └── eventsController.js  # Lógica de negocio
│   ├── middleware/
│   │   └── errorHandler.js      # Manejo de errores 404 / 500
│   ├── routes/
│   │   └── events.js            # Definición de rutas
│   └── index.js                 # Punto de entrada
├── .env.example
├── .gitignore
└── package.json
```

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar y configurar variables de entorno
cp .env.example .env
# → editar .env con tus credenciales MySQL

# 3. Iniciar en desarrollo
npm run dev

# 4. Iniciar en producción
npm start
```

## Variables de entorno (.env)

| Variable           | Descripción                    | Default     |
|--------------------|-------------------------------|-------------|
| `PORT`             | Puerto del servidor            | `3000`      |
| `NODE_ENV`         | Entorno (development/production)| `development`|
| `DB_HOST`          | Host de MySQL                  | `localhost` |
| `DB_PORT`          | Puerto de MySQL                | `3306`      |
| `DB_USER`          | Usuario de MySQL               | `root`      |
| `DB_PASSWORD`      | Contraseña de MySQL            | —           |
| `DB_NAME`          | Nombre de la base de datos     | —           |
| `DB_CONNECTION_LIMIT`| Máx. conexiones en el pool   | `10`        |

## Schema de tabla sugerido

```sql
CREATE TABLE events (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(255)    NOT NULL,
  descripcion TEXT,
  fecha       DATETIME        NOT NULL,   -- columna que se filtra
  ubicacion   VARCHAR(255),
  created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_fecha (fecha)
);
```

> ⚠️ Si tu columna de fecha tiene otro nombre, edita la query en `src/controllers/eventsController.js`.

## Endpoints

### GET /health
Verifica que el servidor está activo.

**Respuesta:**
```json
{ "status": "ok", "timestamp": "2026-03-04T12:00:00.000Z" }
```

---

### GET /api/events

Retorna todos los eventos cuya `fecha` coincida con el día actual.

**Query params opcionales:**

| Parámetro | Tipo   | Descripción                              | Default      |
|-----------|--------|------------------------------------------|--------------|
| `date`    | string | Fecha a consultar (`YYYY-MM-DD`)         | hoy          |
| `limit`   | number | Máximo de registros a devolver (1-500)   | `100`        |
| `offset`  | number | Registros a saltar (paginación)          | `0`          |

**Ejemplos:**
```
GET /api/events                          → eventos de hoy
GET /api/events?date=2026-03-10         → eventos del 10/03/2026
GET /api/events?limit=20&offset=40      → paginación
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "date": "2026-03-04",
  "total": 3,
  "limit": 100,
  "offset": 0,
  "data": [
    {
      "id": 1,
      "nombre": "Conferencia Tech",
      "descripcion": "Evento anual de tecnología",
      "fecha": "2026-03-04T09:00:00.000Z",
      "ubicacion": "Santiago"
    }
  ]
}
```

**Respuesta de error (400 / 500):**
```json
{
  "success": false,
  "message": "Descripción del error"
}
```
