param(
  [string]$ArduinoCli = (Join-Path $env:LOCALAPPDATA 'STCS-tools/arduino-cli/arduino-cli.exe'),
  [string]$ConfigDir = (Join-Path $env:LOCALAPPDATA 'STCS-tools/arduino-data')
)
$ErrorActionPreference = 'Stop'
$stcsRoot = Split-Path -Parent $PSScriptRoot
$stcsSketch = Join-Path $stcsRoot '.codex-work/firmware-verify/STCS_UI_Arduino'
$stcsBuild = Join-Path $env:LOCALAPPDATA 'STCS-tools/arduino-build-stcs'
if (!(Test-Path -LiteralPath $ArduinoCli)) { throw 'Instala Arduino CLI o pasa su ruta con -ArduinoCli.' }
New-Item -ItemType Directory -Force -Path $stcsSketch | Out-Null
Get-ChildItem -LiteralPath (Join-Path $stcsRoot 'firmware/STCS_UI_Arduino') -File |
  Where-Object { $_.Name -ne 'STCS_NetworkSecrets.h' } |
  Copy-Item -Destination $stcsSketch -Force
# Compile a copy with an unusable key: no production credential enters the binary.
@'
#pragma once
#define STCS_API_BASE_URL "https://0stcs0.vercel.app"
#define STCS_DEVICE_CODE "STCS-ESP32-001"
#define STCS_DEVICE_API_KEY "compile-only-not-a-real-credential"
'@ | Set-Content -LiteralPath (Join-Path $stcsSketch 'STCS_NetworkSecrets.h') -Encoding utf8
$stcsFlags = '-MMD -c -I"{0}" -DLV_CONF_INCLUDE_SIMPLE' -f $stcsSketch
& $ArduinoCli compile --config-dir $ConfigDir --jobs 4 `
  -b 'esp32:esp32:esp32s3:FlashSize=16M,PartitionScheme=esp_sr_16,PSRAM=opi,CDCOnBoot=cdc' `
  --build-property "compiler.c.extra_flags=$stcsFlags" `
  --build-property "compiler.cpp.extra_flags=$stcsFlags" `
  --build-path $stcsBuild $stcsSketch
if ($LASTEXITCODE -ne 0) { throw 'La compilación del firmware falló.' }
