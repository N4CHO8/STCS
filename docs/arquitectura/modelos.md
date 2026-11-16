# Modelos de análisis y ejecución

Los nombres CL1/UC/SEQ/ACT son los localizadores de la matriz. Las entidades representan filas y relaciones de PostgreSQL; no se afirma que exista un ORM con esas clases.

## UC1–UC6 Casos de uso

```mermaid
flowchart LR
  T[Especialista] --> UC1([UC1 Iniciar sesión adulta])
  D[Docente] --> UC1
  G[Apoderado] --> UC1
  A[Administrador] --> UC1
  T --> UC2([UC2 Consultar ficha e informes autorizados])
  G --> UC2
  D --> OR([Leer solo orientaciones])
  T --> UC3([UC3 Editar tablero asignado])
  D --> UC3
  N[Niño en ESP] --> UC4([UC4 Elegir pictogramas y hablar])
  T --> UC5([UC5 Consultar actividad autorizada])
  G --> UC5
  R[Adulto junto al ESP] --> UC6([UC6 Configurar Wi-Fi local])
  A --> AD([Gestionar adultos y solicitar asignaciones])
```

Admin no recibe identidad ni clínica de niños. Child no es actor del portal adulto. El especialista redacta diagnóstico separado de orientaciones.

## CL1 Entidades y datos

```mermaid
classDiagram
  class User {
    uuid id
    string role
    boolean is_active
    string password_hash
  }
  class StudentProfile {
    uuid id
    uuid child_user_id
    string display_name
    string sensitive_notes
  }
  class UserAccess {
    uuid actor_user_id
    uuid subject_user_id
    string relationship
    datetime approved_at
  }
  class Pictogram {
    uuid id
    uuid student_profile_id
    string label
    string message
    string category
    string image_path
    string audio_key
  }
  class Device {
    uuid id
    uuid student_profile_id
    string device_code
    string api_key_hash
  }
  class Event {
    uuid id
    string external_event_id
    string event_type
  }
  class PhraseAudio {
    string cache_key
    string status
    string voice
  }
  User "1" --> "0..1" StudentProfile : perfil child
  User "1" --> "0..*" UserAccess : actor adulto
  UserAccess "*" --> "1" User : sujeto child
  StudentProfile "1" --> "*" Pictogram : tablero
  StudentProfile "1" --> "*" Device : dispositivo asignado
  Device "1" --> "*" Event : origen
  Pictogram "*" --> "0..1" PhraseAudio : frase versionada
```

Modelo lógico resumido: comprobar nombres físicos en migraciones y consultas antes de usarlo como DDL. Los informes y orientaciones se proyectan desde el backend por rol; no se descargan todas las filas al navegador para ocultarlas allí.

## SEQ1 Imagen y frase propias

```mermaid
sequenceDiagram
  actor Adulto
  participant Web
  participant API as Next.js API Vercel
  participant SQL as Supabase PostgreSQL
  participant Files as Storage privado
  participant Voz as Función Python Piper
  participant ESP
  Adulto->>Web: Imagen, etiqueta y frase independientes
  Web->>API: Subida y guardado autenticados
  API->>SQL: Validar rol, asignación y capacidad
  API->>Files: PNG y RGB565 normalizados
  API->>SQL: Pictograma y trabajo por hash de frase
  API->>Voz: Preparar frase y versión de voz
  Voz-->>API: WAV PCM
  API->>Files: Persistir WAV validado
  ESP->>API: Consultar tablero con clave individual
  API->>SQL: Validar dispositivo y pertenencia
  API-->>ESP: Metadatos y hashes
  ESP->>API: Descargar recurso autorizado
  ESP->>ESP: Verificar tamaño y hash, actualizar caché
  Adulto->>ESP: Seleccionar y Hablar
  ESP->>ESP: Reproducir frase vigente
```

Si falla voz/descarga, se muestra estado/error y no se reproduce silenciosamente una frase antigua. Cambiar frase cambia la clave del audio.

## SEQ2 Privacidad ante URL directa

```mermaid
sequenceDiagram
  actor Docente
  participant Web
  participant API
  participant SQL
  Docente->>Web: Abrir sesión
  Web->>API: Login
  API->>SQL: Verificar cuenta, rol activo y contraseña
  API-->>Web: Cookie HttpOnly de sesión
  Docente->>API: Solicitar ficha/diagnóstico por URL directa
  API->>SQL: Comprobar sesión y asignación vigente
  API-->>Docente: Rechazo o proyección permitida según endpoint
  Note over API,SQL: Nunca incluir diagnóstico ni progreso en JSON del docente
```

Implementación: frontend/src/lib/server/portal.ts, access.ts, auth.ts; rutas antiguas también verificadas en integración.

## ACT1 Operación del comunicador

```mermaid
flowchart TD
  S([Inicio]) --> Load[Leer tablero y atlas guardados]
  Load --> Net{Wi-Fi disponible}
  Net -->|Sí| Sync[Sincronizar metadatos y recursos verificados]
  Net -->|No| Cached[Usar recursos conservados y mostrar estado]
  Sync --> Choose[Categoría y página]
  Cached --> Choose
  Choose --> Select[Agregar selección a frase]
  Select --> Action{Acción}
  Action -->|Navegar| Choose
  Action -->|Borrar explícitamente| Clear[Vaciar frase]
  Clear --> Choose
  Action -->|Hablar| Ready{Audio vigente disponible}
  Ready -->|Sí| Play[Reproducir]
  Ready -->|No| Error[Descargar o indicar indisponibilidad]
  Play --> Queue[Persistir evento y enviar al recuperar conexión]
  Queue --> Ack{ACK correcto}
  Ack -->|Sí| Retire[Retirar evento de cola]
  Ack -->|No| Keep[Conservar para reintento]
  Retire --> Choose
  Keep --> Choose
  Error --> Choose
```

La cola admite 64; llenado y corte de energía siguen requiriendo ensayo físico. La zona táctil inferior defectuosa se evita con controles superiores y flechas laterales; no se considera reparada.
