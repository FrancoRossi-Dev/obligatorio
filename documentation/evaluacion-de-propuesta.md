# Evaluación de la propuesta de consolidación de cuentas financieras

> Evaluación solicitada por Franco sobre la nueva propuesta (introducción + diagrama de dominio) frente a la letra de los Obligatorios 1 y 2, y frente al `Documento de análisis.pdf` (RF01–RF39) ya cargado en el proyecto.
> Fecha de análisis: 14/09/2026.

## 0. Contexto que cambia el análisis

Antes de entrar en el detalle hay dos cosas que conviene tener claras porque condicionan todo lo demás:

**El plazo real no es "un mes".** El Obligatorio 1 (backend) vence el 1/10/2026 a las 21:00 — quedan **17 días**, no un mes. El Obligatorio 2 (frontend) vence el 12/11/2026, con defensa entre el 16 y 19/11. El diagrama analizado es el modelo de dominio de _toda_ la aplicación, pero la urgencia inmediata es el backend en 17 días. Esto obliga a recortar alcance de forma mucho más agresiva de lo que el diagrama sugiere.

**Esta propuesta reemplaza, no complementa, el tema ya validado.** El documento `requerimientos-api.md` de este mismo proyecto ya había mapeado la letra del Obligatorio 1 a un tema distinto y más simple: un inversor individual que administra su propio portafolio (`documento` = Activo/Posición, `categoría` = Clase de activo, límite de plan sobre activos del propio usuario). Ese mapeo está hecho con mucho cuidado, RF por RF y CA por CA. La propuesta nueva (empresa gestora que consolida cuentas de múltiples clientes en múltiples bancos, carga por Excel) es un dominio bastante más grande — multi-tenant, con más entidades y más roles. No es necesariamente peor, pero es objetivamente más trabajo, y hay que decidir conscientemente si vale la pena el salto de complejidad a 17 días del primer entregable.

Dicho esto, el tema nuevo tiene ventajas reales (ver 1.1), así que el resto del documento asume que se sigue adelante con él, pero con el alcance recortado que se detalla en 1.4.

---

## 1. Paso 1 — Propuesta vs. letra del obligatorio

### 1.1 Qué encaja bien

El nuevo tema resuelve mejor que el anterior los dos puntos que la letra señala como los más difíciles:

El endpoint de IA generativa (RF08/RF22) tiene un flujo natural y no forzado: analizar la posición consolidada de un cliente (concentración, diversificación por moneda o tipo de activo, comentario de riesgo) es exactamente el tipo de tarea para la que un LLM aporta valor real, y es fácil de explicar en la defensa.

El recurso de terceros (RF21) también encaja mejor que en el tema anterior. La consolidación multi-moneda que describe la introducción _necesita_ un tipo de cambio para sumar posiciones en distintas monedas a un valor común — eso es exactamente lo que ofrece una API de FX gratuita y sin rate limits agresivos (Frankfurter, del Banco Central Europeo, sin API key). A diferencia de cotizaciones de acciones o bonos, el riesgo de "la API no viene siempre en el precio esperado" es bajo. Se recomienda que el recurso de terceros obligatorio sea el de FX, y dejar cotizaciones de mercado (precio de una acción) como algo opcional/manual si sobra tiempo, en vez de al revés.

El endpoint `createFromSpreadsheet` ya está anticipado en el diagrama junto a los endpoints CRUD estándar de instrumentos. Es un buen signo: la carga masiva por Excel se planteó como algo _adicional_ al CRUD uno-a-uno, no como reemplazo — y el CRUD uno-a-uno es lo que la letra exige explícitamente.

### 1.2 Lo que falta para cumplir la letra (obligatorio agregar)

Ni el diagrama ni la introducción mencionan varias piezas que la letra exige de forma no negociable, porque son evaluadas específicamente en el Obligatorio 1 y en el Obligatorio 2:

**Planes `plus`/`premium` y límite de 4 documentos.** No aparece en ningún lugar de la propuesta nueva. Es RF19 y RF03-CA4 en el backend, y el punto 6 completo (Informe de uso) en el frontend. Hay que decidir explícitamente sobre qué entidad recae este límite — ver recomendación en 1.3.

