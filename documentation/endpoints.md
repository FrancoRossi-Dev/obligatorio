# Endpoints del sistema — Consolidación de cuentas financieras

> Basado en el mapeo final de `evaluacion-propuesta-consolidacion.md` (Banco = categoría, Cuenta = documento, roles `admin`/`advisor`, Cliente como dato sin login en el núcleo). Todas las rutas van bajo `/v1`. Convención de status codes según la letra del Obligatorio 1.
>
> Nombres de campo alineados con `v1/models/*.model.js` (ver
> `requerimientos-api.md` § Modelo de datos): `advisor` es el rol del "usuario
> común" (la letra usa literalmente `user`; se renombró en el código), y el
> plan se llama `base` en el modelo aunque la letra dice literalmente `plus`
> (ver nota en `requerimientos-api.md`).

## 0. Convenciones generales

Todas las rutas protegidas requieren `Authorization: Bearer <JWT>`. Sin token o token inválido/expirado → **401**. Rol o plan insuficiente para la acción → **403**. Body inválido (campos vacíos, tipos incorrectos) → **400**. Referencia a otro recurso que no existe pero el dato en sí es válido (ej. un `bancoId` inexistente) → **422**. Conflicto de unicidad o de integridad referencial → **409**. Recurso no encontrado o no perteneciente al usuario → **404**. Falla de un proveedor externo sin romper el resto de la app → **503** controlado.

Listados paginados aceptan `?page=&limit=` y devuelven metadatos de paginación (`total`, `page`, `limit`, `pages`) junto a los datos. Parámetros de paginación inválidos → **400**.

Formato de error estándar sugerido:

```json
{
  "error": {
    "code": "PLAN_LIMIT_EXCEEDED",
    "message": "Alcanzaste el máximo de cuentas de tu plan."
  }
}
```

---

## 1. Autenticación y usuario

| Método | Endpoint               | Auth         | Qué hace                                                                                                 | Respuestas esperadas                                                                                                    |
| ------ | ---------------------- | ------------ | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| POST   | `/v1/auth/register`    | pública      | Registra un usuario. Rol siempre `advisor`, plan siempre `base` (no se eligen en el body).                  | `201` alta OK + datos del usuario (sin password) · `400` campos vacíos/inválidos · `409` username ya existe |
| POST   | `/v1/auth/login`       | pública      | Login.                                                                                                   | `200` + JWT · `401` credenciales incorrectas · `400` campos vacíos                                                      |
| POST   | `/v1/auth/logout`      | JWT          | Cierra sesión (invalida el token del lado que corresponda, o no-op si el manejo es solo client-side).    | `200` · `401` sin token                                                                                                 |
| GET    | `/v1/usuarios/me`      | JWT          | Perfil propio: datos, rol, plan, cantidad de cuentas usadas.                                             | `200` · `401` sin token                                                                                                 |
| PATCH  | `/v1/usuarios/me/plan` | JWT (`advisor`) | Cambia de `base` a `premium`.                                                                            | `200` cambio OK · `409` ya es `premium` · `401` sin token · `403` si lo intenta un `admin`                              |
| GET    | `/v1/usuarios/me/uso`  | JWT (`advisor`) | Cantidad/porcentaje de cuentas usadas sobre el límite del plan (soporta el informe de uso del frontend). | `200` `{ used: 3, limit: 4, planTier: "base" }` (o `limit: null` en `premium`) · `401` sin token                            |

---

## 2. Bancos — categoría (catálogo, Admin)

| Método | Endpoint         | Auth             | Qué hace                              | Respuestas esperadas                                                                                          |
| ------ | ---------------- | ---------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| POST   | `/v1/bancos`     | JWT (`admin`)    | Alta de banco (`name`, `region`, `country`, `logoURL`). | `201` alta OK · `400` campos inválidos · `403` rol `advisor` · `409` `name` duplicado             |
| GET    | `/v1/bancos`     | JWT (cualquiera) | Lista paginada de bancos habilitados. | `200` + paginación · `401` sin token                                                                          |
| GET    | `/v1/bancos/:id` | JWT (cualquiera) | Detalle de un banco.                  | `200` · `404` no existe                                                                                       |
| PUT    | `/v1/bancos/:id` | JWT (`admin`)    | Modifica un banco.                    | `200` · `400` datos inválidos · `403` rol `advisor` · `404` no existe                                            |
| DELETE | `/v1/bancos/:id` | JWT (`admin`)    | Baja de un banco.                     | `200`/`204` sin cuentas asociadas · `409` tiene cuentas asociadas (integridad referencial) · `403` rol `advisor` |

