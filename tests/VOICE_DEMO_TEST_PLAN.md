# Voice Demo System - Comprehensive End-to-End Test Plan

**Agent 5: Voice Demo Testing Specialist**
**Date:** 2025-11-24
**System:** Sovren AI Voice Demo Platform
**Target:** Production Readiness Verification

---

## Executive Summary

This document provides a comprehensive end-to-end test plan for the Sovren AI Voice Demo system. The testing validates backend connectivity, all 7 personas, request validation, response schemas, error handling, timeouts, and audio URL accessibility.

**Test Status:** [To be completed]
**Persona Coverage:** 7/7 (CEO, CFO, CTO, COO, CRO, CMO, Board)
**API Endpoints Tested:** 2 (Direct Backend + Next.js API)

---

## System Architecture

### Components Under Test

1. **Backend Voice Service**: `http://10.15.38.1:8500/demo`
   - Location: VPN-accessible service (WireGuard tunnel)
   - Responsibility: Generate persona responses + audio synthesis
   - Response Fields: `replyText`, `replyAudioUrl`

2. **Next.js API Route**: `/api/voice-demo`
   - Location: Main application
   - File: `/opt/sovren-portal/src/pages/api/voice-demo.ts`
   - Responsibility: Validation, forwarding, response normalization
   - Timeout: 30 seconds (AbortSignal.timeout)

3. **Frontend Component**: `VoiceConsole`
   - Location: `/opt/sovren-portal/src/components/voice/VoiceConsole.tsx`
   - Responsibility: UI, voice recognition, audio playback
   - NOT tested directly (requires browser environment)

---

## Test Coverage Matrix

### 1. Backend Connectivity Tests

| Test ID | Description | Method | Expected Result | Priority |
|---------|-------------|--------|-----------------|----------|
| BACKEND-001 | Backend service reachable | curl | HTTP 200/connection | CRITICAL |
| BACKEND-002 | API route reachable | curl | HTTP 200 | CRITICAL |
| BACKEND-003 | Response contains JSON | curl | Valid JSON | CRITICAL |

### 2. Persona Testing (7 Personas)

| Persona | Test | Expected Response | Status |
|---------|------|-------------------|--------|
| CEO | Strategic vision question | Text + Audio | [PENDING] |
| CFO | Financial analysis question | Text + Audio | [PENDING] |
| CTO | Technology strategy question | Text + Audio | [PENDING] |
| COO | Operations question | Text + Audio | [PENDING] |
| CRO | Sales strategy question | Text + Audio | [PENDING] |
| CMO | Marketing strategy question | Text + Audio | [PENDING] |
| Board | Governance question | Text + Audio | [PENDING] |

### 3. Request Validation Tests

| Test ID | Scenario | Input | Expected HTTP | Expected Error Message |
|---------|----------|-------|----------------|------------------------|
| VALID-001 | All required fields | persona + text | 200 | N/A (success) |
| VALID-002 | Missing persona | text only | 400 | "Persona and text are required" |
| VALID-003 | Missing text | persona only | 400 | "Persona and text are required" |
| VALID-004 | Invalid persona | invalid_persona | 400 | "Invalid persona. Must be one of: ..." |
| VALID-005 | Text exceeds 500 chars | 550 char string | 400 | "Text message too long (max 500 characters)" |
| VALID-006 | GET method (invalid) | GET request | 405 | "Method not allowed" |

**Constraints Validated:**
- Persona: Must be one of 7 allowed values
- Text: Required, max 500 characters
- HTTP Method: POST only

### 4. Response Validation Tests

#### Success Response (HTTP 200)
```json
{
  "success": true,
  "data": {
    "replyText": "string (reply from persona)",
    "replyAudioUrl": "string (URL to audio file)",
    "persona": "string (echo of input persona)",
    "timestamp": "ISO8601 datetime string"
  }
}
```

#### Error Response (HTTP 4xx/5xx)
```json
{
  "success": false,
  "error": "string (user-friendly error message)"
}
```

