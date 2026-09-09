# Requerimientos – Backend / API REST (Obligatorio 1)

> Fuente: `2026_08_DFS_Obligatorio_1.pdf`
> Materia: Desarrollo Full Stack integrado con IA – ORT
> Carrera: Analista en Tecnologías de Información / Analista Programador

## Datos de la entrega

- **Puntaje:** máximo 25 – mínimo 0.
- **Fecha máxima de entrega:** 1/10/2026 hasta las 21:00 (gestion.ort.edu.uy).
- **Formato:** archivo único ZIP o RAR de hasta 40 MB.
- **Defensa:** online, entre el 05 y el 08 de octubre inclusive. Instancia
  obligatoria; la no presentación implica la pérdida total de los puntos. Se
  espera conocimiento profundo de todo el código.
- **Producto final:** una API REST publicada.
- Los requerimientos pueden ajustarse durante el desarrollo; las aclaraciones
  del docente son parte integral de la letra.

## Objetivo

Desarrollar el backend de la aplicación con **NodeJS**.

- La API debe estar **versionada en su versión 1** (`/v1`), con un ruteo que
  permita la escalabilidad y la futura implementación de nuevas versiones.
- Manejo correcto de los **status codes** en todas las respuestas.
- Todos los endpoints deben devolver las **respuestas de error esperables**
  (por ejemplo: no puede haber dos usuarios con el mismo nombre de usuario, no
  se permiten campos vacíos).
- Aunque algunas validaciones también sean responsabilidad del frontend, se
  deben **duplicar en el backend** para prevenir inyecciones indeseadas.
- La temática queda a elección del equipo. El término genérico "documento"
  refiere a un documento almacenado en la base de datos, no a una temática
  concreta.

## Temática seleccionada: Sistema de gestión de activos financieros

El equipo desarrolla una API para que un **inversor** lleve el control de su
**portafolio de activos**. Mapeo del vocabulario genérico de la letra a este
dominio:

| Término de la letra | En este dominio |
| --- | --- |
| "documento" de colección | **Activo / Posición** del portafolio (ej.: 10 acciones de AAPL, 0,5 BTC, un inmueble) |
| "categoría" (asignable a los documentos; suele gestionarla el administrador) | **Clase de activo** (renta variable, renta fija, cripto, inmobiliario, efectivo/FX, commodities) |
| plan `plus` (4) vs `premium` (ilimitado) | Cantidad de activos permitidos en el portafolio |
| integración de IAG en un flujo | RF08 – análisis/consejo de inversión sobre el portafolio |
| recurso de terceros no visto en clase | API de cotizaciones de mercado (RF21) |

### Factibilidad y riesgos del tema

- **Encaja bien** con los dos puntos más difíciles de la letra: la IAG tiene un
  flujo natural (análisis del portafolio) y el recurso de terceros es pertinente
  al dominio (cotizaciones).
- **Riesgo 1 – Subida de imágenes.** Un activo financiero no tiene una imagen
  obvia. Justificación de dominio adoptada: la imagen es el **logo/ícono del
  activo**, un **comprobante de compra** (captura del bróker) o la **foto del
  bien** cuando el activo es físico (inmueble, oro, arte, vehículo).
- **Riesgo 2 – "Toda integración de terceros debe funcionar en todo momento,
  sin límites por uso".** Varias APIs financieras gratuitas tienen rate limits
  agresivos (p. ej. Alpha Vantage, 25 req/día). Mitigación: usar proveedores sin
  límites molestos (Frankfurter para FX —sin API key—, CoinGecko free para
  cripto) y **cachear** las cotizaciones en MongoDB con TTL.
- **Alcance:** RF06, RF07 y RF09 son *extras* valorados como innovación, no
  núcleo; dependen de mantener un histórico de valuaciones (`PriceSnapshot`).

## Requerimientos funcionales

> Convención: cada RF lista sus **criterios de aceptación (CA)** con el status
> code esperado. Cada CA se traduce 1:1 en un test de Postman.

### Núcleo — autenticación y usuarios

- **RF01** – Un usuario anónimo puede registrarse.
  - CA1: alta válida → `201` + datos del usuario (sin passwordHash).
  - CA2: campos vacíos o inválidos → `400`.
  - CA3: username o email ya existente → `409`.
  - CA4: el registro asigna siempre rol `user` y plan `plus` (no se puede
    elegir rol ni plan en el body).
- **RF02** – Un usuario anónimo puede loguearse y un usuario logueado puede
  desloguearse.
  - CA1: credenciales correctas → `200` + JWT.
  - CA2: credenciales incorrectas → `401`.
  - CA3: campos vacíos → `400`.
- **RF11** – El registro solo crea usuarios con rol `user`. Existe al menos un
  **administrador precargado** en la base de datos.
  - CA1: no hay endpoint público para crear administradores.
- **RF19** – Cambio de plan. El registro asigna `plus`; un usuario `plus` puede
  cambiar a `premium`. El administrador no gestiona planes.
  - CA1: `plus` → `premium` → `200`.
  - CA2: usuario ya `premium` intenta cambiar → `409` / `422`.
  - CA3: sin token → `401`.