### 2b. Emisores — catálogo de `Issuer` (pendiente de RF propio)

`Instrument` exige `issuerId` cuando `type` es `stock` o `bond`, pero no hay
todavía ningún RF ni endpoint para dar de alta un `Issuer`. Falta decidir el
ABM (por paralelismo con Banco, lo más simple es que sea catálogo de
`admin`, dado que `issuerDetails.legalName` es único) antes de poder probar
el alta de instrumentos de tipo acción/bono en Postman.

---

## 3. Clientes (dato de negocio del usuario)

| Método | Endpoint                       | Auth         | Qué hace                                                                                                             | Respuestas esperadas                                                                            |
| ------ | ------------------------------ | ------------ | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| POST   | `/v1/clientes`                 | JWT (`advisor`) | Alta de cliente (`companyDetails.{commercialName, legalName, address, country}`).                                | `201` · `400` campos inválidos                                                                  |
| GET    | `/v1/clientes`                 | JWT (`advisor`) | Lista paginada, filtro por texto libre (nombre).                                                                 | `200` + paginación · `400` filtro inválido                                                      |
| GET    | `/v1/clientes/:id`             | JWT (`advisor`) | Detalle de un cliente propio.                                                                                        | `200` · `403`/`404` cliente de otro usuario · `404` no existe                                   |
| PUT    | `/v1/clientes/:id`             | JWT (`advisor`) | Modifica un cliente propio.                                                                                          | `200` · `400` datos inválidos · `403`/`404` de otro usuario                                     |
| DELETE | `/v1/clientes/:id`             | JWT (`advisor`) | Baja lógica (`isDeleted`) de un cliente propio.                                                                      | `200`/`204` sin cuentas asociadas · `409` tiene cuentas asociadas · `403`/`404` de otro usuario |
| GET    | `/v1/clientes/:id/consolidado` | JWT (`advisor`) | Posición consolidada del cliente: agregado por banco, por moneda y por tipo de instrumento, sobre todas sus cuentas. | `200` + totales · `404` cliente inexistente/ajeno                                               |

> _Pendiente:_ `Company` no tiene todavía `rut`, `ejecutivoResponsable` ni
> `estado` (ver `requerimientos-api.md` § Modelo de datos), así que el `409`
> por RUT duplicado (RF25-CA3) y el filtro por estado (RF28) no se pueden
> implementar tal cual hasta que se agreguen esos campos al modelo.

---

## 4. Cuentas — documento (ABM del usuario, límite de plan, imagen)

