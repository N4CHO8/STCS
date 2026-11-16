# STCS

Prototipo de comunicación aumentativa con ESP32-S3 táctil y una plataforma web para sus responsables.

**[Defensa y evidencias](docs/DEFENSA.md)** reúne los nueve artefactos solicitados por el profesor. [Estado de las pruebas](docs/pruebas/RESULTADOS.md) y [trazabilidad](docs/trazabilidad.md).

## Producto entregado

- Web React/Next.js y API HTTPS en Vercel; PostgreSQL y Storage privado en Supabase.
- Piper en una función Python de Vercel. La operación cloud no depende del PC del autor.
- Firmware Arduino v0.8.6-wifi-status para Waveshare ESP32-S3-Touch-LCD-1.46.
- Tablero actual: 96 pictogramas, 24 por categoría y seis páginas. Máximo operativo ensayado: 180, 45 por categoría y 12 páginas; no es máximo físico absoluto.
- Cuatro roles adultos con permisos de servidor. Child es un registro interno sin portal adulto.

Sin Wi-Fi no hubo voz en el ensayo físico. La caché limitada no garantiza audios offline. El dispositivo requiere alimentación USB de 5 V, sin batería instalada. Revisión profesional y prueba con varios ESP pendientes.

## Probar la aplicación

[Producción](https://0stcs0.vercel.app). Ingresar por `/login`. Cuentas públicas, ficticias y persistentes, solo para evaluación:

| Perfil | Correo | Contraseña de prueba |
| --- | --- | --- |
| Especialista | especialista.prueba01@stcs.test | Especialista123! |
| Docente | docente.prueba01@stcs.test | Docente1234! |
| Apoderado | apoderado.prueba01@stcs.test | Apoderado123! |

El administrador real conserva su acceso privado. Las cuentas reales verifican correo y eligen contraseña. El login no crea tablas, repuebla datos ni restablece cuentas. `/demo` está retirado. No introducir datos reales en los accesos públicos.

## Desarrollo reproducible

Usar la versión de Node de [.node-version](.node-version). Completar las variables de [.env.example](.env.example) privadamente en `.env.local` de la raíz; Next carga ese entorno desde `frontend/next.config.mjs`.

```powershell
cd frontend
npm ci
npm run dev
```

Abrir localhost:3000. El entorno habitual conecta a la base compartida: **las escrituras afectan producción**. Para pruebas usar exclusivamente [PostgreSQL y runners aislados](docs/PRUEBAS.md); no ejecutar seeds ni migraciones para comprobar conectividad.

## Código y operación

| Ruta | Contenido |
| --- | --- |
| frontend/src/app/api y src/lib/server | API, validación, permisos y persistencia |
| frontend/src/components/stcs | Portal de responsables y editor |
| frontend/api/voice.py | Síntesis Piper alojada |
| firmware/STCS_UI_Arduino | Firmware activo y reproducible |
| supabase | Esquema y migraciones versionadas |
| docs | Entrega técnica y procedimientos |
| docs/historico | Antecedentes fechados; no contratos vigentes |

- [Permisos y cuentas](docs/FLUJO_ROLES.md).
- [Arquitectura y modelos](docs/arquitectura/README.md).
- [Contrato API, medios y capacidad](docs/CONTRATO_MEDIOS_ESP.md).
- [Compilar y recuperar firmware](firmware/STCS_UI_Arduino/README.md).
- [Servicios y despliegue](docs/CONEXIONES.md), [contribución](CONTRIBUTING.md), [cambios](CHANGELOG.md).

PlatformIO en `firmware/stcs-esp32` es un prototipo histórico. Presentación y guion personales permanecen fuera del repositorio.