- **RF23** – Todos los endpoints protegidos exigen JWT válido.
  - CA1: sin token o token inválido/expirado → `401`.
  - CA2: rol o plan insuficiente para la acción → `403`.
- **RF24** – Las validaciones del frontend se duplican en el backend (unicidad
  de username/email, campos obligatorios, tipos, rangos) para prevenir
  inyecciones.
  - CA1: cualquier payload inválido → `400` con detalle del/los campos.

### Núcleo — activos (ABM del "documento")

- **RF03** – Un usuario logueado puede ingresar un activo (nombre/símbolo,
  clase de activo, cantidad, precio de compra, moneda).
  - CA1: alta válida → `201` + activo creado.
  - CA2: campo obligatorio vacío → `400`.
  - CA3: sin token → `401`.
  - CA4: usuario `plus` que ya tiene 4 activos → `403` (límite de plan).
  - CA5: clase de activo inexistente → `422`.
- **RF12** – Un usuario logueado puede eliminar un activo de su portafolio.
  - CA1: baja de un activo propio → `200` / `204`.
  - CA2: activo inexistente → `404`.
  - CA3: activo de otro usuario → `403` / `404`.
- **RF13** – Un usuario logueado puede modificar un activo (cantidad, precio de
  compra, clase de activo, moneda, imagen).
  - CA1: modificación válida → `200` + activo actualizado.
  - CA2: datos inválidos → `400`.
  - CA3: activo de otro usuario → `403` / `404`.
- **RF04** – Un usuario logueado puede ver el **detalle de su portafolio**: cada
  activo con su cantidad y su valuación actual.
  - CA1: con token → `200` + lista de activos con valuación.
  - CA2: sin token → `401`.
- **RF05** – Un usuario logueado puede ver el **valor total** de su portafolio
  (monto agregado, desglosable por moneda).
  - CA1: con token → `200` + total.
- **RF14** – La consulta del portafolio está **paginada** (`page`, `limit`).
  - CA1: respuesta incluye metadatos de paginación (total, página, límite).
  - CA2: parámetros de paginación inválidos → `400`.
- **RF15** – La consulta del portafolio admite **filtros**: por clase de activo,
  moneda, rango de valor, fecha de incorporación y apreciación/depreciación.
  - CA1: filtro válido → `200` + solo los activos que cumplen.
  - CA2: valor de filtro inválido → `400`.

### Núcleo — clases de activo (ABM de la "categoría")

- **RF16** – El administrador puede dar de alta, baja, modificar y consultar
  **clases de activo**.
  - CA1: alta válida (rol admin) → `201`.
  - CA2: usuario `user` intenta ABM → `403`.
  - CA3: nombre de clase duplicado → `409`.
  - CA4: consulta de clases → `200` (disponible para cualquier usuario logueado).
- **RF17** – No se puede eliminar una clase de activo que tenga activos
  asociados.
  - CA1: baja de clase sin activos → `200` / `204`.
  - CA2: baja de clase con activos asociados → `409` (integridad referencial).

### Núcleo — imágenes, terceros e IAG

- **RF20** – Un usuario logueado puede subir una imagen asociada a un activo
  (logo / comprobante / foto del bien) a Cloudinary o Vercel Blob.
  - CA1: imagen válida → `200` + URL almacenada en el activo.
  - CA2: archivo con formato o tamaño no permitido → `400` / `422`.
  - CA3: sin token → `401`.
- **RF21** – Un endpoint consume una **API de mercado de terceros** para
  obtener/actualizar la cotización actual de un activo (recurso no visto en
  clase).
  - CA1: símbolo válido → `200` + cotización; se cachea con TTL.
  - CA2: símbolo inexistente en el proveedor → `404` / `422`.
  - CA3: el proveedor no responde → se sirve el último valor cacheado; si no
    hay, `503` controlado sin romper el resto de la app.
- **RF08 / RF22** – Un endpoint de **IAG** recibe el portafolio del usuario y
  devuelve un análisis/recomendación de inversión (no es un chat; la lógica de
  IAG es interna al endpoint).
  - CA1: portafolio con activos → `200` + análisis.
  - CA2: el proveedor de IA no responde → `200` con fallback controlado (o
    `503` sin afectar los demás endpoints); nunca error 5xx sin manejar.
  - CA3: sin token → `401`.

### Extras (funcionalidades innovadoras — valoradas, no núcleo)

- **RF06** – Reporte de apreciación/depreciación de los activos. Requiere
  histórico de valuaciones (`PriceSnapshot`).
- **RF07** – Proyección de valorización/desvalorización según el histórico.
- **RF09** – Descarga de un reporte en PDF con el detalle del portafolio.
- Ideas adicionales: alertas por umbral de precio, conversión multi-moneda con
  FX en vivo, indicador de diversificación (% por clase de activo).

## Modelo de datos (implícito)

- **User**: `username`, `email`, `passwordHash`, `role` (`user` | `admin`),
  `plan` (`plus` | `premium`), timestamps.
- **Asset / Position** (el "documento"): `userId`, `assetClassId`,
  `symbol`/`name`, `quantity`, `purchasePrice`, `currency`, `currentValue`,
  `imageUrl`, `createdAt`.
