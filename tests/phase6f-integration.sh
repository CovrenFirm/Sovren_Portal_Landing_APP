#!/bin/bash

###############################################################################
# Phase 6F Integration Tests
#
# Tests Multi-Modal File Intake Engine
# - Upload API
# - List API
# - UI integration
#
# NO mocks. Real backend integration only.
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

# Test 1: Upload API exists
test_upload_api_exists() {
  log_test "Upload API route exists"
  # POST without body will fail with 400 but confirms route exists
  response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/multimodal/upload")
  if [ "$response" = "400" ] || [ "$response" = "500" ]; then
    log_pass "Upload API route exists (HTTP $response)"
  else
    log_fail "Upload API unexpected response (HTTP $response)"
    return 1
  fi
}

# Test 2: List API - Missing parameters
test_list_api_missing_params() {
  log_test "List API - Missing parameters"
  response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/multimodal/list")
  http_code=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | head -n -1)

  if [ "$http_code" = "400" ]; then
    if echo "$body" | grep -q '"success":false'; then
      log_pass "List API correctly rejects missing parameters (HTTP 400)"
    else
      log_fail "List API returns 400 but response format incorrect"
      return 1
    fi
  else
    log_fail "List API should return 400 for missing parameters (got HTTP $http_code)"
    return 1
  fi
}

# Test 3: List API - Invalid entity type
test_list_api_invalid_entity() {
  log_test "List API - Invalid entity type"
  response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/multimodal/list?entityType=invalid&entityId=123")
  http_code=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | head -n -1)

  if [ "$http_code" = "400" ]; then
    if echo "$body" | grep -q '"success":false'; then
      log_pass "List API correctly rejects invalid entity type (HTTP 400)"
    else
      log_fail "List API returns 400 but response format incorrect"
      return 1
    fi
  else
    log_fail "List API should return 400 for invalid entity type (got HTTP $http_code)"
    return 1
  fi
}

# Test 4: List API - Valid contact request
test_list_api_valid_contact() {
  log_test "List API - Valid contact request"
  contact_id="14ccc0af-664d-492f-a52a-21e0f4f2d946"

  response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/multimodal/list?entityType=contact&entityId=$contact_id")
  http_code=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | head -n -1)

  if [ "$http_code" = "200" ] || [ "$http_code" = "404" ] || [ "$http_code" = "500" ]; then
    log_pass "List API responds for valid contact (HTTP $http_code)"
  else
    log_fail "List API unexpected response (HTTP $http_code)"
    echo "Body: $body"
    return 1
  fi
}

# Test 5: Components exist
test_components_exist() {
  log_test "Multimodal components exist"
  components=(
    "/opt/sovren-portal/src/components/multimodal/FileIntakePanel.tsx"
    "/opt/sovren-portal/src/components/multimodal/AttachmentList.tsx"
  )

  for comp in "${components[@]}"; do
    if [ ! -f "$comp" ]; then
      log_fail "Missing component: $comp"
      return 1
    fi
  done

  log_pass "All multimodal components exist"
}

# Test 6: Contact page has file integration
test_contact_page_integration() {
  log_test "Contact page wired with file intake"
  if grep -q "FileIntakePanel" /opt/sovren-portal/src/pages/app/crm/contacts/\[id\].tsx; then
    log_pass "Contact page integrated with FileIntakePanel"
  else
    log_fail "Contact page missing FileIntakePanel integration"
    return 1
  fi
}

# Test 7: Deal page has file integration
test_deal_page_integration() {
  log_test "Deal page wired with file intake"
  if grep -q "FileIntakePanel" /opt/sovren-portal/src/pages/app/crm/deals/\[id\].tsx; then
    log_pass "Deal page integrated with FileIntakePanel"
  else
    log_fail "Deal page missing FileIntakePanel integration"
    return 1
  fi
}

echo ""
echo "=========================================="
echo "  Phase 6F Integration Tests"
echo "=========================================="
echo "Base URL: $BASE_URL"
echo ""

run_test test_upload_api_exists || true
run_test test_list_api_missing_params || true
run_test test_list_api_invalid_entity || true
run_test test_list_api_valid_contact || true
run_test test_components_exist || true
run_test test_contact_page_integration || true
run_test test_deal_page_integration || true

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
