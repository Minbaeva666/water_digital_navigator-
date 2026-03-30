# Jira-Ready Backlog

Version: 1.0  
Date: 2026-03-17  
Source: `PROJECT_ROADMAP.md`, `SRS.md`, `SYSTEM_DESIGN_DOCUMENT.md`

## 1. Usage Notes

- Use this file to create Jira issues with hierarchy: `Epic -> Story -> Sub-task`.
- Story IDs below are stable planning IDs and can be copied into Jira custom field `External ID`.
- Sprint mapping uses 2-week cadence (`S1` to `S6`) from the roadmap.
- Priority scale: `P0` (must), `P1` (should), `P2` (could).

## 2. Epic List

| Epic ID | Epic Name | Goal | Sprint Window | Priority |
|---|---|---|---|---|
| E01 | Requirements And Governance | Baseline requirements, stakeholder validation, change control | S1-S2 | P0 |
| E02 | Platform And Security Foundation | Auth, RBAC, environment hardening, CI baseline | S2-S3 | P0 |
| E03 | Digital Atlas Core | Solution catalog, taxonomy integration, filtering and details | S3-S4 | P0 |
| E04 | Organization And User Workflows | User profile and organization lifecycle workflows | S3-S4 | P1 |
| E05 | AI Helpdesk | LISA-based query understanding and recommendation flow | S5 | P0 |
| E06 | Content And Compliance | Expert videos and legal content management | S5 | P1 |
| E07 | Quality, UAT, And Release | Regression, UAT, go-live readiness, hypercare | S6 | P0 |

## 3. Stories By Epic

## E01 - Requirements And Governance

### US-001 Stakeholder Interview Completion
- Type: Story
- Priority: P0
- Sprint: S1
- Description: Conduct stakeholder interviews across sponsor, moderators, end-users, and ops.
- Acceptance Criteria:
  - Interview notes exist for all target stakeholder groups.
  - At least 20 actionable requirements/constraints captured.
  - Open questions list and owners are documented.

### US-002 Requirements Baseline Sign-Off
- Type: Story
- Priority: P0
- Sprint: S1
- Description: Approve SRS baseline and lock MVP scope.
- Acceptance Criteria:
  - `SRS.md` is approved by product owner and technical lead.
  - MoSCoW priorities are agreed.
  - Scope-change workflow is documented.

### US-003 UAT Scenario Definition
- Type: Story
- Priority: P1
- Sprint: S2
- Description: Define user acceptance test scenarios for critical flows.
- Acceptance Criteria:
  - UAT scenarios for auth, catalog, helpdesk, and admin flows documented.
  - Each scenario includes expected outcomes and pass/fail criteria.

## E02 - Platform And Security Foundation

### US-004 Auth Hardening
- Type: Story
- Priority: P0
- Sprint: S2
- Description: Implement and verify registration/login/token refresh/logout reliability.
- Acceptance Criteria:
  - Login and token refresh work in staging.
  - Expired/invalid tokens return correct HTTP errors.
  - Logout invalidates refresh token path.

### US-005 RBAC Middleware Coverage
- Type: Story
- Priority: P0
- Sprint: S2
- Description: Ensure all protected endpoints enforce role/scoped permissions.
- Acceptance Criteria:
  - Route-to-permission matrix verified.
  - Unauthorized role access is blocked with 403.
  - Scoped `own` vs `others` checks pass integration tests.

### US-006 Environment And Secret Validation
- Type: Story
- Priority: P0
- Sprint: S2
- Description: Add startup validation and checklist for required environment variables.
- Acceptance Criteria:
  - Missing critical env vars fail startup with actionable error.
  - Dev/prod env checklists are documented.

### US-007 CI Build And Smoke Baseline
- Type: Story
- Priority: P1
- Sprint: S3
- Description: Establish build and smoke verification for backend/frontend.
- Acceptance Criteria:
  - Frontend and backend build steps run on CI.
  - Smoke checks include API health and app load.

## E03 - Digital Atlas Core

### US-008 Taxonomy Tree Retrieval
- Type: Story
- Priority: P0
- Sprint: S3
- Description: Deliver reliable taxonomy tree API and UI binding.
- Acceptance Criteria:
  - Taxonomy tree endpoint returns hierarchical structure.
  - Frontend renders tree without broken nodes.

### US-009 Solution Search And Filter
- Type: Story
- Priority: P0
- Sprint: S3
- Description: Implement end-to-end search/filter for digital solutions.
- Acceptance Criteria:
  - Filters return correct subset based on taxonomy criteria.
  - Pagination and sort behavior are consistent.

### US-010 Solution Detail Experience
- Type: Story
- Priority: P1
- Sprint: S3
- Description: Provide detailed view with metadata, tags, links, and related content.
- Acceptance Criteria:
  - Detail page loads complete solution payload.
  - Missing optional fields are handled gracefully.

### US-011 Taxonomy Integrity Protection
- Type: Story
- Priority: P0
- Sprint: S4
- Description: Prevent destructive taxonomy updates when nodes are in use.
- Acceptance Criteria:
  - In-use taxonomy delete attempt returns conflict response.
  - UI surfaces clear error state for blocked operation.

