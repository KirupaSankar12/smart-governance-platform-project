$pids = (Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique)
foreach ($p in $pids) {
    if ($p -and $p -ne 0) {
        Write-Host "Killing process $p on port 8080"
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
    }
}

Start-Sleep -Seconds 2

$gwJar = (Get-ChildItem "$PSScriptRoot\api-gateway\target\*.jar" | Where-Object {$_.Name -notlike "*sources*"}).Name

Write-Host "Starting API Gateway... Jar: $gwJar"
Start-Process -FilePath "java" -ArgumentList "-Xmx256m", "-jar", ".\api-gateway\target\$gwJar" `
              -WorkingDirectory "$PSScriptRoot" `
              -RedirectStandardOutput "$PSScriptRoot\logs\gw.out" `
              -RedirectStandardError "$PSScriptRoot\logs\gw.err" `
              -WindowStyle Hidden

Write-Host "API Gateway process launched."