**Registro público limitado a un solo rol, con roles privilegiados precargados.** El diagrama muestra cuatro actores (Admin, Empresa, Cliente, Manager) sin indicar cuál de ellos se autorregistra. RF11 exige que el registro público solo pueda crear un tipo de usuario, y que cualquier otro rol exista únicamente precargado en la base. Con cuatro actores, hay que dejar explícito cuál es el "usuario" que se autoregistra y confirmar que los demás no tienen endpoint público de alta.

**Subida de imagen.** No aparece en el diagrama. Es RF20 y es obligatorio (Cloudinary o Vercel Blob). Hay que decidir a qué entidad se asocia — candidatos razonables: logo del banco, comprobante/captura de la posición importada, foto del bien cuando el instrumento es algo físico.

**Categoría con integridad referencial explícita.** Hace falta un catálogo administrado por Admin, asignable, con la regla de "no se puede borrar si tiene documentos asociados" (RF16/RF17). _(Actualizado: se decidió que Banco pasa a ser el `documento` plan-limitado — ver 1.3 — así que el rol de categoría lo cumple Clase de Instrumento, no Banco.)_

**Paginación y filtros** sobre la colección principal (RF14/RF15) — el diagrama es un modelo de dominio, no tiene por qué mostrarlos, pero hay que asegurarse de que queden en el diseño de la API, no solo en la letra.

### 1.3 Decisión: qué entidad es el "documento" de la letra — VERSIÓN FINAL (14/09, tercera iteración)

La letra pide que exista **una** colección con estas características juntas: alta/baja/modificación/consulta con filtros y paginación, límite de cantidad según plan (4 en `plus`, ilimitado en `premium`), imagen asociada, y pertenencia a una "categoría" administrada (con integridad referencial al borrar). La letra dice textualmente sobre el límite de plan: _"la entidad que maneja esta restricción queda a elección del equipo"_ — así que hay libertad real para elegir, y esta tercera vuelta es la que mejor cierra con todo lo demás (letra, diagrama original y `Documento de análisis.pdf`):

- **`categoría` = Banco.** Vuelve a ser el catálogo global administrado por Admin, tal cual estaba dibujado desde el principio ("Admin puede dar de alta un banco"). Admin hace ABM de Bancos; un Banco no se puede borrar si tiene Cuentas asociadas (regla de integridad referencial, equivalente a RF17).
- **`documento` = Cuenta** (reutilizando el nombre que ya usaba el `Documento de análisis.pdf` en RF05–RF09: "registrar cuenta bancaria/inversión"). La crea el usuario (asesor/empresa), referencia un Banco del catálogo y un Cliente, y es la entidad sobre la que se aplica todo el paquete de la letra: alta/baja/modificación/consulta con filtros (por banco, cliente, moneda, estado, fecha de alta) y paginación, imagen (comprobante de apertura/titularidad de la cuenta), y el límite de plan — `plus` hasta 4 Cuentas, `premium` ilimitadas.
- Como cada Cuenta referencia un único Banco, en la práctica "4 cuentas" equivale a "hasta 4 bancos distintos habilitados para ese usuario", que es justo la regla de negocio buscada — sin necesitar lógica de "contar bancos distintos": alcanza con contar registros de Cuenta, que es exactamente el patrón que ya prueba la letra (CA4: "usuario con 4 activos → 403" aplicado ahora a Cuenta).
- **Instrumento** queda como el nivel de detalle _dentro_ de cada Cuenta (las posiciones importadas por Excel o cargadas a mano): CRUD normal, sin límite de plan propio, con sus propios filtros (clase de instrumento, moneda, rango de valor, apreciación/depreciación). Ahí es donde sigue viviendo la lógica de consolidación, la cotización/FX de terceros y el análisis de IA sobre la cartera.
- **Clase de Instrumento** (Acción/Bono/Fondo/Efectivo) puede quedar como un simple `enum` en Instrumento, sin necesidad de ser una segunda categoría con ABM propio — con Banco ya cubriendo el rol de "categoría" que pide la letra, no hace falta duplicar ese patrón.

Este mapeo es el que mejor reutiliza lo que ya existía: Banco funciona tal cual estaba en el diagrama, Cuenta reutiliza el nombre y el rol que ya tenía en el `Documento de análisis.pdf` original, e Instrumento sigue siendo donde vive el valor de negocio (la posición y su consolidación). No quedan entidades "artificiales" agregadas solo para satisfacer la letra.