- **AssetClass** (la "categoría"): `name`, `description`.
- **PriceSnapshot** (opcional, para RF06/RF07): `assetId`, `value`, `date`.
- La **entidad que maneja el límite de plan** queda a elección del equipo; la
  opción más simple es el campo `plan` en `User`.

## Requerimientos de la letra (referencia)

### Rutas desprotegidas

- [ ] **Registro de usuarios.** Solo se pueden registrar usuarios con un perfil
      (usuario común). Pueden existir precargados en base de datos usuarios con
      otro tipo de perfil (por ejemplo, administradores del sistema).
- [ ] **Login de usuarios.**

### Rutas protegidas

- [ ] **Cambio de plan de usuario.** El registro asigna el plan `plus`. El
      usuario puede cambiar de `plus` a `premium`. Cambiar de plan solo requiere
      estar en `plus`. El administrador no gestiona planes.
- [ ] **ABM y consulta de documentos de colecciones:** alta, baja,
      modificación, consulta y consulta con filtros.
  - [ ] Las altas se limitan a **4 registros para usuarios `plus`** y son
        **ilimitadas para usuarios `premium`**. La entidad que maneja esta
        restricción queda a elección del equipo.
  - [ ] Las consultas deben estar **paginadas** (colecciones que podrían
        contener mucha información).
- [ ] **ABM y consulta de documentos de categorías**, que sirven para asignar a
      las entidades del punto anterior (por ejemplo, rubros de comidas en una app
      de recetas). Suele ser funcionalidad del administrador.
  - [ ] Debe cuidar restricciones de integridad: por ejemplo, no se puede
        borrar una categoría que tenga documentos asociados.
- [ ] **Subida de imágenes** al servicio de alojamiento de imágenes de Vercel o
      a Cloudinary.
- [ ] **Integración de IA generativa en un flujo.** No es un chat: un endpoint
      maneja internamente lógica de IAG. Si el servicio devuelve indisponibilidad,
      esto **no debe condicionar** el correcto funcionamiento de la aplicación.
- [ ] **Endpoint con un recurso no visto en clase**, investigado e implementado
      por el equipo. Ejemplos: conectarse con una API de terceros pertinente al
      dominio, login con redes sociales, envío de mails. Toda integración de
      terceros debe funcionar en todo momento, sin límites por uso.

### Validaciones

- [ ] Cada endpoint debe cubrir sus errores esperables (usuario duplicado,
      campos vacíos, etc.), duplicando en backend las validaciones del frontend.

## Documentación y tests de Postman

- [ ] **Una colección** que englobe todas las carpetas; es la que se exporta y
      se entrega.
- [ ] **Carpetas:** cada una agrupa los endpoints relacionados entre sí.
- [ ] **Requests:** uno por endpoint de la API.
  - [ ] Para cada request, generar los **tests** que permitan evaluar todas las
        funcionalidades y **cada uno de los status codes** de respuesta
        implementados.
  - [ ] Cada request testea la correcta devolución de datos, que el status code
        sea el esperado y todas las verificaciones necesarias.
  - [ ] Ir asignando las **variables de colección** que necesiten los endpoints
        sucesivos.
  - Flujos de ejemplo esperados:
    - Registro con datos incorrectos → registro exitoso (guardando
      credenciales para requests siguientes) → registro erróneo por usuario
      duplicado.
    - Ingreso de 5 documentos en plan `plus` → error en el documento 5 por
      límite → cambio de plan del usuario → alta del documento 5.
- [ ] **Variable de colección `prod_base_url`** que apunte a la URL base de la
      API publicada remotamente. La documentación apunta por defecto a la URL
      remota.

## Requerimientos no funcionales

- [ ] Stack: **NodeJS, Express, MongoDB, Mongoose, JWT, JOI, BcryptJS**,
      middleware para protección de rutas y todas las tecnologías y buenas
      prácticas aplicadas en el semestre.
- [ ] **Deploy en Vercel.**
- [ ] Documentación y scripts de testeo en **Postman**.
- [ ] API versionada (v1) con ruteo preparado para nuevas versiones.

## Requerimientos de calidad (se valorará)

- Correcta implementación de las buenas prácticas de **OWASP Top Ten API** para
  prevenir ataques (las vistas en clase).
- Atención a los detalles que aporten **realismo** a la aplicación.
- Concepción del entregable **como un todo**: no se espera solo código, sino
  también arquitecturas que den fácil escalabilidad y adaptabilidad al
  servidor, y tests de los endpoints planificados y ejecutados de manera
  profesional.
- Implementación de **funcionalidades innovadoras** además de las solicitadas.
- En la defensa se valora el **conocimiento profundo de todo el código**; no
  poder explicarlo en profundidad es motivo de quita de puntos.

## Estructura de la entrega

- Carpeta con el **código fuente de la API**, excluyendo `node_modules`.
- Archivo con el **enlace a la URL** de acceso a la API publicada.
- Archivo con la **documentación exportada de Postman en formato JSON**,
  incluyendo la colección organizada en carpetas con los scripts de tests
  listos para correr.
