# Requerimientos – Backend / API REST (Obligatorio 1)

> Fuente: `2026_08_DFS_Obligatorio_1.pdf`
> Materia: Desarrollo Full Stack integrado con IA – ORT
> Carrera: Analista en Tecnologías de Información / Analista Programador
>
> **Tema actualizado el 14/09/2026.** Este documento reemplaza la versión anterior
> (inversor individual con su portafolio). El detalle de por qué se cambió de tema,
> las tres iteraciones de diseño consideradas y las razones de cada decisión están
> en `claude/evaluacion-propuesta-consolidacion.md`. El detalle endpoint por
> endpoint con sus respuestas está en `claude/endpoints-api.md`.

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

## Temática seleccionada: Consolidación de cuentas financieras

El equipo desarrolla una API para que una **empresa gestora / asesor de
inversiones** centralice y consolide, para cada uno de sus **clientes**, las
posiciones que ese cliente tiene distribuidas en distintos **bancos** —
cargadas mediante alta manual o mediante importación de Excel. Mapeo del
vocabulario genérico de la letra a este dominio:

| Término de la letra                                                          | En este dominio                                                                                        |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| "documento" de colección                                                     | **Cuenta** (una cuenta que el usuario abre en un banco para un cliente; agrupa sus instrumentos)       |
| "categoría" (asignable a los documentos; suele gestionarla el administrador) | **Banco** (institución financiera; catálogo global dado de alta por el `admin`)                        |
| plan `plus` (4) vs `premium` (ilimitado)                                     | Cantidad de **Cuentas** que puede tener el usuario (≈ cantidad de bancos con los que trabaja)          |
| integración de IAG en un flujo                                               | RF08/RF22 – análisis de la posición consolidada de un cliente (concentración, diversificación, riesgo) |
| recurso de terceros no visto en clase                                        | API de tipo de cambio (FX) para consolidar cuentas en distintas monedas (RF21)                         |

Dentro de cada Cuenta viven los **Instrumentos** (las posiciones concretas:
acciones, bonos, fondos, efectivo), que es donde se apoya la consolidación,
la cotización de terceros y el análisis de IA. `Cliente` es una entidad de
negocio del usuario, sin login propio en el núcleo del Obligatorio 1.

### Factibilidad y riesgos del tema

- **Encaja bien** con los dos puntos más difíciles de la letra: la IAG tiene un
  flujo natural (analizar la cartera consolidada de un cliente) y el recurso de
  terceros es pertinente al dominio — de hecho la propia consolidación
  multi-moneda _necesita_ un tipo de cambio para sumar posiciones en distintas
  monedas a un valor común.
- **Riesgo 1 – Subida de imágenes.** Resuelto: la imagen se asocia a la
  **Cuenta**, como comprobante de apertura/titularidad (captura del banco o del
  documento de alta). Es más natural que forzar una imagen sobre un instrumento
  financiero.
- **Riesgo 2 – "Toda integración de terceros debe funcionar en todo momento,
  sin límites por uso".** Se elige **Frankfurter** (tipo de cambio del Banco
  Central Europeo, sin API key ni rate limit agresivo) como recurso de
  terceros obligatorio, y se **cachea** en MongoDB con TTL. Una cotización de
  mercado de acciones queda como extra opcional si sobra tiempo, no como
  núcleo, porque las APIs gratuitas de precios de acciones sí tienen límites
  molestos (p. ej. Alpha Vantage, 25 req/día).
- **Riesgo 3 – El plazo real es de 17 días, no un mes**, contados desde que se
  definió este tema (14/09) hasta la entrega del 1/10. El alcance de este
  documento ya está recortado a un núcleo viable para ese plazo; el resto
  (histórico de valuaciones, cotización de mercado, reporte en PDF, derivados
  Call/Put como tipo de instrumento, rol de Cliente con login propio) queda
  como extra explícito, ver sección de Extras más abajo. **Fondos sí queda
  dentro del núcleo de este sprint** (decisión del 14/09): el tipo de
  instrumento `fondo` se implementa junto con `accion`, `bono` y `efectivo`,
  no como extra.
- **Alcance:** RF06, RF07 y RF09 son _extras_ valorados como innovación, no
  núcleo; dependen de mantener un histórico de valuaciones (`PriceSnapshot`)
  por instrumento.

## Requerimientos funcionales

> Convención: cada RF lista sus **criterios de aceptación (CA)** con el status
> code esperado. Cada CA se traduce 1:1 en un test de Postman. El detalle
> completo de cada endpoint (método, ruta, body, todas las respuestas) está en
> `claude/endpoints-api.md`.

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
  **administrador precargado** en la base de datos, dueño del catálogo de
  Bancos.
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

### Núcleo — clientes (entidad de negocio del usuario)

- **RF25** – Un usuario logueado puede dar de alta un cliente (razón social,
  RUT, documento/identificador, ejecutivo responsable, estado).
  - CA1: alta válida → `201` + cliente creado.
  - CA2: campo obligatorio vacío → `400`.
  - CA3: RUT ya registrado por ese usuario → `409`.
  - CA4: sin token → `401`.
