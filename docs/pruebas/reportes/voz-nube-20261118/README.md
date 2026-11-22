# Fallo de preparación de voz en producción

18/11/2026. El autor informó dos intentos fallidos en la web publicada y un tiempo de 13,93 s hasta aplicar el cambio al ESP. Ese tiempo no acredita disponibilidad de voz. La incidencia se registra como D15 en TCS-60.

| Comprobación | Resultado |
| --- | --- |
| Producción inspeccionada | main ebfc605; Vercel dpl_DFdVe1SB3JkMbW3KPKzpPFXVMN4Q |
| Registros de Vercel | POST /api/voice devuelve 422 en los intentos del usuario; Node informa preparación fallida |
| Petición sintética directa, sin datos de perfiles | 422 con frase válida; no se creó audio en base de datos |
| Configuración descargada | SHA256 7d82d069eccca0f87963bd23c33166fe1ef6d24a6b231543931bfe692397f256 |
| Configuración revisada y usada localmente | SHA256 531c4051502e1acbc10b42437f11679bfce9e3919e1796e51fabd73e01e7fd2e |
| Reproducción local del fallo | ValueError: Model checksum mismatch al descargar el JSON distinto con caché sin configuración |
| Corrección local | Configuración revisada empaquetada y verificada; descarga del modelo fijada a revisión inmutable; errores de síntesis pasan a 503, no a error de entrada 422 |
| Regresión | Ocho pruebas sin red ni base aprobadas; autorización, entradas, caché fría, integridad, respuesta y error del servidor |
| HTTP real con Piper y configuración inicialmente ausente | 200 audio/wav; PCM mono, 16000 Hz, 16 bits; 40168 bytes en la ejecución registrada |
| Publicación y nueva prueba cloud | Pendientes de autorización y despliegue; producción sigue con el fallo hasta entonces |

Los JSON difieren en metadatos; no se atribuye un cambio reciente del proveedor sin historial que lo demuestre. El error consistía en exigir los bytes de la configuración local y descargar otro archivo. La corrección conserva el hash revisado y la identidad de voz existente; no desactiva integridad ni cambia frases o registros de usuarios.

La configuración pequeña se incluye explícitamente en la función de Vercel. El modelo permanece en caché temporal, con tamaño/hash verificados, desde la revisión `0ca208afc2a2ee102b1e961e72e0a7e4907be3d0` del [repositorio de voces](https://huggingface.co/rhasspy/piper-voices/tree/0ca208afc2a2ee102b1e961e72e0a7e4907be3d0/es/es_ES/davefx/medium). Su SHA256 coincide con el ya usado por STCS. [Runtime Python de Vercel](https://vercel.com/docs/functions/runtimes/python).

Repetir las pruebas desde la raíz:

```powershell
python -m unittest discover -s frontend/tests -p voice_function_test.py -v
```

El informe conserva la evidencia local y distingue la solicitud HTTP real con Piper de las ocho pruebas controladas. El pase local no cierra la incidencia de producción: después de publicar deben prepararse frases nuevas en Vercel, comprobar Storage y reproducirlas en el ESP. No se utilizaron migraciones, seeds ni contraseñas en los reportes.