**Validation Checks:**
- [ ] Success responses include: success, data, replyText, replyAudioUrl, persona, timestamp
- [ ] replyText is non-empty string
- [ ] replyAudioUrl is non-empty string (valid URL format)
- [ ] timestamp is ISO8601 format
- [ ] persona matches input
- [ ] Error responses have success=false and error message
- [ ] Error messages are user-friendly (not stack traces)

### 5. Error Handling Tests

| HTTP Code | Scenario | Expected Message | Test |
|-----------|----------|------------------|------|
| 400 | Bad Request (validation) | Specific validation error | VALID-002 through VALID-005 |
| 405 | Method Not Allowed | "Method not allowed" | VALID-006 |
| 502 | Backend returned invalid data | "Voice service returned invalid response" | See code line 93-104 |
| 503 | Connection error | "Unable to connect to voice service" | See code line 124-128 |
| 500 | Unexpected error | "Internal server error" | Catch-all handler |

**Error Handling Validation:**
- [ ] No stack traces returned to client
- [ ] All errors include HTTP status code
- [ ] Error messages explain the issue
- [ ] Connection errors handled gracefully
- [ ] Backend errors (5xx) returned with appropriate status

### 6. Timeout Handling

| Scenario | Limit | Implementation | Test Method |
|----------|-------|-----------------|-------------|
| Normal request | 30s | AbortSignal.timeout(30000) | Measure response time |
| Hanging backend | > 30s | Auto-abort | Monitor for 503 response |

**Test Approach:**
- Verify 30-second timeout configured in code
- Normal requests should complete in <5 seconds
- Timeout should trigger 503 response with "Unable to connect" message

### 7. Audio URL Accessibility

| Test ID | Check | Expected | Notes |
|---------|-------|----------|-------|
| AUDIO-001 | URL format | Valid HTTP/HTTPS/S3 URI | Pattern match |
| AUDIO-002 | URL non-empty | Not blank/null | String length > 0 |
| AUDIO-003 | URL accessibility | Reachable from client | Optional (network dependent) |
| AUDIO-004 | CORS headers | Allows client access | Check response headers |

---

## Test Execution Plan

### Prerequisites
1. Backend service running at `http://10.15.38.1:8500`
2. Next.js app running at `http://localhost:3000`
3. WireGuard tunnel established (for backend access)
4. Network connectivity verified

### Test Execution Order

#### Phase 1: Connectivity (5 min)
- Backend service reachability
- API route reachability
- Basic JSON response validation

#### Phase 2: Direct Backend Testing (10 min)
- Valid request with CEO
- Response schema validation
- All 7 personas

#### Phase 3: API Request Validation (10 min)
- Missing field validation
- Invalid persona detection
- Text length validation
- HTTP method validation

#### Phase 4: API Persona Testing (10 min)
- All 7 personas via API route
- Response consistency
- Audio URL presence

#### Phase 5: Response Schema (5 min)
- Complete schema validation
- Field presence checks
- Data type validation

#### Phase 6: Error Handling (5 min)
- Error message formatting
- User-friendly messages
- Error response structure

#### Phase 7: Audio Testing (5 min)
- Audio URL format validation
- URL accessibility
- Accessibility from frontend

#### Phase 8: Performance (5 min)
- Timeout enforcement
- Connection error handling
- Response time measurements

#### Phase 9: Production Readiness (5 min)
- All critical tests passed
- No errors or warnings
- System ready for production

**Total Estimated Time:** 60 minutes

---

## Test Script Usage

### Run All Tests
```bash
./tests/voice-demo-e2e.sh
```

### Expected Output
- Colored output showing pass/fail for each test
- Summary statistics at end
- Log file saved to `tests/voice-demo-results.txt`

### Test Output Format
```
TEST 1: Test Name
  PASSED: Description

TEST 2: Test Name
  FAILED: Description

...

================================================================================
TEST SUMMARY
================================================================================
Total Tests Run: 45
Tests Passed: 45
Tests Failed: 0

ALL TESTS PASSED - SYSTEM IS PRODUCTION READY
```

---

## Manual Testing Guide

### Test 1: Direct Backend Request

