# Technology Stack Documentation

Version: 1.0  
Date: 2026-03-17  
Project: Dilowa (Digital Lotse Wasser)

## 1. Selection Principles

Stack choices are based on:
- Fit for water-domain platform requirements.
- Team maintainability and delivery speed.
- Security, ecosystem maturity, and operational simplicity.
- Compatibility with existing repository and deployment model.

## 2. Selected Stack

## 2.1 Frontend
- Language: TypeScript.
- Framework: React 18.
- Build Tool: Vite.
- UI: Ant Design 5 + Less.
- Routing: React Router.
- State/Context: React Context + hooks.
- i18n: i18next + react-i18next.
- Maps: Leaflet + React Leaflet.
- HTTP: Axios.

Rationale:
- Fast iteration speed for admin and catalog-heavy UX.
- Strong component ecosystem and TypeScript support.
- Good support for multilingual and map-based interfaces.

## 2.2 Backend
- Runtime: Node.js 18+.
- Framework: Express.
- Language: TypeScript.
- Validation and typing support: Zod + TypeScript types.
- Auth: JWT access/refresh flow.
- File/media: Multer + Sharp.
- Logging: Winston.

Rationale:
- Clear middleware model for RBAC and cross-cutting concerns.
- Strong npm ecosystem for integration and operational tooling.
- Shared language with frontend lowers context switching.

## 2.3 Data And Persistence
- Database: MySQL 8.0.
- ORM: Prisma.
- Migrations: Prisma migrations.

Rationale:
- Relational model aligns with users/organizations/solutions/taxonomy relationships.
- Prisma improves developer productivity and schema consistency.

## 2.4 Integration And Infrastructure
- AI integration: LISA API.
- Email integration: SMTP via Nodemailer.
- Containerization: Docker + Docker Compose.
- Reverse proxy/web serving: Apache 2.4.

Rationale:
- LISA provides domain-relevant NLP capability for helpdesk flow.
- Docker Compose keeps local and production setup consistent.

## 3. Decision Matrix (Summary)

| Domain | Selected | Alternatives Considered | Why Selected |
|---|---|---|---|
| Frontend Framework | React | Vue, Angular | Ecosystem maturity and existing codebase fit |
| API Framework | Express | Fastify, NestJS | Existing implementation, simplicity, middleware flexibility |
| Database | MySQL | PostgreSQL | Existing schema and deployment baseline |
| ORM | Prisma | Sequelize, TypeORM | Strong TypeScript ergonomics and migration workflow |
| Build/Dev Tool | Vite | Webpack | Faster local development and modern defaults |
| Container Orchestration | Docker Compose | Kubernetes | Appropriate complexity for current scale |

## 4. Version And Upgrade Strategy

- Pin and review critical dependencies quarterly.
- Keep Node LTS and Prisma client/schema versions aligned.
- Track security advisories for auth, HTTP, and file-upload libraries.

## 5. Tooling And Quality Controls

- TypeScript compilation in frontend and backend.
- ESLint configured for frontend (extend to backend as needed).
- Build and smoke-test gates before release.
- Prisma migration checks in CI/CD pipeline (recommended).

## 6. Constraints And Risks

- External LISA service availability affects chatbot quality and latency.
- Multi-service configuration complexity (DB/API/email/AI) increases deployment risk.
- Need disciplined secret management across environments.

## 7. Recommended Enhancements

1. Add backend lint/test commands if not already standardized.
2. Add API contract checks for critical endpoints.
3. Add centralized monitoring stack for production (logs + metrics + alerts).
4. Add dependency vulnerability scan in CI.
