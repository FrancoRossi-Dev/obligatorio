# Endpoints del sistema — Consolidación de cuentas financieras

> Basado en el mapeo final de `evaluacion-propuesta-consolidacion.md` (Banco = categoría, Cuenta = documento, roles `admin`/`user`, Cliente como dato sin login en el núcleo). Todas las rutas van bajo `/v1`. Convención de status codes según la letra del Obligatorio 1.

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
| POST   | `/v1/auth/register`    | pública      | Registra un usuario. Rol siempre `user`, plan siempre `plus` (no se eligen en el body).                  | `201` alta OK + datos del usuario (sin passwordHash) · `400` campos vacíos/inválidos · `409` username o email ya existe |
| POST   | `/v1/auth/login`       | pública      | Login.                                                                                                   | `200` + JWT · `401` credenciales incorrectas · `400` campos vacíos                                                      |
| POST   | `/v1/auth/logout`      | JWT          | Cierra sesión (invalida el token del lado que corresponda, o no-op si el manejo es solo client-side).    | `200` · `401` sin token                                                                                                 |
| GET    | `/v1/usuarios/me`      | JWT          | Perfil propio: datos, rol, plan, cantidad de cuentas usadas.                                             | `200` · `401` sin token                                                                                                 |
| PATCH  | `/v1/usuarios/me/plan` | JWT (`user`) | Cambia de `plus` a `premium`.                                                                            | `200` cambio OK · `409` ya es `premium` · `401` sin token · `403` si lo intenta un `admin`                              |
| GET    | `/v1/usuarios/me/uso`  | JWT (`user`) | Cantidad/porcentaje de cuentas usadas sobre el límite del plan (soporta el informe de uso del frontend). | `200` `{ used: 3, limit: 4, plan: "plus" }` (o `limit: null` en `premium`) · `401` sin token                            |

---

## 2. Bancos — categoría (catálogo, Admin)

| Método | Endpoint         | Auth             | Qué hace                              | Respuestas esperadas                                                                                          |
| ------ | ---------------- | ---------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| POST   | `/v1/bancos`     | JWT (`admin`)    | Alta de banco (nombre, país, RUT).    | `201` alta OK · `400` campos inválidos · `403` rol `user` · `409` nombre duplicado                            |
| GET    | `/v1/bancos`     | JWT (cualquiera) | Lista paginada de bancos habilitados. | `200` + paginación · `401` sin token                                                                          |
| GET    | `/v1/bancos/:id` | JWT (cualquiera) | Detalle de un banco.                  | `200` · `404` no existe                                                                                       |
| PUT    | `/v1/bancos/:id` | JWT (`admin`)    | Modifica un banco.                    | `200` · `400` datos inválidos · `403` rol `user` · `404` no existe                                            |
| DELETE | `/v1/bancos/:id` | JWT (`admin`)    | Baja de un banco.                     | `200`/`204` sin cuentas asociadas · `409` tiene cuentas asociadas (integridad referencial) · `403` rol `user` |

---

## 3. Clientes (dato de negocio del usuario)

| Método | Endpoint                       | Auth         | Qué hace                                                                                                             | Respuestas esperadas                                                                            |
| ------ | ------------------------------ | ------------ | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| POST   | `/v1/clientes`                 | JWT (`user`) | Alta de cliente (razón social, RUT, ejecutivo responsable, estado).                                                  | `201` · `400` campos inválidos · `409` RUT duplicado para ese usuario                           |
| GET    | `/v1/clientes`                 | JWT (`user`) | Lista paginada, filtros por `estado`, `ejecutivoResponsable`, texto libre.                                           | `200` + paginación · `400` filtro inválido                                                      |
| GET    | `/v1/clientes/:id`             | JWT (`user`) | Detalle de un cliente propio.                                                                                        | `200` · `403`/`404` cliente de otro usuario · `404` no existe                                   |
| PUT    | `/v1/clientes/:id`             | JWT (`user`) | Modifica un cliente propio.                                                                                          | `200` · `400` datos inválidos · `403`/`404` de otro usuario                                     |
| DELETE | `/v1/clientes/:id`             | JWT (`user`) | Baja de un cliente propio.                                                                                           | `200`/`204` sin cuentas asociadas · `409` tiene cuentas asociadas · `403`/`404` de otro usuario |
| GET    | `/v1/clientes/:id/consolidado` | JWT (`user`) | Posición consolidada del cliente: agregado por banco, por moneda y por tipo de instrumento, sobre todas sus cuentas. | `200` + totales · `404` cliente inexistente/ajeno                                               |

---

## 4. Cuentas — documento (ABM del usuario, límite de plan, imagen)

