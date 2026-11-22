# STCS

Prototipo de comunicación aumentativa con ESP32-S3 táctil y una plataforma web para sus responsables.

El [índice de entrega](docs/DEFENSA.md) reúne los artefactos, las pruebas y el alcance de la revisión profesional.

**[Defensa y evidencias](docs/DEFENSA.md)** reúne los nueve artefactos solicitados por el profesor. [Estado de las pruebas](docs/pruebas/RESULTADOS.md) y [trazabilidad](docs/trazabilidad.md).

## Producto entregado

- Web React/Next.js y API HTTPS en Vercel; PostgreSQL y Storage privado en Supabase.
- Piper en una función Python de Vercel. La operación cloud no depende del PC del autor.
- Firmware Arduino v0.8.6-wifi-status para Waveshare ESP32-S3-Touch-LCD-1.46.
- Tablero de referencia: 96 pictogramas, 24 por categoría y seis páginas. Máximo operativo ensayado: 180, 45 por categoría y 12 páginas; no es máximo físico absoluto.
- Cuatro roles adultos con permisos de servidor. Child es un registro interno sin portal adulto.

Sin Wi-Fi no hubo voz en el ensayo físico. La caché limitada no garantiza audios offline. El dispositivo requiere alimentación USB de 5 V, sin batería instalada. Revisión del prototipo realizada con Heriber Galleguillos el 20/11; se conserva su alcance en el [registro](docs/validacion/REGISTRO.md). No acredita eficacia clínica con niños. El propietario confirmó separación de dos ESP físicos y acceso desde varios computadores el 16/11; [registro multicliente](docs/pruebas/MULTICLIENTE_20261116.md), demostración física documentada por el ejecutor.

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

## Despliegue en los servicios existentes

Requisitos: Node de `.node-version`, npm, acceso a N4CHO8/STCS y al proyecto Vercel `frontend` con raíz `frontend/`; PostgreSQL y Storage del proyecto Supabase STCS. La voz usa Python/Piper de [requirements.txt](frontend/requirements.txt). No crear recursos de otros proyectos ni activar facturación.

Para revisar la aplicación localmente con configuración privada autorizada:

```powershell
cd frontend
npm ci
npm run build
npm run typecheck
npm run start
```

El entorno habitual comparte base con producción: estos comandos no autorizan datos de prueba allí. Para probar escritura usar [los runners aislados](docs/PRUEBAS.md).

En Vercel, conservar las variables **solo servidor** descritas sin valores en [.env.production.example](.env.production.example): conexión SQL/TLS, sesión, Supabase, Storage privado, credenciales individuales/heredadas acotadas del dispositivo y clave interna de preparación de voz. No copiar secretos a `NEXT_PUBLIC_*` ni publicar `.env.local`; los ejemplos no son credenciales de producción. Usar Storage persistente, no el disco temporal de una función.

La publicación usa la integración Git existente: rama y PR → `verify` aprobado → integración revisada en `main` → despliegue automático de Vercel. La función [voice.py](frontend/api/voice.py) y [vercel.json](frontend/vercel.json) pertenecen al mismo proyecto. No se necesita un trabajador permanente en el PC para operar la versión cloud.

Antes de publicar una migración, revisar impacto, respaldo y recuperación del destino; no ejecutar el esquema completo, seeds o preparación de laboratorio en producción. La ampliación local de CSV requiere revisar/aplicar únicamente su migración aditiva antes de ofrecerla como desplegada. Verificar después SHA/estado READY en Vercel y `/api/health` con `status: ok` y `database: connected`; la salud no sustituye la prueba de permisos y del recorrido de medios/voz.

URL del MVP: [0stcs0.vercel.app](https://0stcs0.vercel.app). Identificadores, separación de entornos y recuperación en [CONEXIONES](docs/CONEXIONES.md), [A8](docs/REPOSITORIO.md) y [firmware](firmware/STCS_UI_Arduino/README.md). El tag final congela la revisión efectivamente comprobada, no los archivos locales sin integrar.

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

El catálogo candidato usa [pictogramas ARASAAC](docs/PICTOGRAMAS.md), con créditos visibles y selección individual por el especialista.