```bash
# Valid request to backend
curl -X POST "http://10.15.38.1:8500/demo" \
  -H "Content-Type: application/json" \
  -d '{"persona":"CEO","text":"What should we focus on next quarter?"}'

# Expected response:
# {
#   "replyText": "...",
#   "replyAudioUrl": "...",
#   "persona": "CEO",
#   "timestamp": "2025-11-24T12:00:00Z"
# }
```

### Test 2: Via API Route with CEO

```bash
curl -X POST "http://localhost:3000/api/voice-demo" \
  -H "Content-Type: application/json" \
  -d '{"persona":"CEO","text":"What should we focus on next quarter?"}'

# Expected response:
# {
#   "success": true,
#   "data": {
#     "replyText": "...",
#     "replyAudioUrl": "...",
#     "persona": "CEO",
#     "timestamp": "2025-11-24T12:00:00Z"
#   }
# }
```

### Test 3: Missing Field Validation

```bash
# Missing persona field
curl -X POST "http://localhost:3000/api/voice-demo" \
  -H "Content-Type: application/json" \
  -d '{"text":"What should we focus on next quarter?"}'

# Expected response (400):
# {
#   "success": false,
#   "error": "Persona and text are required"
# }
```

### Test 4: Invalid Persona

```bash
curl -X POST "http://localhost:3000/api/voice-demo" \
  -H "Content-Type: application/json" \
  -d '{"persona":"INVALID","text":"What should we focus on next quarter?"}'

# Expected response (400):
# {
#   "success": false,
#   "error": "Invalid persona. Must be one of: CEO, CFO, CRO, COO, CMO, Board"
# }
```

### Test 5: Text Length Validation

```bash
# Text with 550 characters (exceeds 500 limit)
curl -X POST "http://localhost:3000/api/voice-demo" \
  -H "Content-Type: application/json" \
  -d '{"persona":"CEO","text":"'$(printf 'a%.0s' {1..550})'"}'

# Expected response (400):
# {
#   "success": false,
#   "error": "Text message too long (max 500 characters)"
# }
```

### Test 6: All Personas

```bash
for persona in CEO CFO CRO COO CMO Board; do
  echo "Testing $persona..."
  curl -X POST "http://localhost:3000/api/voice-demo" \
    -H "Content-Type: application/json" \
    -d "{\"persona\":\"$persona\",\"text\":\"What should we focus on next quarter?\"}" \
    | jq '.success'
done
```

### Test 7: Test CTO Persona (Not in Backend)

```bash
# Note: Code shows valid personas are only 6, but UI includes CTO
curl -X POST "http://localhost:3000/api/voice-demo" \
  -H "Content-Type: application/json" \
  -d '{"persona":"CTO","text":"What should we focus on next quarter?"}'

# Expected: 400 error - Invalid persona
```

### Test 8: HTTP Method Validation

```bash
# GET method (not allowed)
curl -X GET "http://localhost:3000/api/voice-demo" \
  -H "Content-Type: application/json"

# Expected response (405):
# {
#   "success": false,
#   "error": "Method not allowed"
# }
```

### Test 9: Audio URL in Response

```bash
curl -X POST "http://localhost:3000/api/voice-demo" \
  -H "Content-Type: application/json" \
  -d '{"persona":"CEO","text":"Test"}' \
  | jq '.data.replyAudioUrl'

# Expected: Non-empty URL string (http://, https://, or s3://)
```

---

## Known Issues & Notes

### Issue 1: CTO Persona Mismatch
- **Location:** `/opt/sovren-portal/src/components/voice/VoiceConsole.tsx` line 33
- **Issue:** VoiceConsole includes 'CTO' in personas list
- **Backend:** `/opt/sovren-portal/src/pages/api/voice-demo.ts` line 47 lists only 6 valid personas
- **Impact:** CTO persona will return 400 error
- **Status:** [ACTION REQUIRED] - Validate with product team which personas should be supported
- **Fix Options:**
  1. Remove CTO from VoiceConsole.tsx line 33
  2. Add CTO to validPersonas array in voice-demo.ts line 47
  3. Update backend to support CTO persona

