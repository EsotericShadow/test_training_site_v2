#!/bin/bash

# Create a temporary file for cookies
COOKIE_JAR=$(mktemp)

echo "--- Testing Admin Login ---"
LOGIN_RESPONSE=$(curl -s -i -X POST -H "Content-Type: application/json" -d '{"username": "admin", "password": "Admin@123456"}' http://localhost:3000/api/adm_f7f8556683f1cdc65391d8d2_8e91/login -c "$COOKIE_JAR")

# Extract admin_token from the Set-Cookie header
ADMIN_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o 'admin_token=[^;]*' | head -n 1 | awk -F'=' '{print $2}')

if [ -z "$ADMIN_TOKEN" ]; then
  echo "Error: Failed to extract admin_token."
  echo "Login Response:"
  echo "$LOGIN_RESPONSE"
  rm "$COOKIE_JAR"
  exit 1
fi
echo "Admin Token: $ADMIN_TOKEN"

echo "--- Requesting CSRF Token ---"
CSRF_RESPONSE=$(curl -s -b "$COOKIE_JAR" http://localhost:3000/api/adm_f7f8556683f1cdc65391d8d2_8e91/csrf-token)

# Extract CSRF_TOKEN using jq (if available) or grep/awk fallback
CSRF_TOKEN=$(echo "$CSRF_RESPONSE" | jq -r '.csrfToken' 2>/dev/null)
if [ -z "$CSRF_TOKEN" ]; then
  CSRF_TOKEN=$(echo "$CSRF_RESPONSE" | grep -o '"csrfToken":"[^"]*"' | awk -F'"' '{print $4}')
fi

if [ -z "$CSRF_TOKEN" ]; then
  echo "Error: Failed to extract CSRF token."
  echo "CSRF Response:"
  echo "$CSRF_RESPONSE"
  rm "$COOKIE_JAR"
  exit 1
fi
echo "CSRF Token: $CSRF_TOKEN"

echo "--- Testing Logout WITHOUT CSRF Token (Expected: 403 Forbidden) ---"
curl -i -X POST -H "Content-Type: application/json" -d "{}" -b "$COOKIE_JAR" http://localhost:3000/api/adm_f7f8556683f1cdc65391d8d2_8e91/logout

echo "--- Testing Logout WITH CSRF Token (Expected: 200 OK) ---"
curl -i -X POST -H "Content-Type: application/json" -H "X-CSRF-Token: $CSRF_TOKEN" -d "{}" -b "$COOKIE_JAR" http://localhost:3000/api/adm_f7f8556683f1cdc65391d8d2_8e91/logout

# Clean up the temporary cookie file
rm "$COOKIE_JAR"

echo "--- Test Sequence Complete ---"
