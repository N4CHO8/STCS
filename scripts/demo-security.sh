#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${STCS_API_URL:-https://0stcs0.vercel.app/api}"
ASSIGNED_CHILD_ID="44444444-4444-4444-4444-444444444444"
BLOCKED_CHILD_ID="55555555-5555-5555-5555-555555555555"

section() {
  printf "\n== %s ==\n" "$1"
}

section "Demo de mitigacion de riesgo tecnico"
printf "API: %s\n" "$BASE_URL"

section "1. Login seguro con JWT"
LOGIN_RESPONSE="$(
  curl -sS -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"demo@stcs.local","password":"Demo1234!"}'
)"
TOKEN="$(node -e "console.log(JSON.parse(process.argv[1]).token)" "$LOGIN_RESPONSE")"
ROLE="$(node -e "console.log(JSON.parse(process.argv[1]).user.role)" "$LOGIN_RESPONSE")"
printf "OK: usuario autenticado como %s. Token recibido sin mostrarlo en consola.\n" "$ROLE"

section "2. Acceso permitido a nino asignado"
ALLOWED_RESPONSE="$(
  curl -sS "$BASE_URL/records?userId=$ASSIGNED_CHILD_ID" \
    -H "Authorization: Bearer $TOKEN"
)"
TOTAL="$(node -e "console.log(JSON.parse(process.argv[1]).total)" "$ALLOWED_RESPONSE")"
SCOPE="$(node -e "console.log(JSON.parse(process.argv[1]).access.scope)" "$ALLOWED_RESPONSE")"
printf "OK: acceso permitido. Registros visibles: %s. Alcance: %s.\n" "$TOTAL" "$SCOPE"

section "3. Intento de acceso a nino no asignado"
STATUS_CODE="$(
  curl -sS -o /tmp/stcs-security-denied.json -w "%{http_code}" \
    "$BASE_URL/records?userId=$BLOCKED_CHILD_ID" \
    -H "Authorization: Bearer $TOKEN"
)"

if [ "$STATUS_CODE" != "403" ]; then
  printf "FALLO: se esperaba 403, pero se recibio %s.\n" "$STATUS_CODE"
  exit 1
fi

printf "OK: acceso bloqueado con 403. El backend/API impidio leer informacion no asignada.\n"

section "Resultado"
printf "Mitigacion demostrada: autenticacion valida + autorizacion programada + filtrado por asignacion.\n"