- **RF26** – Un usuario logueado puede modificar y consultar el detalle de un
  cliente propio.
  - CA1: modificación válida → `200`.
  - CA2: consulta de un cliente propio → `200`.
  - CA3: cliente de otro usuario → `403` / `404`.
- **RF27** – Un usuario logueado puede eliminar un cliente propio.
  - CA1: baja de un cliente sin cuentas asociadas → `200` / `204`.
  - CA2: cliente de otro usuario → `403` / `404`.
- **RF28** – La consulta de clientes está **paginada** y admite **filtros**
  (estado, ejecutivo responsable, texto libre).
  - CA1: respuesta incluye metadatos de paginación.
  - CA2: parámetros inválidos → `400`.
- **RF18** – No se puede eliminar un cliente que tenga cuentas asociadas.
  - CA1: baja de cliente con cuentas asociadas → `409` (integridad
    referencial).

### Núcleo — cuentas (ABM del "documento", con límite de plan)

- **RF03** – Un usuario logueado puede ingresar una cuenta (banco, cliente,
  moneda, estado).
  - CA1: alta válida → `201` + cuenta creada.
  - CA2: campo obligatorio vacío → `400`.
  - CA3: sin token → `401`.
  - CA4: usuario `plus` que ya tiene 4 cuentas → `403` (límite de plan).
  - CA5: banco o cliente inexistente → `422`.
- **RF12** – Un usuario logueado puede eliminar una cuenta propia.
  - CA1: baja de una cuenta propia → `200` / `204`.
  - CA2: cuenta inexistente → `404`.
  - CA3: cuenta de otro usuario → `403` / `404`.
- **RF13** – Un usuario logueado puede modificar una cuenta (moneda, estado,
  banco, imagen).
  - CA1: modificación válida → `200` + cuenta actualizada.
  - CA2: datos inválidos → `400`.
  - CA3: cuenta de otro usuario → `403` / `404`.
- **RF04** – Un usuario logueado puede ver el **detalle de una cuenta**: sus
  instrumentos con su cantidad y su valuación actual.
  - CA1: con token → `200` + lista de instrumentos con valuación.
  - CA2: sin token → `401`.
- **RF05** – Un usuario logueado puede ver el **valor total** de una cuenta o
  de un cliente (monto agregado, desglosable por moneda).
  - CA1: con token → `200` + total.
- **RF14** – La consulta de cuentas está **paginada** (`page`, `limit`).
  - CA1: respuesta incluye metadatos de paginación (total, página, límite).
  - CA2: parámetros de paginación inválidos → `400`.
- **RF15** – La consulta de cuentas admite **filtros**: por banco, cliente,
  moneda, estado y fecha de alta.
  - CA1: filtro válido → `200` + solo las cuentas que cumplen.
  - CA2: valor de filtro inválido → `400`.

### Núcleo — bancos (ABM de la "categoría")

- **RF16** – El administrador puede dar de alta, baja, modificar y consultar
  **bancos**.
  - CA1: alta válida (rol admin) → `201`.
  - CA2: usuario `user` intenta ABM → `403`.
  - CA3: nombre de banco duplicado → `409`.
  - CA4: consulta de bancos → `200` (disponible para cualquier usuario
    logueado).
- **RF17** – No se puede eliminar un banco que tenga cuentas asociadas.
  - CA1: baja de banco sin cuentas → `200` / `204`.
  - CA2: baja de banco con cuentas asociadas → `409` (integridad referencial).

### Núcleo — instrumentos (dentro de una cuenta)

- **RF29** – Un usuario logueado puede dar de alta, modificar, eliminar y
  consultar instrumentos dentro de una cuenta propia (tipo, símbolo/nombre,
  cantidad, precio de compra, moneda).
  - CA1: alta válida → `201`.
  - CA2: campo obligatorio vacío → `400`.
  - CA3: tipo de instrumento inexistente (fuera de `accion`, `bono`, `fondo`,
    `efectivo`) → `422`.
  - CA4: cuenta de otro usuario → `403` / `404`.
- **RF15b** – La consulta de instrumentos de una cuenta está paginada y admite
  filtros (tipo, moneda, rango de valor, apreciación/depreciación).
  - CA1: filtro válido → `200`.
  - CA2: filtro inválido → `400`.
- **RF10** – Un usuario logueado puede **importar instrumentos desde un Excel**
  hacia una cuenta (carga masiva, alternativa al alta manual de RF29).
  - CA1: archivo válido con columnas obligatorias → `201` + resumen
    (importados / rechazados con motivo).
  - CA2: archivo con formato inesperado o sin columnas obligatorias → `400`.
  - CA3: registros duplicados dentro del archivo → se informan como
    rechazados, no rompen la importación del resto.

### Núcleo — imágenes, terceros e IAG

