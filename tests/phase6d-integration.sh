#!/bin/bash

###############################################################################
# Phase 6D Integration Tests
#
# Tests CRM ⇆ Shadow Board cross-linking features
# - /api/shadowboard/scores endpoint
# - /api/shadowboard/notes endpoint
# - UI rendering (basic smoke tests via curl)
#
# NO mocks. NO fake data. Only real backend integration.
###############################################################################

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3000}"
DEMO_TENANT_ID="00000000-0000-0000-0000-000000000099"

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
log_test() {
  echo -e "${YELLOW}[TEST]${NC} $1"
}

log_pass() {
  echo -e "${GREEN}[PASS]${NC} $1"
  ((TESTS_PASSED++))
}

log_fail() {
  echo -e "${RED}[FAIL]${NC} $1"
  ((TESTS_FAILED++))
}

run_test() {
  ((TESTS_RUN++))
  "$@"
}

# Test 1: Health check - ensure Next.js is running
test_health_check() {
  log_test "Health check - Next.js server"

  response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL")

  if [ "$response" = "200" ] || [ "$response" = "307" ] || [ "$response" = "301" ]; then
    log_pass "Next.js server is responding (HTTP $response)"
  else
    log_fail "Next.js server not responding properly (HTTP $response)"
    return 1
  fi
}

# Test 2: Scores API - Missing parameters
test_scores_api_missing_params() {
  log_test "Scores API - Missing required parameters"

  response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/shadowboard/scores")
  http_code=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | head -n -1)

  if [ "$http_code" = "400" ]; then
    if echo "$body" | grep -q '"success":false'; then
      log_pass "Scores API correctly rejects missing parameters (HTTP 400)"
    else
      log_fail "Scores API returns 400 but response format incorrect"
      return 1
    fi
  else
    log_fail "Scores API should return 400 for missing parameters (got HTTP $http_code)"
    return 1
  fi
}

# Test 3: Scores API - Invalid entity type
test_scores_api_invalid_entity() {
  log_test "Scores API - Invalid entity type"

  response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/shadowboard/scores?entityType=invalid&entityId=123")
  http_code=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | head -n -1)

  if [ "$http_code" = "400" ]; then
    if echo "$body" | grep -q '"success":false'; then
      log_pass "Scores API correctly rejects invalid entity type (HTTP 400)"
    else
      log_fail "Scores API returns 400 but response format incorrect"
      return 1
    fi
  else
    log_fail "Scores API should return 400 for invalid entity type (got HTTP $http_code)"
    return 1
  fi
}

# Test 4: Scores API - Valid contact request with real data
test_scores_api_valid_contact() {
  log_test "Scores API - Valid contact request with real data"

  # Use a real contact ID from seeded data
  contact_id="14ccc0af-664d-492f-a52a-21e0f4f2d946"

  response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/shadowboard/scores?entityType=contact&entityId=$contact_id")
  http_code=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | head -n -1)

  if [ "$http_code" = "200" ]; then
    if echo "$body" | grep -q '"success":true'; then
      if echo "$body" | grep -q '"scores"'; then
        # Validate actual score data exists
        if echo "$body" | grep -q '"cto_technical_fit":70'; then
          log_pass "Scores API returns valid contact scores with real data (HTTP 200)"
        else
          log_fail "Scores API missing expected CTO technical fit score"
          echo "Body: $body"
          return 1
        fi
      else
        log_fail "Scores API response missing 'scores' field"
        return 1
      fi
    else
      log_fail "Scores API response format incorrect"
      return 1
    fi
  else
    log_fail "Scores API unexpected response (HTTP $http_code) - expected 200 with real data"
    echo "Body: $body"
    return 1
  fi
}

# Test 5: Scores API - Valid deal request with real data
test_scores_api_valid_deal() {
  log_test "Scores API - Valid deal request with real data"

  # Use a real deal ID from seeded data
  deal_id="a960abbd-f6ec-42ab-be20-1e3352a925cd"

  response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/shadowboard/scores?entityType=deal&entityId=$deal_id")
  http_code=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | head -n -1)

  if [ "$http_code" = "200" ]; then
    if echo "$body" | grep -q '"success":true'; then
      if echo "$body" | grep -q '"scores"'; then
        log_pass "Scores API returns valid deal response (HTTP 200)"
      else
        log_fail "Scores API response missing 'scores' field"
        return 1
      fi
    else
      log_fail "Scores API response format incorrect"
      return 1
    fi
  else
    log_fail "Scores API unexpected response (HTTP $http_code) - expected 200"
    echo "Body: $body"
    return 1
  fi
}

# Test 6: Notes API - Missing parameters
test_notes_api_missing_params() {
  log_test "Notes API - Missing required parameters"

  response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/shadowboard/notes")
  http_code=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | head -n -1)

  if [ "$http_code" = "400" ]; then
    if echo "$body" | grep -q '"success":false'; then
      log_pass "Notes API correctly rejects missing parameters (HTTP 400)"
    else
      log_fail "Notes API returns 400 but response format incorrect"
      return 1
    fi
  else
    log_fail "Notes API should return 400 for missing parameters (got HTTP $http_code)"
    return 1
  fi
}

