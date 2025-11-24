#!/bin/bash

###############################################################################
# Phase 7 Integration Tests
#
# Tests Engine Orchestration Dashboards
# - Engine metrics API
# - Engine command view
# - Engine detail pages
# - Navigation integration
#
# NO mocks. Real metrics only.
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

# Test 1: Engine metrics API returns data
test_engine_metrics_api() {
  log_test "Engine metrics API returns engines"
  response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/engines/metrics")
  http_code=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | head -n -1)

  if [ "$http_code" = "200" ]; then
    if echo "$body" | grep -q '"success":true'; then
      if echo "$body" | grep -q '"engines"'; then
        log_pass "Engine metrics API returns valid data (HTTP 200)"
      else
        log_fail "Engine metrics API missing engines array"
        return 1
      fi
    else
      log_fail "Engine metrics API returns success:false"
      return 1
    fi
  else
    log_fail "Engine metrics API unexpected response (HTTP $http_code)"
    return 1
  fi
}

# Test 2: Engine config file exists
test_engine_config_exists() {
  log_test "Engine configuration file exists"
  if [ -f "/opt/sovren-portal/src/config/engines.ts" ]; then
    log_pass "Engine configuration file exists"
  else
    log_fail "Engine configuration file missing"
    return 1
  fi
}

# Test 3: Engine card component exists
test_engine_card_component() {
  log_test "Engine card component exists"
  if [ -f "/opt/sovren-portal/src/components/engines/EngineCard.tsx" ]; then
    log_pass "Engine card component exists"
  else
    log_fail "Engine card component missing"
    return 1
  fi
}

# Test 4: Engines index page exists
test_engines_index_page() {
  log_test "Engines index page exists"
  if [ -f "/opt/sovren-portal/src/pages/app/engines/index.tsx" ]; then
    log_pass "Engines index page exists"
  else
    log_fail "Engines index page missing"
    return 1
  fi
}

# Test 5: Engine detail page exists
test_engine_detail_page() {
  log_test "Engine detail page exists"
  if [ -f "/opt/sovren-portal/src/pages/app/engines/[engineId].tsx" ]; then
    log_pass "Engine detail page exists"
  else
    log_fail "Engine detail page missing"
    return 1
  fi
}

# Test 6: No mock data in engine code
test_no_mock_data() {
  log_test "No mock data in engine code"
  if grep -r "mockData\|fakeMetrics\|simulateEngine" /opt/sovren-portal/src/pages/app/engines/ /opt/sovren-portal/src/components/engines/ /opt/sovren-portal/src/pages/api/engines/ 2>/dev/null | grep -v "NO mocks" | grep -v "// NO"; then
    log_fail "Found mock data in engine code"
    return 1
  else
    log_pass "No mock data found in engine implementation"
  fi
}

# Test 7: Engine config defines Shadow Board
test_shadow_board_config() {
  log_test "Shadow Board engine configured"
  if grep -q "shadow_board" /opt/sovren-portal/src/config/engines.ts; then
    log_pass "Shadow Board engine configured"
  else
    log_fail "Shadow Board engine missing from config"
    return 1
  fi
}

# Test 8: Engine config defines PhD Engine
test_phd_engine_config() {
  log_test "PhD Engine configured"
  if grep -q "phd_engine" /opt/sovren-portal/src/config/engines.ts; then
    log_pass "PhD Engine configured"
  else
    log_fail "PhD Engine missing from config"
    return 1
  fi
}

echo ""
echo "=========================================="
echo "  Phase 7 Integration Tests"
echo "=========================================="
echo "Base URL: $BASE_URL"
echo ""

run_test test_engine_metrics_api || true
run_test test_engine_config_exists || true
run_test test_engine_card_component || true
run_test test_engines_index_page || true
run_test test_engine_detail_page || true
run_test test_no_mock_data || true
run_test test_shadow_board_config || true
run_test test_phd_engine_config || true

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
