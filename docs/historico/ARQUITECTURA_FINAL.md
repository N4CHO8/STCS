> Registro histórico de su fecha. Para estado, límites y operación actuales consultar [Defensa de STCS](../DEFENSA.md). Los contratos y procedimientos antiguos no son instrucciones vigentes.

# Arquitectura publicada de STCS

Actualización 16/11/2026. Web React/Next.js y API Node en Vercel; PostgreSQL y
Storage privado en Supabase; Piper en una función Python de Vercel; firmware
Arduino reproducible en Waveshare ESP32-S3. PlatformIO conserva un prototipo
histórico, no la interfaz activa. No existe dependencia operativa de Render.

El navegador y el ESP son clientes separados de la API HTTPS. El navegador
usa sesión HttpOnly, rol y asignación; el ESP una clave individual. No hay
conexión directa frontend–Arduino ni uso de USB como transporte cotidiano.

Los responsables autorizados configuran imagen/frase. La API valida y persiste,
prepara voz y sirve medios privados. El ESP consulta su tablero, verifica
archivos y reproduce la frase vigente; envía eventos persistentes con ACK.
PostgreSQL mantiene entidades/relaciones y Storage PNG, RGB565 y WAV.

El modelo, datos, secuencias y decisiones vigentes están en
[arquitectura/README.md](../arquitectura/README.md). La matriz de roles está en
[FLUJO_ROLES.md](../FLUJO_ROLES.md); el alcance de evidencia y limitaciones en
[HITO3_ENTREGA.md](../DEFENSA.md). No se exponen claves SQL/Storage al ESP.
