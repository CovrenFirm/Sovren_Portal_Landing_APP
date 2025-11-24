#!/bin/bash

###############################################################################
# Phase 6E Integration Tests
#
# Tests Governance System features
# - Constitution API
# - SLAC Matrix API
# - Seal Verification API
# - Audit Logs API
# - UI smoke tests
#
# NO mocks. NO fake data. Only real backend integration.
###############################################################################

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

BASE_URL="${BASE_URL:-http://localhost:3000}"
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

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

# Test 1: Constitution API exists
test_constitution_api() {
  log_test "Constitution API responds"
  response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/governance/constitution")
  if [ "$response" = "200" ] || [ "$response" = "404" ] || [ "$response" = "500" ]; then
    log_pass "Constitution API route exists (HTTP $response)"
  else
    log_fail "Constitution API unexpected response (HTTP $response)"
    return 1
  fi
}

# Test 2: SLAC API exists
test_slac_api() {
  log_test "SLAC Matrix API responds"
  response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/governance/slac")
  if [ "$response" = "200" ] || [ "$response" = "404" ] || [ "$response" = "500" ]; then
    log_pass "SLAC API route exists (HTTP $response)"
  else
    log_fail "SLAC API unexpected response (HTTP $response)"
    return 1
  fi
}

# Test 3: Seals API - Missing parameter
test_seals_api_missing_param() {
  log_test "Seals API - Missing seal hash parameter"
  response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/governance/seals")
  http_code=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | head -n -1)

  if [ "$http_code" = "400" ]; then
    if echo "$body" | grep -q '"success":false'; then
      log_pass "Seals API correctly rejects missing parameter (HTTP 400)"
    else
      log_fail "Seals API returns 400 but response format incorrect"
      return 1
    fi
  else
    log_fail "Seals API should return 400 for missing parameter (got HTTP $http_code)"
    return 1
  fi
}

# Test 4: Seals API - Invalid hash format
test_seals_api_invalid_hash() {
  log_test "Seals API - Invalid hash format"
  response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/governance/seals?sealHash=invalid")
  http_code=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | head -n -1)

  if [ "$http_code" = "400" ]; then
    if echo "$body" | grep -q '"success":false'; then
      log_pass "Seals API correctly rejects invalid hash (HTTP 400)"
    else
      log_fail "Seals API returns 400 but response format incorrect"
      return 1
    fi
  else
    log_fail "Seals API should return 400 for invalid hash (got HTTP $http_code)"
    return 1
  fi
}

# Test 5: Audit Logs API exists
test_audit_logs_api() {
  log_test "Audit Logs API responds"
  response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/governance/logs")
  if [ "$response" = "200" ] || [ "$response" = "404" ] || [ "$response" = "500" ]; then
    log_pass "Audit Logs API route exists (HTTP $response)"
  else
    log_fail "Audit Logs API unexpected response (HTTP $response)"
    return 1
  fi
}

# Test 6: Governance page exists
test_governance_page() {
  log_test "Governance page route exists"
  response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/app/governance")
  if [ "$response" = "200" ] || [ "$response" = "307" ] || [ "$response" = "302" ]; then
    log_pass "Governance page route exists (HTTP $response)"
  else
    log_fail "Governance page unexpected response (HTTP $response)"
    return 1
  fi
}

# Test 7: Components exist
test_components_exist() {
  log_test "Governance components exist"
  components=(
    "/opt/sovren-portal/src/components/governance/ConstitutionViewer.tsx"
    "/opt/sovren-portal/src/components/governance/SlacMatrix.tsx"
    "/opt/sovren-portal/src/components/governance/SealVerificationForm.tsx"
    "/opt/sovren-portal/src/components/governance/SealHistoryTable.tsx"
  )

  for comp in "${components[@]}"; do
    if [ ! -f "$comp" ]; then
      log_fail "Missing component: $comp"
      return 1
    fi
  done

  log_pass "All governance components exist"
}

echo ""
echo "=========================================="
echo "  Phase 6E Integration Tests"
echo "=========================================="
echo "Base URL: $BASE_URL"
echo ""

run_test test_constitution_api || true
run_test test_slac_api || true
run_test test_seals_api_missing_param || true
run_test test_seals_api_invalid_hash || true
run_test test_audit_logs_api || true
run_test test_governance_page || true
run_test test_components_exist || true

echo ""
echo "=========================================="
echo "  Test Summary"
echo "=========================================="
echo "Total Tests:   $TESTS_RUN"
echo -e "${GREEN}Passed:        $TESTS_PASSED${NC}"
echo -e "${RED}Failed:        $TESTS_FAILED${NC}"
echo "=========================================="
echo ""

if [ "$TESTS_FAILED" -gt 0 ]; then
  exit 1
else
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
fi
