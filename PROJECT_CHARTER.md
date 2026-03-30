# Project Charter - Digital Lotse Wasser

Version: 1.0  
Date: 2026-03-17  
Project: Dilowa (Digital Lotse Wasser)

## 1. Problem Analysis

### Problem Statement
Water-sector organizations (utilities, municipalities, operators) struggle to identify and evaluate relevant digital solutions quickly. Information is fragmented, hard to compare, and not always tailored to sector-specific problems.

### Opportunity
Create a central digital platform that:
- Aggregates and structures digital water-management solutions.
- Supports discovery via taxonomy filters and search.
- Provides expert knowledge through videos.
- Improves recommendation quality through an AI helpdesk (LISA integration).

### Business Need
- Reduce time-to-discovery for suitable solutions.
- Increase transparency and comparability of digital offerings.
- Support informed decision-making for water-infrastructure digitization.

## 2. Project Goals And Objectives

### Strategic Goals
- Deliver a reliable and secure web platform for digital solution discovery in the water domain.
- Enable role-based participation for admins, moderators, and standard users.
- Provide intelligent assistance for matching user needs to available solutions.

### Measurable Objectives
- Platform availability: >= 99.0% during agreed service window.
- API health endpoint operational in all environments.
- End-to-end solution search flow (manual + AI-assisted) operational in production.
- Role-based access controls enforced for protected resources and admin functions.

## 3. Scope

### In Scope
- Frontend web app (React + Vite + TypeScript).
- Backend API (Node.js + Express + TypeScript).
- MySQL database with Prisma ORM and migrations.
- Core modules:
  - Authentication and session/JWT handling.
  - Digital solution catalog and taxonomy.
  - Organizations and user profile management.
  - Expert video management.
  - Helpdesk chatbot integration with LISA.
  - Static content pages (FAQ, terms, privacy, accessibility, imprint).
- Dockerized dev and production deployment.

### Out Of Scope
- Native mobile applications.
- Offline-first capability.
- Full multi-tenant isolation by separate database per customer.
- Guaranteed zero-cost operation (external services and hosting costs apply).

## 4. Stakeholder Engagement

### Stakeholder Groups
- Project sponsor / supervisory authority.
- Product owner and project management.
- Backend and frontend development teams.
- DevOps / infrastructure administrators.
- Content managers and moderators.
- End-users from water utilities and municipalities.

### Engagement Model
- Weekly project sync: status, blockers, scope changes.
- Bi-weekly stakeholder demo: validate user flows and priorities.
- Monthly steering review: budget, timeline, risk posture.
- Feedback loops:
  - Structured UAT sessions with representative end-users.
  - Requirement change requests tracked and approved via project governance.

### RACI (High-Level)
- Responsible: Engineering leads, developers.
- Accountable: Product owner / sponsor delegate.
- Consulted: Moderators, legal/compliance, selected end-users.
- Informed: Broader partner organizations and supervisors.

## 5. Constraints, Assumptions, Dependencies

### Constraints
- Technical:
  - Existing stack: React, Express, Prisma, MySQL, Docker.
  - Integration dependency on LISA API endpoint and model availability.
- Time:
  - Delivery timeline constrained by migration, integration, and test windows.
- Financial:
  - Hosting, database operation, email, and AI API usage incur ongoing costs.

### Assumptions
- Stakeholders can provide timely decisions on scope and priorities.
- Production environment provides stable Docker runtime and network connectivity.
- Required credentials and secrets (DB, email, LISA) are available before go-live.

### Dependencies
- LISA API availability and token management.
- MySQL database provisioning and backup operations.
- Reverse proxy and SSL setup in production.

## 6. Governance And Delivery Approach

- Delivery model: iterative, milestone-based releases.
- Change control: requirement changes captured as formal requests.
- Quality gates:
  - Build and lint checks.
  - Migration and API smoke tests.
  - UAT sign-off for high-impact flows.

## 7. Success Criteria

- Functional coverage of core modules confirmed by acceptance tests.
- Security-sensitive flows (auth, permissions, protected resources) validated.
- Stakeholder acceptance achieved for MVP and post-MVP backlog.
- Operational runbook and deployment documentation available and used.

## 8. Initial Milestones

1. Requirements baseline approved.
2. MVP feature-complete in staging.
3. UAT sign-off for critical workflows.
4. Production go-live.
5. Hypercare and stabilization complete.