Cliente sigue siendo una entidad de negocio libre (CRUD sin límite), y sigue siendo lo que reciben las Cuentas como dueño final. Vale la pena decir en voz alta que el número 4 sigue siendo una regla del ejercicio académico, no una limitación real de una gestora de patrimonio — no hace falta justificarlo más allá de "así lo pide la letra".

_(Nota histórica: las dos iteraciones anteriores de esta sección — `documento=Instrumento`/`categoría=Banco`, y luego `documento=Banco` con Banco como entidad propia del usuario — quedan reemplazadas por esta versión, que es la adoptada.)_

### 1.4 Recorte de alcance recomendado para los 17 días de Obligatorio 1

El `Documento de análisis.pdf` original define 39 RF (gestión de clientes, cuentas, carga de Excel con 9 sub-requisitos de validación, procesamiento, consolidación con 8 dimensiones, dashboard con 7 vistas). Sumado a todo lo que exige la letra del obligatorio (auth, roles, planes, categoría, imagen, IAG, terceros, paginación, Postman), es demasiado para 17 días. Se recomienda un **núcleo cerrado** y dejar el resto como extra explícito para después del 1/10, o directamente para la etapa de frontend:

Núcleo (imprescindible para la nota del backend): registro/login/logout con JWT, un admin precargado; CRUD de Cliente (nombre/razón social, RUT, ejecutivo responsable, estado); CRUD de Banco como categoría (Admin), con bloqueo de borrado si tiene cuentas asociadas; CRUD de Cuenta con paginación, filtros, límite de plan (4/ilimitado según `plus`/`premium`) y subida de imagen (comprobante); CRUD de Instrumento dentro de cada Cuenta; carga de Instrumentos vía Excel con las validaciones mínimas (columnas obligatorias, tipos de datos, duplicados) — no hace falta todo el detalle de RF10-RF18 del documento original, con 3-4 validaciones bien hechas alcanza; endpoint de consolidación que agregue por moneda y por banco (no hace falta las 8 dimensiones de RF25-RF32, con 2-3 alcanza para la nota y para dar contenido al dashboard); endpoint FX de terceros con caché; endpoint de IAG sobre la posición consolidada de un cliente; colección de Postman con tests por status code.

Extras (si sobra tiempo, o se pasan al desarrollo del frontend en las semanas siguientes): consolidación por fecha histórica y evolución patrimonial (RF32, RF39 — requieren guardar snapshots, es trabajo real); cotización de mercado de acciones además de FX; reporte descargable en PDF; corrección manual de registros con error (RF24 del análisis original); rol de Cliente con login propio y su propio dashboard (ver 1.5); derivados (Call/Put) como tipo de instrumento (ver sección 2).

_(Actualizado 14/09: Fondos se saca de este listado de extras y pasa al núcleo del sprint — decisión explícita del equipo. `fondo` se implementa junto con `accion`, `bono` y `efectivo` desde el arranque; solo los derivados (Call/Put) quedan como extra.)_

### 1.5 Roles: recomendación de simplificar de 4 a 2 (con Cliente como dato, no como login)

El diagrama plantea Admin, Empresa, Cliente y Manager como actores. Mantener cuatro roles con permisos distintos multiplica el trabajo de autenticación/autorización y la matriz de tests de Postman (cada endpoint hay que testearlo contra cada rol). Para los 17 días de Obligatorio 1 se recomienda:

Quedarse con dos roles de login: `admin` (precargado, gestiona el catálogo de Bancos) y `user` (se autoregistra, es quien la letra llama "usuario común" — en el relato de negocio, es el asesor/gestora que usa la plataforma). No hace falta modelar "Empresa" como una entidad separada gestionada por Admin: el propio `User` que se registra ya representa a la empresa/asesor, igual que en el tema anterior el `User` representaba directamente al inversor. Esto elimina una capa entera de complejidad (Admin ya no necesita un CRUD de Empresas) sin perder nada de la letra.

