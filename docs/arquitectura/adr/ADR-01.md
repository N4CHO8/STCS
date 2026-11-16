# ADR 01 API y despliegue web

Estado: decisión implementada, explicación retrospectiva del 16/11/2026; sin aprobación externa atribuida. H3-RF01/H3-RF03/H3-RF05, H3-RNF02/H3-RNF03.

Alternativas: API integrada Next.js en Vercel; frontend más backend separado en otro servicio; conexión directa del navegador a la base. Escala 1–5, mayor mejor. Puntajes son juicio técnico, no benchmarks.

| Criterio | Peso | Next.js integrado | Backend separado | Acceso directo cliente |
| --- | --- | --- | --- | --- |
| Autorizar y proyectar datos en servidor | 40% | 5 | 5 | 2 |
| Menos despliegues y configuración | 30% | 5 | 2 | 4 |
| Reutilización de tipos y mantenimiento | 20% | 5 | 3 | 3 |
| Flexibilidad de procesos largos | 10% | 2 | 5 | 1 |
| Total ponderado | 100% | 4,7 | 3,7 | 2,7 |

Se elige Next.js: las rutas adultas y del ESP viven junto a la web, comparten validación y simplifican la operación del MPV. Evidencia: frontend/src/app/api y frontend/src/lib/server; PR #5, CI y dominio publicado. Render no es un servicio activo requerido.

Consecuencia: los límites de ejecución y el arranque en frío importan. La voz se ejecuta en función Python alojada y persiste resultados; no depende del PC. La carga local no demuestra latencia ni cuotas de Vercel. Un backend separado conserva sentido si aumenta el trabajo asíncrono, pero hoy añadiría otro despliegue y secretos.
