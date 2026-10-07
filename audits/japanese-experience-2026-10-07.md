# Auditoría del recorrido japonés — 7 de octubre de 2026

Revisión técnica y lingüística asistida; no se ha realizado una revisión por una persona nativa. Cambios locales, sin publicación.

## Problemas corregidos

- Registro: se enviaba siempre español como idioma preferido. Ahora se envía el idioma seleccionado, con prueba para los siete idiomas.
- Confirmación de correo y recuperación: las plantillas solo estaban en español e inglés. Ambos correos tienen ahora textos en es, en, fr, de, zh, ru y ja. Los enlaces incluyen el idioma para abrirse correctamente en otro dispositivo. El texto plano conserva los caracteres originales; el HTML escapa el nombre del usuario.
- Yen y otras monedas: los importes se formatean según idioma y moneda. JPY muestra separadores de miles y cero decimales; EUR conserva los céntimos. Actividades sin moneda explícita heredan la del viaje tanto en presupuesto como en impresión.
- Alojamientos: el formulario mostraba € de forma fija. Ahora identifica la moneda del viaje.
- Días: 日目 1 se sustituye por 1日目 en planificación, listas, alojamientos, exploración, presupuesto e impresión; los intervalos japoneses son 1〜3日目.
- Nombres: los viajeros se muestran con el apellido antes del nombre en japonés; también se ajusta el orden de las iniciales. Los campos almacenados no cambian.
- Accesibilidad: etiquetas de completar actividades y controles de zoom traducidas en los siete idiomas. Los botones de editar, eliminar y abrir mapas tienen nombres accesibles; los marcadores identifican el lugar.
- Recuperación móvil: título japonés con líneas equilibradas para evitar una única letra en la última línea en pantallas estrechas.
- Recuperación: se ha aclarado el mensaje japonés de envío condicional del enlace.

## Recorrido y comprobaciones

Se han revisado los componentes y catálogos de registro, login, confirmación, recuperación, planificación, mapas, alojamientos, viajeros, presupuesto, cuenta e invitaciones. Todos los catálogos contienen las mismas claves no vacías; las nuevas etiquetas también están en los siete idiomas.

La app actual organiza días por número y título; no tiene fechas de calendario para los días del viaje. La fecha visible de moderación ya usa el idioma seleccionado. No se ha introducido una zona horaria japonesa por el mero hecho de seleccionar japonés.

Validación visual local a 360 px: login, registro, recuperación, planificación, mapas, formulario de alojamiento, presupuesto y viajeros. La planificación, el presupuesto y los viajeros se comprobaron con datos simulados de nombres japoneses largos y precios JPY. No se detectó desbordamiento horizontal en presupuesto y viajeros. Recuperación comprobada también a 320 y 390 px. Los datos simulados y su página temporal se retiraron.

Pruebas: frontend 118 pruebas correctas; autenticación 47 pruebas correctas. Comprobación de traducciones, lint, compilación frontend y comprobación SEO de siete idiomas. No se han enviado correos reales ni registrado usuarios de producción.

## Límites y seguimiento

- Falta revisión nativa de japonés y de las nuevas plantillas en otros idiomas.
- Google, entrega real de correos y recorrido completo contra servicios reales no están certificados por estas comprobaciones. La vista local sin servicios muestra errores de conexión; los recorridos con sesión se comprobaron con respuestas simuladas.
- Las invitaciones se revisaron en código y mediante la suite existente; no se envió una invitación real.
- Usuarios ya existentes conservan su idioma preferido almacenado. Este cambio corrige el registro nuevo; no migra perfiles históricos ni modifica el alta social.
- Revisar futuras integraciones cuando estén disponibles. No contratar servicios ni publicar sin autorización explícita.
