# Project Roadmap

Version: 1.0  
Date: 2026-03-17  
Project: Dilowa (Digital Lotse Wasser)

## 1. Planning Assumptions

- Horizon: 16 weeks for core release plus 4 weeks stabilization.
- Team baseline:
  - 1 Product Owner (0.6 FTE)
  - 1 Project Manager/Scrum Master (0.5 FTE)
  - 2 Backend Engineers (2.0 FTE)
  - 2 Frontend Engineers (2.0 FTE)
  - 1 QA Engineer (1.0 FTE)
  - 1 DevOps Engineer (0.5 FTE)
  - 1 UX/UI Designer (0.5 FTE)

## 2. Milestone Timeline

| Phase | Weeks | Outcome |
|---|---|---|
| P1 Discovery and Design | 1-3 | Approved SRS, SDD, wireframes, backlog baseline |
| P2 Foundation Build | 4-7 | Auth, RBAC, core data models, CI baseline |
| P3 Core Features | 8-11 | Digital atlas, taxonomy, org and profile flows |
| P4 AI + Content + Hardening | 12-14 | LISA helpdesk, expert videos, legal content readiness |
| P5 UAT and Go-Live | 15-16 | UAT sign-off, deployment checklist, release |
| P6 Hypercare | 17-20 | Incident response, bug fixes, optimization |

## 3. Work Breakdown Structure (WBS)

### Track A: Product And Requirements
- A1: Stakeholder interviews and validation workshops.
- A2: Requirement baseline and change-control process.
- A3: Acceptance criteria and UAT scenario definition.

### Track B: Architecture And Platform
- B1: Finalize SDD and API boundary contracts.
- B2: Environment strategy and secret management.
- B3: Observability baseline (health, logging, alerts).

### Track C: Backend Delivery
- C1: Auth, token lifecycle, role/scoped permission hardening.
- C2: Digital solutions, taxonomy, organization APIs.
- C3: Expert video and legal-content APIs.
- C4: Helpdesk-LISA orchestration and fallback handling.

### Track D: Frontend Delivery
- D1: Navigation, authentication, and role-aware guards.
- D2: Catalog search/filter pages and detail views.
- D3: User profile and organization management forms.
- D4: Helpdesk widget UX and result rendering.
- D5: Admin/moderator content management UX.

### Track E: QA And Release
- E1: Test strategy (unit/integration/e2e smoke).
- E2: Regression suite for RBAC and critical paths.
- E3: UAT support and defect triage.
- E4: Production rollout and hypercare monitoring.

## 4. Sprint-Level Plan (2-Week Cadence)

| Sprint | Focus | Exit Criteria |
|---|---|---|
| S1 | Discovery + architecture baseline | SRS/SDD approved, high-priority backlog groomed |
| S2 | Auth + RBAC baseline | Secure login flow and route protections validated |
| S3 | Digital atlas data flows | Search/filter and details functional in staging |
| S4 | Taxonomy + organization workflows | CRUD and conflict handling validated |
| S5 | LISA helpdesk + expert videos | End-to-end AI and media workflows validated |
| S6 | UAT + release readiness | Go-live checklist complete and accepted |

## 5. Resource Allocation Plan

## 5.1 Role Allocation By Phase

| Role | P1 | P2 | P3 | P4 | P5 | P6 |
|---|---|---|---|---|---|---|
| Product Owner | High | Medium | Medium | High | High | Medium |
| Project Manager | High | High | High | High | High | Medium |
| UX/UI Designer | High | Medium | Medium | Medium | Low | Low |
| Frontend Engineers | Medium | High | High | High | Medium | Medium |
| Backend Engineers | Medium | High | High | High | High | Medium |
| QA Engineer | Low | Medium | High | High | High | High |
| DevOps Engineer | Medium | Medium | Medium | High | High | Medium |

## 5.2 Capacity Buffer

- Reserve 15% capacity each sprint for:
  - Unplanned defects.
  - Integration uncertainty (LISA/API latency issues).
  - Stakeholder-driven adjustments.

## 6. Dependencies And Critical Path

Critical dependencies:
1. Timely stakeholder sign-off on requirements and UX.
2. Availability of LISA credentials and stable endpoint access.
3. Stable staging environment with representative data.

Critical path:
1. Requirements baseline -> architecture finalization -> core API completion.
2. Core API completion -> frontend integration -> UAT completion.
3. UAT completion -> deployment hardening -> production release.

## 7. Risk-Adjusted Delivery Controls

- Weekly risk review with owner and mitigation status.
- Hard release gates:
  - Security checks for auth/RBAC flows.
  - Data integrity regression tests.
  - Health and smoke checks in staging and production candidate.
- Rollback strategy documented before each release.

## 8. Success Metrics Per Phase

- P1: Requirements clarity score and approved backlog coverage.
- P2-P4: Story completion reliability and defect leakage rate.
- P5: UAT pass rate and release readiness checklist completion.
- P6: Incident count reduction and mean time to recovery (MTTR).
