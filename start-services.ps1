# Start API Gateway (8080) and Reporting Service (8087) with standard I/O redirection
$gemKey = [System.Environment]::GetEnvironmentVariable("GEMINI_API_KEY","User")
$env:GEMINI_API_KEY = $gemKey

$gwJar = (Get-ChildItem "$PSScriptRoot\api-gateway\target\*.jar" | Where-Object {$_.Name -notlike "*sources*"}).Name

Write-Host "Starting Reporting Service (8087)..."
Start-Process -FilePath "java" -ArgumentList "-Xmx256m", "-jar", ".\target\reporting-service-1.0.0.jar" `
              -WorkingDirectory "$PSScriptRoot\reporting-service" `
              -RedirectStandardOutput "$PSScriptRoot\logs\rep.out" `
              -RedirectStandardError "$PSScriptRoot\logs\rep.err" `
              -WindowStyle Hidden

Write-Host "Starting API Gateway (8080)..."
Start-Process -FilePath "java" -ArgumentList "-Xmx256m", "-jar", ".\target\$gwJar" `
              -WorkingDirectory "$PSScriptRoot\api-gateway" `
              -RedirectStandardOutput "$PSScriptRoot\logs\gw.out" `
              -RedirectStandardError "$PSScriptRoot\logs\gw.err" `
              -WindowStyle Hidden
