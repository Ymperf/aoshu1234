$ErrorActionPreference = "Stop"

$workspaceRoot = "E:\cdxproject"
$webPort = if ($env:RUNTIME_WEB_PORT) { $env:RUNTIME_WEB_PORT } else { "3002" }
$webUrl = "http://localhost:$webPort"
$webProcess = $null

Get-NetTCPConnection -LocalPort $webPort -ErrorAction SilentlyContinue |
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
      return Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 20
    } catch {
      Start-Sleep -Seconds 1
    }
  }

  throw "Timed out waiting for $Url"
}

try {
  $webProcess = Start-Process -FilePath "C:\WINDOWS\System32\WindowsPowerShell\v1.0\powershell.exe" `
    -ArgumentList "-Command", "& { Set-Location '$workspaceRoot'; & 'C:\Program Files\nodejs\npm.cmd' run start --workspace web -- -p $webPort }" `
    -PassThru

  $homeResponse = Wait-Http -Url "$webUrl/" -TimeoutSec 60
  if ($homeResponse.Content -notmatch "/grades/" -or $homeResponse.Content -notmatch "/modules/") {
    throw "Home page validation failed"
  }

  $learningCenterResponse = Wait-Http -Url "$webUrl/me" -TimeoutSec 60
  if ($learningCenterResponse.Content -notmatch "Learning Center" -and $learningCenterResponse.Content -notmatch "登录") {
    throw "Learning center page validation failed"
  }

  $knowledgePointResponse = Wait-Http -Url "$webUrl/knowledge-points/1010101" -TimeoutSec 60
  if ($knowledgePointResponse.Content -notmatch "Practice" -and $knowledgePointResponse.Content -notmatch "学习") {
    throw "Knowledge point page validation failed"
  }

  Write-Output "Runtime verification passed. WEB=$webUrl"
} finally {
  if ($webProcess -and !$webProcess.HasExited) {
    Stop-Process -Id $webProcess.Id -Force -ErrorAction SilentlyContinue
  }
}