## E04 - Organization And User Workflows

### US-012 User Profile Management
- Type: Story
- Priority: P1
- Sprint: S4
- Description: Allow users to view and edit own profile with validation.
- Acceptance Criteria:
  - Users can update allowed profile fields.
  - Invalid inputs return validation feedback.

### US-013 Organization CRUD By Role
- Type: Story
- Priority: P1
- Sprint: S4
- Description: Implement role-based org CRUD with reference-safe deletes.
- Acceptance Criteria:
  - Authorized roles can perform allowed actions.
  - Restricted actions are blocked by role.
  - Referential conflicts return 409 and are shown in UI.

## E05 - AI Helpdesk

### US-014 LISA Intent And Filter Extraction
- Type: Story
- Priority: P0
- Sprint: S5
- Description: Process user prompt and obtain structured filters or clarification.
- Acceptance Criteria:
  - Valid prompts return filters or clarification text.
  - Failures return graceful fallback message.

### US-015 Filter-To-Taxonomy Mapping
- Type: Story
- Priority: P0
- Sprint: S5
- Description: Map LISA filter terms to taxonomy node IDs for query execution.
- Acceptance Criteria:
  - Mapping quality validated with representative test prompts.
  - Unmatched terms handled without server error.

### US-016 DB-Backed Helpdesk Response Formatting
- Type: Story
- Priority: P0
- Sprint: S5
- Description: Ensure helpdesk outputs are based on database solutions only.
- Acceptance Criteria:
  - Returned suggestions correspond to activated DB records.
  - Response format includes clear recommendation list and source note.

### US-017 Helpdesk UX Integration
- Type: Story
- Priority: P1
- Sprint: S5
- Description: Integrate helpdesk widget with loading/error/empty states.
- Acceptance Criteria:
  - Widget supports send, retry, and error recovery.
  - Mobile and desktop layouts remain usable.

## E06 - Content And Compliance

### US-018 Expert Video Management
- Type: Story
- Priority: P1
- Sprint: S5
- Description: Deliver role-based expert video CRUD and metadata consistency.
- Acceptance Criteria:
  - Authorized create/edit/delete actions work as expected.
  - Conflicts and validation errors are displayed clearly.

### US-019 Legal Content Management
- Type: Story
- Priority: P1
- Sprint: S5
- Description: Manage terms/privacy/accessibility/imprint content by role.
- Acceptance Criteria:
  - Latest legal content is editable/retrievable by permitted roles.
  - Changes are persisted with update metadata.

### US-020 Consent Logging
- Type: Story
- Priority: P1
- Sprint: S5
- Description: Record user acceptance for required legal policies.
- Acceptance Criteria:
  - Acceptance records store timestamp and user association.
  - Duplicate acceptance behavior follows policy rules.

## E07 - Quality, UAT, And Release

### US-021 RBAC Regression Suite
- Type: Story
- Priority: P0
- Sprint: S6
- Description: Build automated regression coverage for high-risk permissions.
- Acceptance Criteria:
  - Test suite covers critical role-resource-action matrix.
  - Failing authz rules block release.

### US-022 End-To-End Smoke Suite
- Type: Story
- Priority: P0
- Sprint: S6
- Description: Verify end-to-end critical user journeys in staging.
- Acceptance Criteria:
  - Smoke suite covers login, search, detail, helpdesk, and admin basics.
  - Smoke suite passes on release candidate build.

### US-023 UAT Execution And Defect Closure
- Type: Story
- Priority: P0
- Sprint: S6
- Description: Execute UAT with stakeholders and close critical defects.
- Acceptance Criteria:
  - UAT completion report signed by product owner.
  - No open Sev-1 or Sev-2 defects at go-live decision.

### US-024 Production Readiness And Hypercare
- Type: Story
- Priority: P0
- Sprint: S6
- Description: Complete go-live checklist and run initial hypercare period.
- Acceptance Criteria:
  - Rollback plan and release checklist are approved.
  - Monitoring and incident ownership are active post-release.

## 4. Suggested Sub-Task Template (Per Story)

Use the same sub-task pattern for each story:
1. Analysis and design update.
2. Backend implementation.
3. Frontend implementation.
4. Test coverage (unit/integration/e2e as relevant).
5. Documentation and review evidence.

## 5. Jira Field Mapping Template

| Field | Recommended Value |
|---|---|
| Project | DILOWA |
| Issue Type | Epic / Story / Sub-task |
| Summary | `US-XXX: <Short outcome-oriented title>` |
| Description | Copy from story description and acceptance criteria |
| Priority | P0/P1/P2 mapped to Jira Highest/High/Medium |
| Sprint | S1-S6 |
| Labels | `roadmap`, `srs`, `architecture`, plus module labels |
| Components | `frontend`, `backend`, `devops`, `qa`, `product` |
| Story Points | Estimate in sprint planning |
| Definition of Done | Build passes, tests pass, docs updated, review approved |

## 6. Dependencies Snapshot

- US-002 blocks all delivery stories.
- US-004 and US-005 block admin and protected workflow stories.
- US-008 blocks US-009 and US-015.
- US-014 and US-015 block US-016 and US-017.
- US-021 and US-022 block US-024 release decision.