| Método | Endpoint                      | Auth         | Qué hace                                                                                         | Respuestas esperadas                                                                                                                                           |
| ------ | ----------------------------- | ------------ | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/v1/cuentas`                 | JWT (`user`) | Alta de cuenta (referencia un `bancoId` habilitado y un `clienteId` propio).                     | `201` alta OK · `400` campos inválidos · `401` sin token · `403` usuario `plus` con 4 cuentas ya cargadas (límite de plan) · `422` banco o cliente inexistente |
| GET    | `/v1/cuentas`                 | JWT (`user`) | Lista paginada de cuentas propias. Filtros: `banco`, `cliente`, `moneda`, `estado`, `fechaAlta`. | `200` + paginación · `400` filtro/paginación inválidos                                                                                                         |
| GET    | `/v1/cuentas/:id`             | JWT (`user`) | Detalle de una cuenta propia, con sus instrumentos.                                              | `200` · `403`/`404` de otro usuario · `404` no existe                                                                                                          |
| PUT    | `/v1/cuentas/:id`             | JWT (`user`) | Modifica una cuenta propia (moneda, estado, etc.).                                               | `200` · `400` datos inválidos · `403`/`404` de otro usuario                                                                                                    |
| DELETE | `/v1/cuentas/:id`             | JWT (`user`) | Baja de una cuenta propia.                                                                       | `200`/`204` · `403`/`404` de otro usuario                                                                                                                      |
| POST   | `/v1/cuentas/:id/imagen`      | JWT (`user`) | Sube comprobante (apertura/titularidad) a Cloudinary o Vercel Blob y guarda la URL en la cuenta. | `200` + URL · `400`/`422` formato o tamaño no permitido · `401` sin token · `403`/`404` de otro usuario                                                        |
| GET    | `/v1/cuentas/:id/consolidado` | JWT (`user`) | Valuación total de esa cuenta, desglosada por tipo de instrumento.                               | `200` · `404` no existe                                                                                                                                        |

---

## 5. Instrumentos (posiciones dentro de una Cuenta)

| Método | Endpoint                                    | Auth         | Qué hace                                                                                                                  | Respuestas esperadas                                                                                                                              |
| ------ | ------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/v1/cuentas/:cuentaId/instrumentos`        | JWT (`user`) | Alta manual de un instrumento (tipo, cantidad, precio de compra, moneda).                                                 | `201` · `400` campos inválidos · `422` tipo de instrumento inexistente · `403`/`404` cuenta ajena                                                 |
| GET    | `/v1/cuentas/:cuentaId/instrumentos`        | JWT (`user`) | Lista paginada de instrumentos de la cuenta. Filtros: `tipo`, `moneda`, rango de valor, apreciación/depreciación.         | `200` + paginación · `400` filtro inválido                                                                                                        |
| GET    | `/v1/instrumentos/:id`                      | JWT (`user`) | Detalle de un instrumento propio (vía su cuenta).                                                                         | `200` · `403`/`404` ajeno                                                                                                                         |
| PUT    | `/v1/instrumentos/:id`                      | JWT (`user`) | Modifica cantidad, precio, moneda, etc.                                                                                   | `200` · `400` datos inválidos · `403`/`404` ajeno                                                                                                 |
| DELETE | `/v1/instrumentos/:id`                      | JWT (`user`) | Elimina un instrumento.                                                                                                   | `200`/`204` · `403`/`404` ajeno                                                                                                                   |
| POST   | `/v1/cuentas/:cuentaId/instrumentos/import` | JWT (`user`) | Carga masiva desde Excel: valida columnas/tipos/duplicados, informa errores fila por fila, importa los registros válidos. | `201` + resumen `{ importados, rechazados: [...] }` · `400` archivo con formato inesperado o sin columnas obligatorias · `403`/`404` cuenta ajena |

---

## 6. Terceros — cotización / FX

| Método | Endpoint                    | Auth         | Qué hace                                                                                                  | Respuestas esperadas                                                                                                                            |
| ------ | --------------------------- | ------------ | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/v1/fx?base=USD&quote=UYU` | JWT (`user`) | Tipo de cambio entre dos monedas, para consolidar cuentas en distinta moneda. Se cachea con TTL en Mongo. | `200` + valor y fecha · `422` moneda no soportada · `503` proveedor caído y sin valor cacheado previo (controlado, no rompe el resto de la app) |

---

## 7. IAG — análisis de cartera

| Método | Endpoint                    | Auth         | Qué hace                                                                                                                                                                           | Respuestas esperadas                                                                                                                             |
| ------ | --------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| POST   | `/v1/clientes/:id/analisis` | JWT (`user`) | Envía la posición consolidada del cliente al modelo y devuelve un análisis (concentración, diversificación por moneda/tipo, riesgo). No es un chat: la lógica vive en el endpoint. | `200` + análisis · `200` con fallback controlado (o `503`) si el proveedor de IA no responde · `401` sin token · `404` cliente inexistente/ajeno |

---

## 8. Nota para la colección de Postman

Carpetas sugeridas, una por bloque de esta tabla (Auth, Bancos, Clientes, Cuentas, Instrumentos, Terceros, IAG), con una request por endpoint y sus tests de status code correspondientes. Variables de colección a ir seteando: `token` (tras login), `bancoId`, `clienteId`, `cuentaId`, `instrumentoId`, además de `prod_base_url` apuntando a la API publicada. Flujo de ejemplo a scriptear: registro → login → alta de 4 cuentas en plan `plus` → 5ª cuenta rechazada por límite (`403`) → cambio de plan → alta de la 5ª cuenta.
