#!/bin/bash
# test-auth.sh
# Tests the authentication flow for Karma Training Website
# Requires: curl, jq (optional for JSON parsing)
# Usage: Run with `npm run dev` active to test http://localhost:3000

# Exit on any error
set -e

# Check for curl
if ! command -v curl >/dev/null 2>&1; then
  echo "Error: curl is required but not installed. Install with: brew install curl (macOS) or sudo apt install curl (Linux)"
  exit 1
fi

# Check for jq (optional, fallback to grep/awk)
JQ_AVAILABLE=0
if command -v jq >/dev/null 2>&1; then
  JQ_AVAILABLE=1
  echo "jq found; using for JSON parsing"
else
  echo "jq not found; falling back to grep/awk for JSON parsing"
fi

# Step 1: Log in and capture admin_token
echo "=== Testing Admin Login ==="
ADMIN_LOGIN_RESPONSE=$(curl -s -i -X POST -H "Content-Type: application/json" -d '{"username": "admin", "password": "Admin@123456"}' http://localhost:3000/api/adm_f7f8556683f1cdc65391d8d2_8e91/login 2>/dev/null)
if [[ $? -ne 0 ]]; then
  echo "Error: Login request failed. Ensure the server is running (npm run dev) and the URL is correct."
  exit 1
fi

# Extract admin_token from cookies or response body
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN_RESPONSE" | grep -oP '(?<=admin_token=)[^;]+' || echo "$ADMIN_LOGIN_RESPONSE" | grep -oP '(?<="token":")[^"]+' || echo "")
if [[ -z "$ADMIN_TOKEN" ]]; then
  echo "Error: Failed to extract admin_token. Check login response below:"
  echo "$ADMIN_LOGIN_RESPONSE"
  exit 1
fi
echo "Admin Token: $ADMIN_TOKEN"

# Step 2: Request CSRF token
echo "=== Requesting CSRF Token ==="
CSRF_RESPONSE=$(curl -s -b "admin_token=$ADMIN_TOKEN" http://localhost:3000/api/adm_f7f8556683f1cdc65391d8d2_8e91/csrf-token 2>/dev/null)
if [[ $? -ne 0 ]]; then
  echo "Error: CSRF token request failed. Ensure the server is running and admin_token is valid."
  exit 1
fi

# Extract CSRF_TOKEN with jq (if available) or grep/awk
if [[ $JQ_AVAILABLE -eq 1 ]]; then
  CSRF_TOKEN=$(echo "$CSRF_RESPONSE" | jq -r '.csrfToken' 2>/dev/null || echo "")
else
  CSRF_TOKEN=$(echo "$CSRF_RESPONSE" | grep -oP '(?<="csrfToken":")[^"]+' || echo "")
fi
if [[ -z "$CSRF_TOKEN" ]]; then
  echo "Error: Failed to extract CSRF_TOKEN. Check CSRF response below:"
  echo "$CSRF_RESPONSE"
  exit 1
fi
echo "CSRF Token: $CSRF_TOKEN"

# Step 3: Test logout with CSRF token
echo "=== Testing Logout with CSRF Token ==="
LOGOUT_RESPONSE=$(curl -i -X POST -H "Content-Type: application/json" -H "X-CSRF-Token: $CSRF_TOKEN" -d "{}" -b "admin_token=$ADMIN_TOKEN" http://localhost:3000/api/adm_f7f8556683f1cdc65391d8d2_8e91/logout 2>/dev/null)
if [[ $? -ne 0 ]]; then
  echo "Error: Logout request failed. Ensure CSRF_TOKEN and admin_token are valid."
  echo "Logout Response:"
  echo "$LOGOUT_RESPONSE"
  exit 1
fi
echo "Logout Response:"
echo "$LOGOUT_RESPONSE"

echo "=== Authentication Test Complete ==="