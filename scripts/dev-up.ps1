$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root ".env"
$envExampleFile = Join-Path $root ".env.example"

if (-not (Test-Path $envFile)) {
  Copy-Item $envExampleFile $envFile
  Write-Host "Archivo .env creado desde .env.example"
}

Set-Location $root
docker compose up --build
