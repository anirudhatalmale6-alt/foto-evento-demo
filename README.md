# FotoEvento — Demo de plataforma de venta de fotos

Prototipo funcional de una plataforma tipo Wfolio para la venta de fotografías de eventos
(promociones, graduaciones). Construido como demostración para el cliente.

## Flujo demostrado
1. **Galería privada con PIN** — acceso por enlace + PIN (demo: `2025`).
2. **Vista previa con marca de agua** — el cliente sólo ve versiones con marca de agua en mosaico. Los originales nunca se publican.
3. **Selección de fotos** — individuales o por paquetes, con precios definibles por evento.
4. **Precios por paquete** — se aplica automáticamente el mejor precio (ej. 5 fotos = paquete).
5. **Pago con Yape (aprobación manual)** — el cliente envía su comprobante/código de operación y el fotógrafo aprueba desde el panel; recién ahí se libera la descarga en alta sin marca de agua.

En el sistema real: panel de administración, eventos ilimitados, subida masiva de miles de fotos,
almacenamiento en la nube (Cloudflare R2), y arquitectura lista para la API automática de Yape.

Stack propuesto: Laravel + MySQL. Código fuente completo entregado al cliente.
