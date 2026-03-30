# Test Case Report

Version: 1.0
Date: 2026-03-30
Project: Dilowa (Digital Lotse Wasser)

## 1. Scope

This report summarizes currently executed automated unit tests for backend and frontend utility modules.

## 2. Test Environment

- OS: macOS
- Runtime: Node.js (workspace default)
- Test runner: Vitest
- Backend command: npm test
- Frontend command: npm test

## 3. Executed Test Cases

### 3.1 Backend

| ID | Module | Test Case | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| BE-UT-001 | auth utils | Verification token format is 64-char hex | Regex match succeeds | Passed | PASS |
| BE-UT-002 | auth utils | Revoke token generation is unique per call | Two generated tokens differ | Passed | PASS |
| BE-UT-003 | auth utils | Token expiration supports default and custom hours | Expiration offsets are correct | Passed | PASS |
| BE-UT-004 | date utils | DD.MM.YYYY input parses correctly | Date parts and noon normalization are correct | Passed | PASS |
| BE-UT-005 | date utils | ISO input parses correctly | Date normalizes to noon | Passed | PASS |
| BE-UT-006 | date utils | Invalid input falls back to current day | Fallback date is current day at noon | Passed | PASS |
| BE-UT-007 | mapper utils | Undefined input returns undefined | Undefined returned | Passed | PASS |
| BE-UT-008 | mapper utils | Single id maps to Prisma set shape | Correct set payload returned | Passed | PASS |
| BE-UT-009 | mapper utils | Duplicate/falsy ids are cleaned | Deduplicated valid ids only | Passed | PASS |
| BE-UT-010 | mapper utils | Empty string results in empty set | Empty set returned | Passed | PASS |

Backend summary:
- Test files: 3
- Test cases: 10
- Passed: 10
- Failed: 0

### 3.2 Frontend

| ID | Module | Test Case | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| FE-UT-001 | imageUrlHelper | Empty path values return undefined | Undefined returned | Passed | PASS |
| FE-UT-002 | imageUrlHelper | Absolute/data URL values stay unchanged | Input URL returned as-is | Passed | PASS |
| FE-UT-003 | imageUrlHelper | Relative path is transformed to backend URL | URL ends with target upload path | Passed | PASS |
| FE-UT-004 | imageUrlHelper | Public image URL path construction works | URL ends with public image path | Passed | PASS |
| FE-UT-005 | taxonomyTree | Slugify normalizes labels with symbols | Expected slug generated | Passed | PASS |
| FE-UT-006 | taxonomyTree | Grouping selections by root node works | Group map and order are correct | Passed | PASS |
| FE-UT-007 | taxonomyTree | Parent key lookup returns correct node | Parent returned or null when missing | Passed | PASS |
| FE-UT-008 | taxonomyTree | Other target group selection detection works | Detection returns true for selected node | Passed | PASS |

Frontend summary:
- Test files: 2
- Test cases: 8
- Passed: 8
- Failed: 0

## 4. Overall Result

- Total test files: 5
- Total test cases: 18
- Passed: 18
- Failed: 0
- Overall status: PASS

## 5. Open Gaps

- Integration test suite is planned but not yet automated in CI.
- System/end-to-end test suite is planned but not yet automated in CI.