- **RF20** – Un usuario logueado puede subir una imagen asociada a una cuenta
  (comprobante de apertura/titularidad) a Cloudinary o Vercel Blob.
  - CA1: imagen válida → `200` + URL almacenada en la cuenta.
  - CA2: archivo con formato o tamaño no permitido → `400` / `422`.
  - CA3: sin token → `401`.
- **RF21** – Un endpoint consume una **API de tipo de cambio (FX)** de
  terceros para consolidar cuentas en distintas monedas (recurso no visto en
  clase).
  - CA1: par de monedas válido → `200` + cotización; se cachea con TTL.
  - CA2: moneda no soportada → `422`.
  - CA3: el proveedor no responde → se sirve el último valor cacheado; si no
    hay, `503` controlado sin romper el resto de la app.
- **RF08 / RF22** – Un endpoint de **IAG** recibe la posición consolidada de un
  cliente y devuelve un análisis (concentración, diversificación por moneda o
  tipo de instrumento, riesgo) — no es un chat; la lógica de IAG es interna al
  endpoint.
  - CA1: cliente con cuentas e instrumentos → `200` + análisis.
  - CA2: el proveedor de IA no responde → `200` con fallback controlado (o
    `503` sin afectar los demás endpoints); nunca error 5xx sin manejar.
  - CA3: sin token → `401`.

### Núcleo — consolidación

- **RF34** – Un usuario logueado puede ver la **posición consolidada de un
  cliente**: agregado de todas sus cuentas, desglosado por banco, por moneda
  y por tipo de instrumento.
  - CA1: con token → `200` + agregados.
  - CA2: cliente sin cuentas → `200` con totales en cero (no error).
  - CA3: cliente de otro usuario → `403` / `404`.
- **RF35** – Un usuario logueado puede ver la **valuación total de una
  cuenta** desglosada por tipo de instrumento.
  - CA1: con token → `200` + agregados.

### Extras (funcionalidades innovadoras — valoradas, no núcleo)

- **RF06** – Reporte de apreciación/depreciación de los instrumentos. Requiere
  histórico de valuaciones (`PriceSnapshot`).
- **RF07** – Evolución histórica del patrimonio consolidado según ese
  histórico (equivalente al RF39 del análisis original).
- **RF09** – Descarga de un reporte en PDF con el detalle de la posición
  consolidada de un cliente.
- Ideas adicionales: cotización de mercado de acciones (además del FX);
  corrección manual de registros de Excel que quedaron con error; rol de
  Cliente con login propio y su propio dashboard de solo lectura; derivados
  (Call/Put) como tipo de instrumento adicional a Acción/Bono/Fondo/Efectivo.

## Modelo de datos (implícito)

- **User**: `username`, `email`, `passwordHash`, `role` (`user` | `admin`),
  `plan` (`plus` | `premium`), timestamps.
- **Cliente**: `userId`, `razonSocial`, `rut`, `ejecutivoResponsable`,
  `estado` (`activo` | `inactivo`), timestamps.
- **Banco** (la "categoría"): `nombre`, `pais`, `rut`, timestamps.
- **Cuenta** (el "documento"): `userId`, `clienteId`, `bancoId`, `moneda`,
  `estado`, `comprobanteUrl` (imagen), `fechaAlta`, timestamps.
- **Instrumento**: `cuentaId`, `tipo` (`accion` | `bono` | `fondo` |
  `efectivo`, discriminador), `simbolo`/`nombre`, `cantidad`,
  `precioCompra`, `moneda`, `valorActual`, `detalle` (sub-documento según
  `tipo` — para `fondo`, incluye la composición: `deAcciones` | `deBonos` |
  `balanceado` | `alternativo`), timestamps.
- **PriceSnapshot** (opcional, para RF06/RF07): `instrumentoId`, `valor`,
  `fecha`.
- La **entidad que maneja el límite de plan** es **Cuenta**: se cuenta la
  cantidad de cuentas del usuario logueado (`plus` → máx. 4, `premium` → sin
  límite).

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
      se entrega. _(Ya generada — ver `postman_collection.json` entregado en el
      chat, y `claude/endpoints-api.md` con el detalle de cada request.)_
- [ ] **Carpetas:** cada una agrupa los endpoints relacionados entre sí.
- [ ] **Requests:** uno por endpoint de la API.
  - [ ] Para cada request, generar los **tests** que permitan evaluar todas las
        funcionalidades y **cada uno de los status codes** de respuesta
        implementados.
  - [ ] Cada request testea la correcta devolución de datos, que el status code
        sea el esperado y todas las verificaciones necesarias.
  - [ ] Ir asignando las **variables de colección** que necesiten los endpoints
        sucesivos.
  - Flujos de ejemplo esperados (adaptados a este dominio: "documento" =
    Cuenta):
    - Registro con datos incorrectos → registro exitoso (guardando
      credenciales para requests siguientes) → registro erróneo por usuario
      duplicado.
    - Ingreso de 4 cuentas en plan `plus` → error en la 5ª cuenta por
      límite → cambio de plan del usuario → alta de la 5ª cuenta.
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
