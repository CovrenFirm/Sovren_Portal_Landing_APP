#!/bin/bash

###############################################################################
# Phase 6H Integration Tests
#
# Tests Executive Deep-Deliberation & Scenario Simulation UI
# - Deep-Deliberation page routes
# - Executive components
# - Scenario Builder UI
# - CRM/Shadow Board integration links
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

# Test 1: Deep-Deliberation components exist
test_deliberation_components_exist() {
  log_test "Deep-Deliberation components exist"
  components=(
    "/opt/sovren-portal/src/components/shadowboard/ExecutiveCard.tsx"
    "/opt/sovren-portal/src/components/shadowboard/DeliberationTimeline.tsx"
  )

  for comp in "${components[@]}"; do
    if [ ! -f "$comp" ]; then
      log_fail "Missing component: $comp"
      return 1
    fi
  done

  log_pass "All deep-deliberation components exist"
}

# Test 2: Deep-Deliberation page exists
test_deliberation_page_exists() {
  log_test "Deep-Deliberation page exists"
  page="/opt/sovren-portal/src/pages/app/shadowboard/deliberation/[entityType]/[entityId].tsx"

  if [ -f "$page" ]; then
    log_pass "Deep-Deliberation page exists"
  else
    log_fail "Deep-Deliberation page missing"
    return 1
  fi
}

# Test 3: Scenario Builder page exists
test_scenarios_page_exists() {
  log_test "Scenario Builder page exists"
  page="/opt/sovren-portal/src/pages/app/shadowboard/scenarios.tsx"

  if [ -f "$page" ]; then
    log_pass "Scenario Builder page exists"
  else
    log_fail "Scenario Builder page missing"
    return 1
  fi
}

# Test 4: Contact page has deliberation link
test_contact_deliberation_link() {
  log_test "Contact page has deliberation link"

  if grep -q "/app/shadowboard/deliberation/contact/" /opt/sovren-portal/src/pages/app/crm/contacts/\[id\].tsx; then
    log_pass "Contact page has deliberation link"
  else
    log_fail "Contact page missing deliberation link"
    return 1
  fi
}

# Test 5: Deal page has deliberation link
test_deal_deliberation_link() {
  log_test "Deal page has deliberation link"

  if grep -q "/app/shadowboard/deliberation/deal/" /opt/sovren-portal/src/pages/app/crm/deals/\[id\].tsx; then
    log_pass "Deal page has deliberation link"
  else
    log_fail "Deal page missing deliberation link"
    return 1
  fi
}

# Test 6: Shadow Board has scenario link
test_shadowboard_scenario_link() {
  log_test "Shadow Board has scenario link"

  if grep -q "/app/shadowboard/scenarios" /opt/sovren-portal/src/pages/app/shadowboard/index.tsx; then
    log_pass "Shadow Board has scenario link"
  else
    log_fail "Shadow Board missing scenario link"
    return 1
  fi
}

# Test 7: Scenario UI has disabled state check
test_scenario_backend_check() {
  log_test "Scenario UI checks backend availability"

  if grep -q "SCENARIO_BACKEND_AVAILABLE" /opt/sovren-portal/src/pages/app/shadowboard/scenarios.tsx; then
    if grep -q "disabled={!SCENARIO_BACKEND_AVAILABLE" /opt/sovren-portal/src/pages/app/shadowboard/scenarios.tsx; then
      log_pass "Scenario UI properly checks backend availability"
    else
      log_fail "Scenario UI missing proper disabled state"
      return 1
    fi
  else
    log_fail "Scenario UI missing backend availability flag"
    return 1
  fi
}

# Test 8: No mock data in deliberation code
test_no_mock_data() {
  log_test "No mock data in deliberation code"

  if grep -r "mockData\|fakeData\|TODO.*mock" /opt/sovren-portal/src/pages/app/shadowboard/deliberation/ /opt/sovren-portal/src/components/shadowboard/Executive /opt/sovren-portal/src/components/shadowboard/Deliberation 2>/dev/null | grep -v "NO mocks" | grep -v "// TODO: In production"; then
    log_fail "Found mock data in deliberation code"
    return 1
  else
    log_pass "No mock data found in deliberation implementation"
  fi
}

# Test 9: Shadow Board notes API works
test_shadowboard_notes_api() {
  log_test "Shadow Board notes API responds"
  contact_id="14ccc0af-664d-492f-a52a-21e0f4f2d946"
  response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/shadowboard/notes?entityType=contact&entityId=$contact_id")
  http_code=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | head -n -1)

  if [ "$http_code" = "200" ] || [ "$http_code" = "404" ]; then
    if echo "$body" | grep -q '"success"'; then
      log_pass "Shadow Board notes API responds (HTTP $http_code)"
    else
      log_fail "Shadow Board notes API response format incorrect"
      return 1
    fi
  else
    log_fail "Shadow Board notes API unexpected response (HTTP $http_code)"
    return 1
  fi
}

# Test 10: Shadow Board scores API works
test_shadowboard_scores_api() {
  log_test "Shadow Board scores API responds"
  contact_id="14ccc0af-664d-492f-a52a-21e0f4f2d946"
  response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/shadowboard/scores?entityType=contact&entityId=$contact_id")
  http_code=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | head -n -1)

  if [ "$http_code" = "200" ] || [ "$http_code" = "404" ]; then
    if echo "$body" | grep -q '"success"'; then
      log_pass "Shadow Board scores API responds (HTTP $http_code)"
    else
      log_fail "Shadow Board scores API response format incorrect"
      return 1
    fi
  else
    log_fail "Shadow Board scores API unexpected response (HTTP $http_code)"
    return 1
  fi
}

echo ""
echo "=========================================="
echo "  Phase 6H Integration Tests"
echo "=========================================="
echo "Base URL: $BASE_URL"
echo ""

run_test test_deliberation_components_exist || true
run_test test_deliberation_page_exists || true
run_test test_scenarios_page_exists || true
run_test test_contact_deliberation_link || true
run_test test_deal_deliberation_link || true
run_test test_shadowboard_scenario_link || true
run_test test_scenario_backend_check || true
run_test test_no_mock_data || true
run_test test_shadowboard_notes_api || true
run_test test_shadowboard_scores_api || true

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
