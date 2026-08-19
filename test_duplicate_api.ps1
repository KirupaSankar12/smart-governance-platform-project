$body = @{
    title = "Water pipe leaking near Main Street"
    description = "A damaged water pipeline is continuously leaking onto the road near Main Street."
    department = "Water Department"
    category = "Water Leakage"
    location = "Main Street"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8083/api/complaints/check-duplicate" -Method Post -Body $body -ContentType "application/json"
$response | ConvertTo-Json -Depth 5
