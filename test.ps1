# Start server
npm run dev > output.log 2>&1
Start-Sleep -Seconds 8
echo "=== Server Log ==="
Get-Content output.log
echo ""
echo "=== Testing POST /users/6/avatar ==="
$response = Invoke-WebRequest -Method POST -Uri "http://localhost:5000/users/6/avatar" -SkipHttpErrorCheck -UseBasicParsing 2>&1
echo "Status: $($response.StatusCode)"
echo "Body: $($response.Content)"
# Kill node
Get-Process node | Stop-Process -Force
