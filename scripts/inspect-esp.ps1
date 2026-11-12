param([string]$Port, [ValidateRange(3,60)][int]$Seconds = 15)
$ErrorActionPreference = 'Stop'
if (-not $Port) {
  $ports = @(Get-CimInstance Win32_SerialPort)
  if ($ports.Count -ne 1) { throw 'Indica el puerto, por ejemplo: -Port COM7. No se selecciona automáticamente si hay varios.' }
  $Port = $ports[0].DeviceID
}
$serial = [System.IO.Ports.SerialPort]::new($Port,115200)
$serial.DtrEnable = $false
$serial.RtsEnable = $false
try {
  $serial.Open()
  $text = ''
  $until = [DateTime]::UtcNow.AddSeconds($Seconds)
  while ([DateTime]::UtcNow -lt $until) { $text += $serial.ReadExisting(); Start-Sleep -Milliseconds 100 }
  # Do not print raw serial data: firmware may include Wi-Fi names or personal labels.
  [pscustomobject]@{
    Port = $Port
    BytesReceived = $text.Length
    Firmware = @([regex]::Matches($text,'firmware=([a-zA-Z0-9._-]+)') | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique)
    MessageTypes = @([regex]::Matches($text,'STCS_[A-Z_]+\|') | ForEach-Object { $_.Value } | Select-Object -Unique)
    HttpCodes = @([regex]::Matches($text,'http=([0-9]{3})') | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique)
  } | ConvertTo-Json
} finally {
  if ($serial.IsOpen) { $serial.Close() }
  $serial.Dispose()
}
