param(
  [string]$ArduinoCli = (Join-Path $env:LOCALAPPDATA 'STCS-tools/arduino-cli/arduino-cli.exe'),
  [string]$ConfigDir = (Join-Path $env:LOCALAPPDATA 'STCS-tools/arduino-data'),
  [string]$SecretsFile,
  [string]$BuildPath = (Join-Path $env:LOCALAPPDATA 'STCS-tools/arduino-build-stcs')
)
$ErrorActionPreference = 'Stop'
$stcsRoot = Split-Path -Parent $PSScriptRoot
$stcsSketch = Join-Path $env:LOCALAPPDATA 'STCS-private/firmware-sketch/STCS_UI_Arduino'
$stcsBuild = $BuildPath
if (!(Test-Path -LiteralPath $ArduinoCli)) { throw 'Instala Arduino CLI o pasa su ruta con -ArduinoCli.' }
New-Item -ItemType Directory -Force -Path $stcsSketch | Out-Null
# Remove only obsolete generated files; preserve timestamps of unchanged headers
# so Arduino can reuse its library compilation cache.
$stcsSources = @(Get-ChildItem -LiteralPath (Join-Path $stcsRoot 'firmware/STCS_UI_Arduino') -File |
  Where-Object { $_.Name -notin @('STCS_NetworkSecrets.h','STCS_AudioAssets.c') })
$stcsNames = @($stcsSources.Name) + 'STCS_NetworkSecrets.h'
Get-ChildItem -LiteralPath $stcsSketch -File | Where-Object { $_.Name -notin $stcsNames } |
  ForEach-Object { Remove-Item -LiteralPath $_.FullName -Force }
foreach ($stcsSource in $stcsSources) {
  $stcsTarget = Join-Path $stcsSketch $stcsSource.Name
  if (!(Test-Path -LiteralPath $stcsTarget) -or
      (Get-FileHash -LiteralPath $stcsSource.FullName).Hash -ne (Get-FileHash -LiteralPath $stcsTarget).Hash) {
    Copy-Item -LiteralPath $stcsSource.FullName -Destination $stcsTarget -Force
  }
}
# Compile a copy with an unusable key: no production credential enters the binary.
@'
#pragma once
#define STCS_API_BASE_URL "https://0stcs0.vercel.app"
#define STCS_DEVICE_CODE "STCS-ESP32-001"
#define STCS_DEVICE_API_KEY "compile-only-not-a-real-credential"
#define STCS_WIFI_SETUP_PASSWORD "compile-only-setup-password"
#define STCS_ALLOW_INSECURE_HTTP 0
'@ | Set-Content -LiteralPath (Join-Path $stcsSketch 'STCS_NetworkSecrets.h') -Encoding utf8
if ($SecretsFile) {
  if (!(Test-Path -LiteralPath $SecretsFile)) { throw 'No se encontró la configuración privada.' }
  Copy-Item -LiteralPath $SecretsFile -Destination (Join-Path $stcsSketch 'STCS_NetworkSecrets.h') -Force
}
$stcsFlags = '-MMD -c -I"{0}" -DLV_CONF_INCLUDE_SIMPLE' -f $stcsSketch
& $ArduinoCli compile --verbose --config-dir $ConfigDir --jobs 4 `
  -b 'esp32:esp32:esp32s3:FlashSize=16M,PartitionScheme=esp_sr_16,PSRAM=opi,CDCOnBoot=cdc' `
  --build-property "compiler.c.extra_flags=$stcsFlags" `
  --build-property "compiler.cpp.extra_flags=$stcsFlags" `
  --build-path $stcsBuild $stcsSketch
if ($LASTEXITCODE -ne 0) { throw 'La compilación del firmware falló.' }
