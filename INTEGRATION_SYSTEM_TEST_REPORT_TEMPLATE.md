# Integration And System Test Report Template

Version: 1.0
Project: Dilowa (Digital Lotse Wasser)

## 1. Execution Metadata

- Date:
- Environment: local / staging / production-candidate
- Build/Commit:
- Tester:
- Test data set:

## 2. Integration Test Matrix

| ID | Integration Path | Preconditions | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| INT-001 | Frontend login -> Backend auth | User exists | Submit valid credentials | Access token/session established |  |  |
| INT-002 | Frontend catalog filter -> Backend search -> DB | Solutions seeded | Apply taxonomy filter | Filtered result set returned |  |  |
| INT-003 | Helpdesk widget -> Helpdesk API -> LISA -> DB | LISA reachable, data seeded | Submit query | DB-backed suggestions returned |  |  |
| INT-004 | Admin content update -> Backend policy endpoint -> DB | Admin role | Save policy content | Updated content is persisted and retrievable |  |  |
| INT-005 | File upload flow -> Backend media endpoint -> filesystem/public path | Authenticated user | Upload valid file | File metadata and retrieval path are valid |  |  |

## 3. System Test Matrix

| ID | End-to-End Scenario | Preconditions | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| SYS-001 | User discovers a solution from home to detail | Public access available | Home -> catalog -> detail | Correct detail page with metadata opens |  |  |
| SYS-002 | Authenticated user updates profile | User account active | Login -> profile edit -> save | Profile updates persist and reload correctly |  |  |
| SYS-003 | Admin manages organization | Admin account active | Login -> org list -> edit -> save | Updated organization data appears in list/detail |  |  |
| SYS-004 | Helpdesk recommendation flow | LISA reachable | Open widget -> ask question -> open suggestion | Suggestion links open matching solution |  |  |
| SYS-005 | Unauthorized access control | Non-admin user | Access admin route/resource | Access denied with correct UX/API handling |  |  |

## 4. Defects And Observations

| ID | Severity | Area | Description | Reproduction | Owner | Status |
|---|---|---|---|---|---|---|
| DEF-001 |  |  |  |  |  |  |

## 5. Summary

- Integration test pass rate:
- System test pass rate:
- Critical defects open:
- Go/No-Go recommendation:
