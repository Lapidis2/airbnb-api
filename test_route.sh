#!/bin/bash
npm run dev > output.log 2>&1 &
SERVER_PID=$!
sleep 6
echo "=== Server Log ==="
cat output.log
echo "\n=== Testing POST /users/6/avatar ==="
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' -X POST http://localhost:5000/users/6/avatar)
echo "HTTP Status: $HTTP_CODE"
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null
echo "=== Done ==="
