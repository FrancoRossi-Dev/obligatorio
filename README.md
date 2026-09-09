# FinTrack API — Sistema de gestión de activos financieros

API REST para que un inversor lleve el control de su portafolio de activos:
alta de posiciones, valuación contra cotizaciones de mercado, reportes de
apreciación/depreciación y un análisis de inversión asistido por IA generativa.

- **Producto:** API REST versionada (`/v1`), publicada.
- **Materia:** Desarrollo Full Stack integrado con IA — Universidad ORT Uruguay.
- **Entrega:** Obligatorio 1 (backend). El frontend se desarrolla en el Obligatorio 2.

| | |
| --- | --- |
| API publicada | _pendiente de deploy_ |
| Colección de Postman | [`documentation/`](documentation/) _(pendiente de exportar)_ |
| Requerimientos | [`documentation/requerimientos-api.md`](documentation/requerimientos-api.md) |

---

## Estado del proyecto

En desarrollo. El repositorio contiene el esqueleto de la API (Express 5, ruteo
`/v1`, middlewares de validación y de *not found*). Ver el detalle funcional y los
criterios de aceptación en
[`documentation/requerimientos-api.md`](documentation/requerimientos-api.md).

| Área | Estado |
| --- | --- |
| Scaffold Express + ruteo `/v1` | ✅ |
| Conexión a MongoDB (Mongoose) | ⬜ |
| Registro / login / JWT | ⬜ |
| ABM de activos (con límite por plan) | ⬜ |
| ABM de clases de activo (categorías) | ⬜ |
| Subida de imágenes (Cloudinary / Vercel Blob) | ⬜ |
| Integración API de mercado (cotizaciones) | ⬜ |
| Endpoint de IA generativa (análisis de portafolio) | ⬜ |
| Colección y tests de Postman | ⬜ |
| Deploy en Vercel | ⬜ |

---

## Stack tecnológico

- **Runtime:** Node.js 20 LTS (ES Modules)
- **Framework:** Express 5
- **Base de datos:** MongoDB + Mongoose
- **Autenticación:** JWT (`jsonwebtoken`) + hashing con `bcryptjs`
- **Validación:** Joi (validación de entrada duplicada en el backend)
- **Almacenamiento de imágenes:** Cloudinary o Vercel Blob
- **IA generativa:** proveedor LLM vía API (flujo interno, no chat)
- **Datos de mercado:** API de terceros (FX / cripto / acciones) con caché
- **Deploy:** Vercel
- **Documentación y tests de endpoints:** Postman

> Las dependencias de datos, auth e integraciones todavía no están instaladas;
> se irán agregando a `package.json` a medida que se implementen.

---

## Requisitos previos

- Node.js ≥ 20
- npm ≥ 10
- Una instancia de MongoDB (local o MongoDB Atlas)

---

## Instalación y ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo de variables de entorno
cp .env.example .env
#   y completar los valores (ver tabla más abajo)

# 3. Levantar en modo desarrollo (recarga con nodemon)
npm run dev

# 3'. o en modo producción
npm start
```

La API queda disponible en `http://localhost:3000/v1`.

---

## Variables de entorno

Definidas en `.env` (no se versiona). Ver `.env.example` para la plantilla.

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `PORT` | Puerto del servidor HTTP | `3000` |
| `MONGODB_URI` | Cadena de conexión a MongoDB | `mongodb://localhost:27017/fintrack` |
| `JWT_SECRET` | Secreto para firmar los tokens | `una-clave-larga-y-aleatoria` |
| `JWT_EXPIRES_IN` | Vigencia del token | `1d` |
| `PLUS_ASSET_LIMIT` | Máx. de activos para el plan `plus` | `4` |
| `CLOUDINARY_URL` | Credenciales de Cloudinary (o config de Vercel Blob) | `cloudinary://key:secret@cloud` |
| `MARKET_API_BASE_URL` | Base URL del proveedor de cotizaciones | `https://api.frankfurter.app` |
| `MARKET_API_KEY` | API key del proveedor de cotizaciones (si aplica) | — |
| `MARKET_CACHE_TTL_SECONDS` | TTL del caché de cotizaciones | `300` |
| `AI_API_KEY` | API key del proveedor de IA generativa | — |
| `AI_MODEL` | Modelo LLM a utilizar | — |

---

## Estructura del proyecto

```
.
├── app.js                 # Configuración de Express y montaje de middlewares/rutas
├── server.js              # Punto de entrada: levanta el servidor HTTP
├── v1/                    # Versión 1 de la API
│   ├── v1.routes.js       # Router raíz de /v1; monta los routers de cada recurso
│   ├── routes/            # Un router por recurso (usuarios, activos, categorías, ...)
│   ├── controllers/       # Manejo de request/response por endpoint
│   ├── validators/        # Esquemas Joi de validación de entrada
│   └── middlewares/       # Auth, validación de body, not found, manejo de errores
├── documentation/         # Letra del obligatorio, requerimientos y colección de Postman
└── README.md
```

> Convención de capas: `route → middleware(s) → controller → service → model`.
> Los controllers no acceden directamente a la base; la lógica de negocio vive en
> `services/` (a crear) y el acceso a datos en `models/` (Mongoose).

---

## Versionado de la API

Todo el ruteo cuelga de `/v1`. Nuevas versiones se montan en paralelo
(`/v2`, ...) sin romper la anterior:

```js
// app.js
app.use("/v1", v1Routes);
// app.use("/v2", v2Routes);  // futuro
```

---

## Testing

Los endpoints se documentan y prueban con **Postman**:

- Una única colección que agrupa carpetas por recurso.
- Un request por endpoint, con tests para **cada status code** que devuelve.
- Variable de colección `prod_base_url` apuntando a la API publicada.

La colección exportada (JSON) se versiona en [`documentation/`](documentation/).

---

## Deploy

Deploy en **Vercel**. La URL pública se documenta en la tabla del inicio de este
README y en el archivo de entrega.

---

## Nota sobre robustez y alcance

Este proyecto es una **prueba de concepto / MVP** con fines académicos y de
demostración de producto. El stack (Node.js + JavaScript sin tipado estático +
MongoDB) **no es el idóneo para un sistema financiero real**.

Una versión productiva debería, como mínimo:

- Migrar la aritmética monetaria a **decimales de precisión arbitraria**
  (`decimal.js` / `big.js`); nunca `number`/floating point para dinero.
- Adoptar **tipado estático** (TypeScript en modo estricto como primer paso;
  para el núcleo de dinero y transacciones, un lenguaje fuertemente tipado y con
  garantías más fuertes — Go, Kotlin/JVM, C#).
- Separar el **sistema de registro** (transacciones, saldos, auditoría → base
  relacional **PostgreSQL** con ACID y log inmutable) de la **capa de API /
  presentación** (aceptable en Node/TS).
- Validación de esquema en la base, **observabilidad** (logs estructurados,
  métricas, trazas) y una suite de **tests automatizados** en CI.
- Encuadrar el análisis de IA como **informativo/educativo**, no como
  asesoramiento de inversión (implicancias regulatorias).

---

## Autores

- Franco Rossi
- _(integrante 2)_

Universidad ORT Uruguay — Analista en Tecnologías de la Información / Analista Programador.

## Licencia

ISC. Uso académico.