| Método | Endpoint                      | Auth         | Qué hace                                                                                         | Respuestas esperadas                                                                                                                                           |
| ------ | ----------------------------- | ------------ | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/v1/cuentas`                 | JWT (`advisor`) | Alta de cuenta (`bankId`, `companyId`, `number`, `accountName`, `currency`).                     | `201` alta OK · `400` campos inválidos · `401` sin token · `403` usuario `base` con 4 cuentas ya cargadas (límite de plan) · `422` banco o cliente inexistente · `409` `{bankId, number}` duplicado |
| GET    | `/v1/cuentas`                 | JWT (`advisor`) | Lista paginada de cuentas propias. Filtros: `bankId`, `companyId`, `currency`. | `200` + paginación · `400` filtro/paginación inválidos                                                                                                         |
| GET    | `/v1/cuentas/:id`             | JWT (`advisor`) | Detalle de una cuenta propia, con sus instrumentos.                                              | `200` · `403`/`404` de otro usuario · `404` no existe                                                                                                          |
| PUT    | `/v1/cuentas/:id`             | JWT (`advisor`) | Modifica una cuenta propia (`accountName`, `currency`, etc.).                                               | `200` · `400` datos inválidos · `403`/`404` de otro usuario                                                                                                    |
| DELETE | `/v1/cuentas/:id`             | JWT (`advisor`) | Baja lógica (`isDeleted`) de una cuenta propia.                                                                       | `200`/`204` · `403`/`404` de otro usuario                                                                                                                      |
| POST   | `/v1/cuentas/:id/imagen`      | JWT (`advisor`) | Sube comprobante (apertura/titularidad) a Cloudinary o Vercel Blob y guarda la URL en la cuenta. | `200` + URL · `400`/`422` formato o tamaño no permitido · `401` sin token · `403`/`404` de otro usuario                                                        |
| GET    | `/v1/cuentas/:id/consolidado` | JWT (`advisor`) | Valuación total de esa cuenta, desglosada por tipo de instrumento.                               | `200` · `404` no existe                                                                                                                                        |

> _Pendiente:_ `BankAccount` no tiene todavía un campo `estado` ni
> `comprobanteUrl` (ver `requerimientos-api.md` § Modelo de datos); el filtro
> por estado (RF15) y la subida de imagen (RF20/`POST /v1/cuentas/:id/imagen`)
> requieren agregarlos al modelo primero.

---

## 5. Instrumentos (posiciones dentro de una Cuenta)

| Método | Endpoint                                    | Auth         | Qué hace                                                                                                                  | Respuestas esperadas                                                                                                                              |
| ------ | ------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/v1/cuentas/:cuentaId/instrumentos`        | JWT (`advisor`) | Alta manual de un instrumento (`type`, `name`, `quantity`, `purchasePrice`, `currency`; `issuerId` si `type` es `stock`/`bond`; `fundDetail.composition` si `type` es `fund`). | `201` · `400` campos inválidos · `422` `type` inexistente (fuera de `stock`\|`bond`\|`fund`\|`cash`) o `issuerId`/`bankId` inexistente · `403`/`404` cuenta ajena |
| GET    | `/v1/cuentas/:cuentaId/instrumentos`        | JWT (`advisor`) | Lista paginada de instrumentos de la cuenta. Filtros: `type`, `currency`, rango de valor, apreciación/depreciación.         | `200` + paginación · `400` filtro inválido                                                                                                        |
| GET    | `/v1/instrumentos/:id`                      | JWT (`advisor`) | Detalle de un instrumento propio (vía su cuenta).                                                                         | `200` · `403`/`404` ajeno                                                                                                                         |
| PUT    | `/v1/instrumentos/:id`                      | JWT (`advisor`) | Modifica `quantity`, `purchasePrice`, `currency`, etc.                                                                                   | `200` · `400` datos inválidos · `403`/`404` ajeno                                                                                                 |
| DELETE | `/v1/instrumentos/:id`                      | JWT (`advisor`) | Baja lógica (`isDeleted`) de un instrumento.                                                                                   | `200`/`204` · `403`/`404` ajeno                                                                                                                   |
| POST   | `/v1/cuentas/:cuentaId/instrumentos/import` | JWT (`advisor`) | Carga masiva desde Excel: valida columnas/tipos/duplicados, informa errores fila por fila, importa los registros válidos. | `201` + resumen `{ importados, rechazados: [...] }` · `400` archivo con formato inesperado o sin columnas obligatorias · `403`/`404` cuenta ajena |

> _Pendiente:_ `Instrument` no tiene todavía un campo de valuación actual
> (ver `requerimientos-api.md` § Modelo de datos); el filtro por
> apreciación/depreciación y rango de valor (RF15b) necesita ese campo (o
> calcularlo on-the-fly contra una cotización de terceros).

---

## 6. Terceros — cotización / FX

| Método | Endpoint                    | Auth         | Qué hace                                                                                                  | Respuestas esperadas                                                                                                                            |
| ------ | --------------------------- | ------------ | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/v1/fx?base=USD&quote=UYU` | JWT (`advisor`) | Tipo de cambio entre dos monedas, para consolidar cuentas en distinta moneda. Se cachea con TTL en Mongo. | `200` + valor y fecha · `422` moneda no soportada · `503` proveedor caído y sin valor cacheado previo (controlado, no rompe el resto de la app) |

---

## 7. IAG — análisis de cartera

| Método | Endpoint                    | Auth         | Qué hace                                                                                                                                                                           | Respuestas esperadas                                                                                                                             |
| ------ | --------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| POST   | `/v1/clientes/:id/analisis` | JWT (`advisor`) | Envía la posición consolidada del cliente al modelo y devuelve un análisis (concentración, diversificación por moneda/tipo, riesgo). No es un chat: la lógica vive en el endpoint. | `200` + análisis · `200` con fallback controlado (o `503`) si el proveedor de IA no responde · `401` sin token · `404` cliente inexistente/ajeno |

---

## 8. Nota para la colección de Postman

Carpetas sugeridas, una por bloque de esta tabla (Auth, Bancos, Emisores, Clientes, Cuentas, Instrumentos, Terceros, IAG), con una request por endpoint y sus tests de status code correspondientes. Variables de colección a ir seteando: `token` (tras login), `bankId`, `issuerId`, `companyId`, `bankAccountId`, `instrumentId`, además de `prod_base_url` apuntando a la API publicada. Flujo de ejemplo a scriptear: registro → login → alta de 4 cuentas en plan `base` → 5ª cuenta rechazada por límite (`403`) → cambio de plan → alta de la 5ª cuenta.