# Test 7: Notes API - Invalid entity type
test_notes_api_invalid_entity() {
  log_test "Notes API - Invalid entity type"

  response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/shadowboard/notes?entityType=invalid&entityId=123")
  http_code=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | head -n -1)

  if [ "$http_code" = "400" ]; then
    if echo "$body" | grep -q '"success":false'; then
      log_pass "Notes API correctly rejects invalid entity type (HTTP 400)"
    else
      log_fail "Notes API returns 400 but response format incorrect"
      return 1
    fi
  else
    log_fail "Notes API should return 400 for invalid entity type (got HTTP $http_code)"
    return 1
  fi
}

# Test 8: Notes API - Valid contact request with real data
test_notes_api_valid_contact() {
  log_test "Notes API - Valid contact request with real data"

  # Use a real contact ID from seeded data
  contact_id="14ccc0af-664d-492f-a52a-21e0f4f2d946"

  response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/shadowboard/notes?entityType=contact&entityId=$contact_id")
  http_code=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | head -n -1)

  if [ "$http_code" = "200" ]; then
    if echo "$body" | grep -q '"success":true'; then
      if echo "$body" | grep -q '"notes"'; then
        log_pass "Notes API returns valid contact notes (HTTP 200)"
      else
        log_fail "Notes API response missing 'notes' field"
        return 1
      fi
    else
      log_fail "Notes API response format incorrect"
      return 1
    fi
  else
    log_fail "Notes API unexpected response (HTTP $http_code) - expected 200"
    echo "Body: $body"
    return 1
  fi
}

# Test 9: Contact Detail Page - Smoke test
test_contact_page_smoke() {
  log_test "Contact Detail Page - Smoke test (unauthorized)"

  contact_id="550e8400-e29b-41d4-a716-446655440001"
  response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/app/crm/contacts/$contact_id")

  # Expect redirect to login (307) or unauthorized (401) or success (200)
  if [ "$response" = "200" ] || [ "$response" = "307" ] || [ "$response" = "302" ] || [ "$response" = "401" ]; then
    log_pass "Contact detail page route exists (HTTP $response)"
  else
    log_fail "Contact detail page unexpected response (HTTP $response)"
    return 1
  fi
}

# Test 10: Deal Detail Page - Smoke test
test_deal_page_smoke() {
  log_test "Deal Detail Page - Smoke test (unauthorized)"

  deal_id="660e8400-e29b-41d4-a716-446655440001"
  response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/app/crm/deals/$deal_id")

  # Expect redirect to login (307) or unauthorized (401) or success (200)
  if [ "$response" = "200" ] || [ "$response" = "307" ] || [ "$response" = "302" ] || [ "$response" = "401" ]; then
    log_pass "Deal detail page route exists (HTTP $response)"
  else
    log_fail "Deal detail page unexpected response (HTTP $response)"
    return 1
  fi
}

# Test 11: Crosslink utilities exist
test_crosslink_utilities() {
  log_test "Crosslink utilities module exists"

  if [ -f "/opt/sovren-portal/src/lib/crosslink.ts" ]; then
    log_pass "Crosslink utilities file exists"
  else
    log_fail "Crosslink utilities file not found"
    return 1
  fi
}

# Test 12: Shadow Board Insights component exists
test_shadowboard_component() {
  log_test "ShadowBoardInsights component exists"

  if [ -f "/opt/sovren-portal/src/components/shadowboard/ShadowBoardInsights.tsx" ]; then
    log_pass "ShadowBoardInsights component file exists"
  else
    log_fail "ShadowBoardInsights component file not found"
    return 1
  fi
}

###############################################################################
# Run all tests
###############################################################################

echo ""
echo "=========================================="
echo "  Phase 6D Integration Tests"
echo "=========================================="
echo "Base URL: $BASE_URL"
echo ""

# API Tests
run_test test_health_check || true
run_test test_scores_api_missing_params || true
run_test test_scores_api_invalid_entity || true
run_test test_scores_api_valid_contact || true
run_test test_scores_api_valid_deal || true
run_test test_notes_api_missing_params || true
run_test test_notes_api_invalid_entity || true
run_test test_notes_api_valid_contact || true

# UI Smoke Tests
run_test test_contact_page_smoke || true
run_test test_deal_page_smoke || true

# File Existence Tests
run_test test_crosslink_utilities || true
run_test test_shadowboard_component || true

###############################################################################
# Summary
###############################################################################

echo ""
echo "=========================================="
echo "  Test Summary"
echo "=========================================="
echo "Total Tests:   $TESTS_RUN"
echo -e "${GREEN}Passed:        $TESTS_PASSED${NC}"
echo -e "${RED}Failed:        $TESTS_FAILED${NC}"
echo "=========================================="
echo ""

# Exit with failure if any tests failed
if [ "$TESTS_FAILED" -gt 0 ]; then
  exit 1
else
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
fi
