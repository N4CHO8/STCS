# Corrección de sincronización de la prueba de sesión

TCS-88, 16/11/2026. La ejecución de main
[43919662084](https://github.com/N4CHO8/STCS/actions/runs/43919662084)
del commit d52d955 falló en CP-RF01-E02: nueve recorridos pasaron y uno agotó
30 segundos esperando pulsar Actualizar datos. El log muestra que el botón se
desmontó mientras Playwright intentaba pulsarlo. El candidato del PR #14 sí
había aprobado su CI; ese resultado no garantizaba la ejecución posterior del
commit integrado. Vercel de d52d955 estaba READY.

## Causa y corrección

El helper de login esperaba el botón de cerrar sesión, pero todavía podían
existir cargas del portal. Tras quitar las cookies, una petición pendiente o
un refresco podía recibir 401 y redirigir antes del clic del test. Esa salida
correcta del portal desmontaba el control que la prueba seguía buscando.

Se espera la vista cargada y el botón habilitado. Una barrera en el transporte
de prueba mantiene las peticiones del portal hasta que se completa el clic.
Después se liberan hacia el servidor real, se exige un 401 real y se comprueban
la URL de login y la ausencia del botón de sesión privada. La barrera se libera
y las rutas de prueba se retiran también en finally. Las promesas del clic y
del 401 se observan juntas para no dejar rechazos sin manejar.

No se simula el 401, no se agregan reintentos, no se amplía el timeout ni se
modifica el manejo de sesión de producción. Se mantienen PostgreSQL y servidor
localhost, el marcador de aislamiento y la limpieza de fixtures del runner.

## Validación

- Sintaxis Node y formato Prettier de la prueba revisados localmente.
- Docker local estaba detenido; no se ejecuta el runner contra la base habitual
  ni se escribe sobre Supabase como alternativa.
- El CI del candidato ejecutará el recorrido completo con PostgreSQL
  descartable. Registrar su resultado antes de integrar y comprobar también
  la ejecución de main, que fue donde se observó la diferencia anterior.

Los reportes históricos de diez recorridos aprobados mantienen sus revisiones
originales. No se altera su fecha ni se borra la ejecución fallida del historial.
