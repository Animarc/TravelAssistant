# SEO técnico — 7 de octubre de 2026

## Preparado en este cambio (sin publicar)
- Siete portadas estables: /es/, /en/, /fr/, /de/, /zh/, /ru/ y /ja/.
- HTML de portada con contenido real antes de JavaScript, compartido con los textos visibles de la aplicación.
- Canonical propio por idioma, hreflang recíproco y raíz como x-default. La raíz conserva la preferencia del visitante; sin JavaScript presenta español y canonical /es/.
- Título, descripción, Open Graph y Twitter textuales; datos estructurados WebApplication sin valoraciones ni precios inventados.
- Sitemap únicamente con portadas canónicas. No añade fechas lastmod ficticias.
- Robots permite rastrear para que el buscador pueda leer noindex; rutas de cuenta, planificación, presupuesto, integrantes, objetos, valoraciones y verificación llevan noindex en el HTML generado.
- Enlaces con parámetros de recuperación/verificación reciben noindex mediante un script síncrono en head y también durante la navegación. No se incorporan parámetros ni tokens a metadatos.
- El workflow existente de Pages copia la portada a 404 y verify-email después del build. El script síncrono seo-init marca estas rutas noindex antes de cargar la aplicación; las demás rutas privadas conservan noindex directamente en el HTML. Los errores 404 mantienen además el estado HTTP del alojamiento.
- Pruebas del HTML generado incluidas en build y pruebas de navegación/metadatos.

Noindex no es un control de acceso: los datos privados siguen protegidos por la API.

## Viajes públicos: siguiente paso de arquitectura
La vista actual abre un viaje público dentro de /planning, sin URL pública persistente y con contenido cargado desde la API. Esa pantalla se mantiene noindex: también sirve para viajes privados.
Para indexar itinerarios individuales se necesita una ruta pública propia, por ejemplo /trips/{id}, con HTML renderizado que consulte exclusivamente la API pública y responda 404/410 cuando el viaje deje de ser público o se elimine. Su canonical no debe apuntar a /planning ni fingir que el contenido del viaje está traducido a siete idiomas.
GitHub Pages no permite consultar la privacidad en cada petición. No generar snapshots estáticos de viajes de usuarios: podrían seguir exponiendo itinerarios después de que el propietario los hiciera privados. Evaluar SSR/edge y política de invalidación antes de añadir esos viajes al sitemap. No se ha cambiado hosting ni configuración DNS.

## Tras publicar
1. Verificar HTTP 200 y HTML de /ja/, /es/, robots.txt y sitemap.xml; comprobar noindex de /account/ y /settings/ y HTTP 404 real para rutas inexistentes.
2. En Search Console, verificar la propiedad de dominio mediante la cuenta del propietario y enviar https://tabijilog.com/sitemap.xml.
3. Inspeccionar URLs de idiomas y revisar canonical elegido, páginas indexadas, errores y métricas reales de Core Web Vitals.
4. Medir clics orgánicos por idioma y activación cuando se implemente tracking. No prometer posiciones ni plazos de indexación.
5. Añadir una imagen social raster adecuada cuando se cierre la propuesta visual. Este cambio solo prepara previews textuales.

Referencias: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics y https://developers.google.com/search/docs/specialty/international/localized-versions
