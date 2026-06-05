param(
  [string]$BaseUrl = $(if ($env:STCS_API_URL) { $env:STCS_API_URL } else { "https://0stcs0.vercel.app/api" })
)

$assignedChildId = "44444444-4444-4444-4444-444444444444"
$blockedChildId = "55555555-5555-5555-5555-555555555555"

function Write-Section($Message) {
  Write-Host ""
  Write-Host "== $Message =="
}

Write-Section "Demo de mitigacion de riesgo tecnico"
Write-Host "API: $BaseUrl"

$loginBody = @{
  email = "demo@stcs.local"
  password = "Demo1234!"
} | ConvertTo-Json

Write-Section "1. Login seguro con JWT"
$login = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
Write-Host "OK: usuario autenticado como $($login.user.role). Token recibido sin mostrarlo en consola."

$headers = @{
  Authorization = "Bearer $($login.token)"
}

Write-Section "2. Acceso permitido a nino asignado"
$allowedRecords = Invoke-RestMethod -Uri "$BaseUrl/records?userId=$assignedChildId" -Method GET -Headers $headers
Write-Host "OK: acceso permitido. Registros visibles: $($allowedRecords.total). Alcance: $($allowedRecords.access.scope)."

Write-Section "3. Intento de acceso a nino no asignado"
try {
  Invoke-RestMethod -Uri "$BaseUrl/records?userId=$blockedChildId" -Method GET -Headers $headers | Out-Null
  Write-Error "FALLO: el sistema permitio acceder a datos que no correspondian."
  exit 1
} catch {
  $statusCode = [int]$_.Exception.Response.StatusCode

  if ($statusCode -ne 403) {
    Write-Error "FALLO: se esperaba 403, pero se recibio $statusCode."
    exit 1
  }

  Write-Host "OK: acceso bloqueado con 403. El backend/API impidio leer informacion no asignada."
}

Write-Section "Resultado"
Write-Host "Mitigacion demostrada: autenticacion valida + autorizacion programada + filtrado por asignacion."