`Cliente` no necesita ser un actor con login — puede ser simplemente un registro que pertenece a un `User`, sin autenticación propia. La introducción menciona que el cliente final "ve y descarga reporte" y "puede ver un dashboard", lo cual sí implica que en algún momento el cliente necesita acceso — pero eso se puede resolver más adelante (Obligatorio 2, o como extra) con un enlace de solo lectura o un segundo login simple, sin bloquear el backend núcleo.

`Manager` se recomienda eliminarlo del modelo o fusionarlo con `User`: no está claro qué permiso tiene que no tenga ya el asesor/empresa, y agregar un tercer rol de login sin una necesidad de negocio clara solo suma superficie de testing sin sumar nota.

---

## 2. Paso 2 — Evaluación del diagrama de dominio

### 2.1 Fortalezas del diagrama

El diagrama ya intenta cubrir varias piezas exigidas por la letra: hay un actor Admin separado del usuario cliente, hay un catálogo (Banco) dado de alta solo por Admin, y ya aparece un endpoint de import masivo (`createFromSpreadsheet`) al lado del CRUD estándar en vez de reemplazarlo. Esa intuición de "el import es un endpoint más, no un reemplazo del ABM" es correcta y vale la pena conservarla.

### 2.2 El problema más importante: "Empresa" significa tres cosas distintas

El nombre "Empresa" aparece al menos tres veces en el diagrama con significados completamente distintos: (1) la empresa gestora/asesora que usa el sistema, dada de alta por Admin, arriba a la izquierda; (2) la compañía emisora de una acción o un bono corporativo, abajo, con el atributo "Sector"; (3) implícitamente, la gestora de un fondo, sugerida por el cuadro "Empresa fondos" que cuelga de una de las cajas "Empresa" sin que la relación esté clara. Esto no es un detalle cosmético: en el modelo de datos real (colecciones de Mongo, nombres de modelos Mongoose) esta ambigüedad va a generar bugs y va a ser difícil de explicar en la defensa, donde se pide conocimiento profundo del código. Se recomienda renombrar antes de tocar código: la empresa gestora pasa a ser simplemente el `User` (ver 1.5, ya no necesita existir como entidad separada); el emisor de una acción o bono pasa a llamarse `Emisor`; si se modela la gestora de un fondo, `GestoraFondo`. Ninguna de las tres debería volver a llamarse "Empresa" a secas.

### 2.3 Relaciones sin cardinalidad ni dirección clara

La relación entre `Manager` y `Cliente` está marcada como "1 n" pero no queda claro si un Manager tiene muchos Clientes o si es al revés, ni qué le agrega Manager al modelo que no tenga ya el actor Empresa. De forma similar, la flecha "CRUD" que sale de la zona de Manager hacia la caja `Empresa` (emisor) de abajo sugiere que Manager administra emisores, lo cual no se menciona en ningún otro lado y probablemente sea un cruce accidental de líneas más que una relación real. Con la simplificación de roles de 1.5 este problema desaparece solo, porque Manager deja de existir.

### 2.4 Los verbos HTTP del listado de endpoints están mal

En la esquina superior derecha del diagrama, el listado de endpoints de Banco usa verbos HTTP que no siguen las convenciones REST que la letra pide respetar (buenas prácticas, OWASP): `GET /v1/bank/create` (un alta debería ser `POST`, no `GET`, porque `GET` no debería tener efectos secundarios), `POST /v1/instrumentos/delete` y `POST /v1/instrumentos/update` (deberían ser `DELETE` y `PUT`/`PATCH` sobre `/v1/instrumentos/:id`, no acciones por `POST`), y `PUT /v1/instrumentos/get` (una consulta debería ser `GET`, nunca `PUT`). Vale la pena corregir esto ahora que es barato, antes de que se convierta en código: el patrón recomendado es `POST /v1/instrumentos` (crear), `GET /v1/instrumentos` (listar, con paginación/filtros) y `GET /v1/instrumentos/:id` (detalle), `PUT` o `PATCH /v1/instrumentos/:id` (modificar), `DELETE /v1/instrumentos/:id` (borrar), y `POST /v1/instrumentos/import` como endpoint de acción aparte para la carga masiva (ese sí puede quedar fuera del patrón CRUD, porque no es una operación CRUD pura). Mismo patrón para `/v1/bancos`.

### 2.5 Respuesta directa: ¿está bien clasificados los instrumentos?