### Issue 2: Backend Field Naming
- **Location:** `/opt/sovren-portal/src/pages/api/voice-demo.ts` lines 87-88
- **Issue:** Code handles multiple response field name variations
- **Variations Handled:**
  - `replyText` or `reply_text`
  - `replyAudioUrl` or `reply_audio_url` or `audioUrl` or `audio_url`
- **Status:** Suggests backend and frontend may have field naming inconsistencies
- **Recommendation:** Standardize on camelCase (`replyText`, `replyAudioUrl`)

### Issue 3: Audio Response Required
- **Critical Requirement:** Both text AND audio must be present
- **Location:** Code lines 91-105
- **Behavior:**
  - Missing reply text → 502 error
  - Missing audio URL → 502 error
- **Design Decision:** Enforces that voice demo always returns audio (not optional)

---

## Success Criteria

### Minimum Requirements (MVP)
- [ ] All 6 base personas returning valid responses
- [ ] Request validation working (missing fields, invalid persona, text length)
- [ ] Response schema correct (all required fields present)
- [ ] Error handling returning appropriate HTTP codes
- [ ] Timeout enforcement at 30 seconds
- [ ] Audio URLs present in all responses

### Production Readiness
- [ ] All tests passing (100% pass rate)
- [ ] No error messages expose implementation details
- [ ] Backend connectivity verified
- [ ] All response schemas validated
- [ ] Timeout behavior verified
- [ ] Audio URLs accessible
- [ ] CTO persona issue resolved

---

## Post-Test Actions

### If All Tests Pass
1. System is production-ready
2. Schedule deployment
3. Document test results for audit trail
4. Update monitoring dashboards

### If Tests Fail
1. Identify failing test(s)
2. Review implementation vs. requirements
3. Fix root cause
4. Re-run failing tests
5. Full regression test before deployment

---

## Implementation Details

### Test Framework
- **Tool:** curl (command-line HTTP client)
- **Language:** Bash script
- **Output:** Colored console + log file
- **Assertions:** String matching on response content

### Endpoints Tested
1. Backend: `http://10.15.38.1:8500/demo` (POST)
2. API: `http://localhost:3000/api/voice-demo` (POST)

### Test Data
- Standard message: "What should we focus on next quarter?" (50 chars)
- Long message: 550 character string (exceeds 500 limit)
- Invalid persona: "INVALID_PERSONA"
- Timeout: 30 seconds (matches implementation)

---

## Appendix: API Reference

### Request Format
```
POST /api/voice-demo
Content-Type: application/json

{
  "persona": "CEO|CFO|CRO|COO|CMO|Board",
  "text": "string (max 500 characters)"
}
```

### Response Format (Success - HTTP 200)
```json
{
  "success": true,
  "data": {
    "replyText": "string",
    "replyAudioUrl": "string (URL)",
    "persona": "string",
    "timestamp": "string (ISO8601)"
  }
}
```

### Response Format (Error)
```json
{
  "success": false,
  "error": "string (user-friendly message)"
}
```

### HTTP Status Codes
- **200 OK:** Request successful, response generated
- **400 Bad Request:** Validation error (missing field, invalid persona, text too long)
- **405 Method Not Allowed:** HTTP method not POST
- **502 Bad Gateway:** Backend returned invalid response
- **503 Service Unavailable:** Cannot connect to backend
- **500 Internal Server Error:** Unexpected error

### Error Codes & Messages
| HTTP | Message | Cause |
|------|---------|-------|
| 400 | "Persona and text are required" | Missing field |
| 400 | "Invalid persona. Must be one of: ..." | Wrong persona value |
| 400 | "Text message too long (max 500 characters)" | Text > 500 chars |
| 405 | "Method not allowed" | Non-POST request |
| 502 | "Voice service returned invalid response (no reply text)" | Backend missing text |
| 502 | "Voice service did not return audio. Audio responses are required." | Backend missing audio |
| 503 | "Unable to connect to voice service" | Connection timeout/error |
| 500 | "Internal server error" | Unexpected exception |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-24 | Agent 5 | Initial test plan and script |

---

## Approval Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| QA Lead | [Pending] | [Pending] | [Pending] |
| Tech Lead | [Pending] | [Pending] | [Pending] |
| Product Manager | [Pending] | [Pending] | [Pending] |
