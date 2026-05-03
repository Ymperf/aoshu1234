$ErrorActionPreference = "Stop"

$workspaceRoot = "E:\cdxproject"
$webUrl = "http://localhost:3000/"

Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object {
    Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
  }

function Wait-Http {
  param(
    [string]$Url,
    [int]$TimeoutSec = 30
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSec)
  while ((Get-Date) -lt $deadline) {
    try {
      return Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 8
    } catch {
      Start-Sleep -Seconds 1
    }
  }

  throw "Timed out waiting for $Url"
}

Start-Process -FilePath "C:\WINDOWS\System32\cmd.exe" `
  -ArgumentList "/k", "cd /d $workspaceRoot && `"C:\Program Files\nodejs\npm.cmd`" run start --workspace web -- -p 3000" `
  -WindowStyle Minimized

Wait-Http -Url $webUrl | Out-Null

Write-Output "WEB=http://localhost:3000/"