Parcialmente. La intuición de partida (acciones, bonos, fondos, derivados, efectivo) es razonable y se parece a cómo se clasifica una cartera real, pero la clasificación tal como está dibujada mezcla dos ejes distintos en un solo nivel y eso trae problemas concretos:

**Call y Put no son "clases de activo" del mismo tipo que Acciones/Bonos/Fondos/Cash.** Son derivados: contratos cuyo valor depende de un instrumento subyacente, con atributos propios (strike, vencimiento, prima, tipo call/put) que hoy no tienen ningún atributo definido en el diagrama — literalmente son las dos únicas cajas sin lista de atributos. Ponerlos al mismo nivel que "Acciones" como si fueran una clase de activo más es lo que produce esa laguna: no hay dónde colgar sus atributos porque el modelo asume que todas las hojas del árbol son "cosas que se tienen en cantidad y precio", y una opción no encaja en ese molde. Recomendación: separar en dos familias — instrumentos primarios (Acción, Bono, Fondo, Efectivo) e instrumentos derivados (Opción, con subtipo call/put) — y que el derivado tenga una referencia al instrumento subyacente.

**Cash tampoco tiene atributos**, y con razón: no encaja en el patrón "cantidad × precio" del resto. Necesita su propio par de atributos (moneda, monto) en vez de heredar la forma genérica de instrumento.

**Acciones y Bonos comparten el concepto de emisor (Empresa/Gobierno), pero Fondos se clasifica por composición (De acciones/De Bonos/Balanceados/Alternativos), que es un eje distinto** (qué contiene el fondo, no quién lo emite). Ambos ejes son válidos, pero mezclarlos en la misma jerarquía visual sin distinguirlos genera la confusión de nombres de 2.2.

**Para la implementación, se recomienda no modelar esto como una jerarquía profunda de subclases** (seis colecciones o modelos distintos, cada uno con sus propios subtipos). Con Mongoose lo más simple y lo más alineado con el tiempo disponible es una única colección `Instrumento` con un campo discriminador `tipo` (`accion` | `bono` | `fondo` | `opcion` | `efectivo`) y un sub-documento `detalle` cuya forma depende del tipo (usando discriminators de Mongoose o validación condicional con Joi). Esto además resuelve un problema práctico: la letra pide que "documento" sea una única colección con paginación, filtros y límite de plan — si Acciones, Bonos, Fondos y Opciones fueran colecciones separadas, contar "cuántos documentos tiene el usuario" o paginar el listado combinado se vuelve mucho más complicado de lo necesario.

**Para el recorte de los 17 días**, se recomienda implementar completo Acción, Bono, Fondo y Efectivo (Fondo se incorporó al núcleo el 14/09, ver nota en 1.4), y dejar solo las Opciones (Call/Put) como tipo "extra" si sobra tiempo — modelar bien una opción (con su lógica de valuación) es un problema no trivial y desproporcionado para el tiempo disponible. Fondo en cambio es manejable dentro del núcleo: no necesita cotización de mercado propia (su `detalle` es la composición — de acciones/de bonos/balanceado/alternativo — no un precio que haya que ir a buscar a un proveedor externo), así que no agrega el riesgo de integración que sí tendría una Opción.

---

## 3. Resumen de próximos pasos

1. Mapeo confirmado: `documento = Cuenta` (con límite de plan, imagen y filtros), `categoría = Banco` (catálogo global de Admin) (sección 1.3).
2. Simplificar a 2 roles de login: `admin` precargado y `user` autoregistrado; `Cliente` como dato sin login (sección 1.5).
3. Agregar explícitamente al modelo: plan `plus`/`premium` con límite de 4 Cuentas, subida de imagen sobre Cuenta, y la regla de integridad referencial al borrar un Banco.
4. Corregir los verbos HTTP del listado de endpoints (sección 2.4).
5. Renombrar toda ocurrencia de "Empresa" para eliminar la ambigüedad de tres significados (sección 2.2).
6. Redibujar la clasificación de instrumentos separando primarios de derivados, y decidir si Fondos/Opciones quedan dentro o fuera del núcleo de los 17 días (sección 2.5).
7. Recortar el alcance del `Documento de análisis.pdf` original al núcleo de la sección 1.4, dejando el resto documentado como extra.
