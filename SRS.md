# Software Requirements Specification (SRS)

Version: 1.0  
Date: 2026-03-17  
Project: Dilowa (Digital Lotse Wasser)

## 1. Purpose

This SRS defines functional and non-functional requirements for the Dilowa platform to support planning, implementation, testing, and acceptance.

## 2. Scope

Dilowa is a web platform for discovering and managing digital water-management solutions. It provides:
- Public and authenticated access to solution information.
- Role-based administration and moderation.
- AI-assisted helpdesk recommendations through LISA.

## 3. Stakeholders

- Sponsor / supervisory stakeholders.
- Product owner and project manager.
- Development and operations teams.
- Moderators/content managers.
- End-users (water utilities, municipalities, partner organizations).

## 4. Product Overview

### 4.1 Product Perspective
- Frontend: React + TypeScript + Vite.
- Backend: Express + TypeScript.
- Data layer: MySQL + Prisma.
- Infrastructure: Docker Compose (dev/prod) + Apache reverse proxy in production.

### 4.2 User Classes
- `ADMIN`: full administration and oversight.
- `MODERATOR`: content and selected domain management.
- `USER`: standard platform usage and own-content operations.
- `ANONYMOUS`: read-only access to public content (where enabled).

## 5. Functional Requirements

### FR-01 Authentication And Authorization
- System shall support registration, login, refresh-token flow, and logout.
- System shall enforce role-based access control for protected endpoints.
- System shall restrict scoped actions (`own` vs `others`) where configured.

Acceptance Criteria:
- Unauthorized requests to protected endpoints return 401/403.
- Admin-level resources are not accessible by unauthorized roles.

### FR-02 User Management
- System shall allow admin-level management of users.
- System shall allow users to view and update their own profile data.

Acceptance Criteria:
- Users can update own profile fields allowed by policy.
- Deleting user entities respects referential integrity and conflict handling.

### FR-03 Organization Management
- System shall support CRUD operations for organizations based on role permissions.
- System shall maintain organization relation data (address, country/region, profile metadata).

Acceptance Criteria:
- Organization reads are available per configured role permissions.
- Deletion/updates return conflict responses when references prevent operation.

### FR-04 Digital Solution Catalog
- System shall support creation, retrieval, update, and deletion of digital solutions with role and scope controls.
- System shall support taxonomy-based categorization and filtering.
- System shall expose active solutions for discovery workflows.

Acceptance Criteria:
- Solutions can be queried by taxonomy criteria.
- State-based filtering supports only valid publication states.

### FR-05 Taxonomy Management
- System shall maintain hierarchical taxonomy nodes for categorization.
- System shall prevent invalid destructive updates when taxonomy nodes are in use.

Acceptance Criteria:
- Taxonomy hierarchy retrieval endpoint returns structured tree data.
- Attempted deletion of in-use taxonomy returns conflict status.

### FR-06 Expert Video Module
- System shall support CRUD operations for expert videos by authorized roles.
- System shall maintain associated metadata and reference integrity.

Acceptance Criteria:
- Authorized roles can manage expert videos.
- Referential conflicts are handled with explicit error responses.

### FR-07 AI Helpdesk (LISA Integration)
- System shall accept user helpdesk messages and process them through LISA integration.
- System shall map extracted filters to taxonomy and query matching activated solutions.
- System shall return response text based only on available database solutions for final suggestions.
- System shall support mock mode for non-production testing.

Acceptance Criteria:
- For qualifying queries, response includes relevant database-backed solutions.
- Network/API failures are handled gracefully with fallback error handling.

### FR-08 Static Legal And Informational Content
- System shall manage and display Terms of Use, Privacy Policy, Accessibility Statement, Imprint, and FAQ.
- System shall record user acceptances for required legal documents where applicable.

Acceptance Criteria:
- Latest content versions are retrievable and editable by authorized roles.
- Acceptance records are persisted with timestamp.

### FR-09 File And Media Handling
- System shall support secure upload and retrieval of media assets and public PDFs.
- System shall preserve metadata (filename, MIME type, size, uploader).

Acceptance Criteria:
- Uploaded files are retrievable through configured public paths/endpoints.
- Invalid file operations fail with explicit validation errors.

### FR-10 Internationalization And UX Support
- Frontend shall support multilingual UI capability via i18n framework.
- System shall provide responsive UI for desktop and mobile use.

Acceptance Criteria:
- Language switch behavior updates UI text for supported locales.
- Core pages remain usable on common viewport sizes.

## 6. Non-Functional Requirements

### NFR-01 Performance
- API health endpoint should respond within 500 ms under nominal load.
- Search and filter operations should return initial results within 2 seconds under nominal load.

### NFR-02 Availability And Reliability
- Production target availability: >= 99.0% within defined service window.
- System should support restart/recovery through container orchestration.

### NFR-03 Security
- JWT-based authentication and secure secret management are required.
- Role and permission checks shall be enforced server-side.
- Sensitive configuration values shall be externalized via environment variables.

### NFR-04 Data Integrity
- Relational constraints shall prevent inconsistent writes.
- Conflict conditions (for example, FK restrictions) shall be surfaced with clear API responses.

### NFR-05 Maintainability
- TypeScript shall be used for backend and frontend codebases.
- Database schema changes shall be tracked through Prisma migrations.
- Deployment steps and runtime configuration shall be documented.

### NFR-06 Observability
- Backend logging shall support operational troubleshooting.
- Health endpoint shall be available for runtime checks.

### NFR-07 Compliance And Privacy
- Legal content management and acceptance tracking shall be supported.
- Personal data handling shall align with applicable policy and legal requirements.

## 7. External Interface Requirements

### 7.1 User Interface
- Browser-based single-page application.
- Role-aware navigation and protected pages.

### 7.2 API Interface
- REST-style HTTP endpoints under `/api`.
- JSON request/response payloads.

### 7.3 Third-Party Interfaces
- LISA API for AI processing.
- SMTP/email provider via configured credentials.

## 8. Constraints

- Stack constraints fixed to existing architecture and tooling.
- Deployment model constrained to Docker Compose and reverse proxy setup.
- Dependency on external LISA availability and outbound HTTPS network access.

## 9. Assumptions

- Stakeholders provide timely requirement clarifications.
- Required secrets and environment variables are available in each deployment stage.
- Data seeds and migrations are applied before feature validation.

## 10. Requirement Prioritization (MoSCoW)

- Must: FR-01, FR-04, FR-05, FR-07, NFR-03, NFR-04.
- Should: FR-06, FR-08, FR-09, NFR-01, NFR-02.
- Could: Extended analytics, advanced recommendation explainability.
- Won't (current scope): Native mobile apps, offline mode.

## 11. Traceability Summary

- Auth/RBAC: backend auth and permission middleware/config.
- Digital Atlas and taxonomy: digital solution and taxonomy endpoints/services.
- Helpdesk: helpdesk route + LISA/taxonomy/solution services.
- Compliance content: policy and statement models/controllers.
- Deployment and operations: compose files + deployment guide.
