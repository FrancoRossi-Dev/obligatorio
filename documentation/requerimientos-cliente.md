# Requerimientos – Frontend / Cliente (Obligatorio 2)

> Fuente: `2026_08_DFS_Obligatorio_2.pdf`
> Materia: Desarrollo Full Stack integrado con IA – ORT
> Carrera: Analista en Tecnologías de Información / Analista Programador

## Datos de la entrega

- **Puntaje:** máximo 25 – mínimo 1.
- **Fecha máxima de entrega:** 12/11/2026 hasta las 21:00 (gestion.ort.edu.uy).
- **Formato:** archivo único ZIP o RAR de hasta 40 MB.
- **Defensa:** online, entre el 16 y el 19 de noviembre inclusive. Instancia
  obligatoria; la no presentación implica la pérdida total de los puntos. Se
  espera conocimiento profundo de todo el código.
- **Producto final:** una aplicación para navegador web.
- Los requerimientos pueden ajustarse durante el desarrollo; las aclaraciones
  del docente son parte integral de la letra.

## Objetivo

Desarrollar el **frontend** de la aplicación y **consumir los servicios**
desarrollados en el primer obligatorio.

- La aplicación debe permitir el uso de **todos los endpoints** previstos en el
  Obligatorio 1, incluido el **manejo de imágenes**.
- Son válidos todos los ajustes de backend que se necesiten, aunque no sean
  evaluados en esta instancia.
- Aunque haya validaciones en el backend, se deben hacer **validaciones también
  en el frontend** para no sobrecargar los servidores innecesariamente.

## Requerimientos funcionales

- [ ] **1. Registro en la aplicación.**
  - Se ingresan los datos previstos en el registro, con un campo de **repetir
    contraseña** para verificar.
  - Mientras algún dato sea inválido, el botón de **registrar** debe estar
    deshabilitado.
  - La API devuelve el éxito o el error; en caso de éxito se devuelve la
    información pertinente del usuario.
  - En caso de error se muestra el mensaje **en la propia interfaz**.
  - Se valora el **auto-login** del usuario una vez hecho el registro.
- [ ] **2. Login en la aplicación.**
  - En caso de éxito se accede a la aplicación.
  - Mientras usuario o contraseña estén vacíos, el botón de **ingresar** debe
    estar deshabilitado.
  - En caso de error se muestra el mensaje **en la propia interfaz**.
- [ ] **3. Logout.** Se debe poder cerrar la sesión para que otro usuario se
  loguee.
- [ ] **4. Agregar un documento.** Formulario para el alta de un nuevo
  documento, disponible **siempre y cuando la cantidad** de documentos
  almacenados hasta el momento lo permita.
- [ ] **5. Documentos.**
  - [ ] **5.1. Listado:** se listan todos los documentos registrados por el
    usuario.
  - [ ] **5.2. Eliminar:** al costado de cada documento, un botón para
    eliminarlo.
  - [ ] **5.3. Modificar:** junto al botón de eliminar, un botón de editar para
    una edición sencilla, que puede ser en línea (inline).
  - [ ] **5.4. Filtro:** el listado debe contar con uno o varios filtros para
    mostrar algunos documentos.
- [ ] **6. Informe de uso.**
  - [ ] **6.1. Porcentaje o cantidad:** en un componente aparte, mostrar el
    **porcentaje** de documentos usados (sobre la restricción de 4) para los
    usuarios `plus`, y la **cantidad** de documentos para los usuarios
    `premium`.
  - [ ] **6.2. Cambio de plan:** en un componente aparte, el usuario debe poder
    cambiar a un plan `premium` (si corresponde).
- [ ] **7. Gráfico.** Graficar datos que se entiendan relevantes para la
  aplicación.
- [ ] **8. Funcionalidades restantes.** Libertad de implementación a nivel de
  frontend, respetando siempre las buenas prácticas y el uso correcto de
  herramientas de **ruteo** y **manejo de estado global**.

## Requerimientos no funcionales

- [ ] La aplicación se construye con **React**.
- [ ] **Redux** para el manejo de estado de toda la información que deba
  gestionarse en varios componentes.
- [ ] **React Router** para la navegación entre secciones.
- [ ] Una **biblioteca de formularios**.
- [ ] **Deploy en Vercel.**
- [ ] Producto final: aplicación para navegador web.

## Requerimientos de calidad (se valorarán)

- El **diseño visual** de la aplicación.
- Las **validaciones pertinentes** de todos los datos que ingresa el usuario.
- La atención a los detalles que aporten **realismo** a la aplicación.
- La implementación de **funcionalidades innovadoras** además de las
  solicitadas en la letra.
- En la defensa se valora el **conocimiento profundo de todo el código**; no
  poder explicarlo en profundidad es motivo de quita de puntos.

## Estructura de la entrega

- La **versión compilada** de la aplicación (build).
- El **código fuente** de la aplicación, excluyendo `node_modules`.
- Archivo con el **enlace a la URL** de la aplicación publicada.
