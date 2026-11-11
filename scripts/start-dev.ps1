$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$npmCommand = Get-Command npm.cmd -ErrorAction SilentlyContinue
$portableNpm = Join-Path $env:LOCALAPPDATA 'STCS-tools/npm/package/bin/npm-cli.js'
Push-Location (Join-Path $projectRoot 'frontend')
try {
    if ($npmCommand) {
        & $npmCommand.Source run dev
    } elseif (Test-Path -LiteralPath $portableNpm) {
        & node $portableNpm run dev
    } else {
        throw 'No se encontro npm. Instala Node.js con npm antes de iniciar STCS.'
    }
} finally {
    Pop-Location
}
