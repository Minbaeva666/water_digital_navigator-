# Digital Lotse Wasser

A digital platform for water management solutions, connecting water utilities, municipalities, and solution providers to discover, share, and implement innovative water technologies.

## Overview

Digital Lotse Wasser (Water Digital Navigator) helps organizations in the water sector find and evaluate digital solutions for:

- Water quality monitoring
- Infrastructure management
- Process optimization
- Data analysis and visualization
- Stakeholder communication

The platform includes:

- **Digital Atlas**: Browse and search water management solutions
- **Expert Videos**: Educational content from industry experts
- **AI-Powered Helpdesk**: LISA chatbot for solution recommendations
- **User Dashboard**: Manage your organization's solutions and profile

## Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide for dev and production
- **[ROLE_ACCESS_CONTROL.md](ROLE_ACCESS_CONTROL.md)** - Roles, authorized pages, and permission matrix
- **[PROJECT_CHARTER.md](PROJECT_CHARTER.md)** - Project charter and stakeholder model
- **[SRS.md](SRS.md)** - Software requirements specification
- **[FEASIBILITY_RISK_ANALYSIS.md](FEASIBILITY_RISK_ANALYSIS.md)** - Feasibility study and risk register
- **[SYSTEM_DESIGN_DOCUMENT.md](SYSTEM_DESIGN_DOCUMENT.md)** - System architecture, data flow, and interfaces
- **[TECHNOLOGY_STACK.md](TECHNOLOGY_STACK.md)** - Technology selection and rationale
- **[PROJECT_ROADMAP.md](PROJECT_ROADMAP.md)** - Timeline, work breakdown, and resource plan
- **[JIRA_BACKLOG.md](JIRA_BACKLOG.md)** - Jira-ready epics, stories, acceptance criteria, and sprint mapping
- **[jira-import.csv](jira-import.csv)** - Jira bulk import CSV (epics + stories)
- **[TEST_CASE_REPORT.md](TEST_CASE_REPORT.md)** - Current executed unit test case report and outcomes
- **[INTEGRATION_SYSTEM_TEST_REPORT_TEMPLATE.md](INTEGRATION_SYSTEM_TEST_REPORT_TEMPLATE.md)** - Integration/system report template for staging and release cycles
- **[frontend/docs/WIREFRAMES_AND_PROTOTYPES.md](frontend/docs/WIREFRAMES_AND_PROTOTYPES.md)** - UX wireframes and prototype spec
- **[frontend/docs/wireframe-prototype.html](frontend/docs/wireframe-prototype.html)** - Interactive low-fidelity prototype

## Tech Stack

### Backend

- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL 8.0 with Prisma ORM
- **Authentication**: JWT (access/refresh tokens)
- **Email**: Nodemailer
- **File handling**: Multer, Sharp
- **AI Integration**: LISA (Hochschule Hof LLM)

### Frontend

- **Framework**: React 18
- **Build tool**: Vite
- **Language**: TypeScript
- **UI Library**: Ant Design 5
- **Routing**: React Router 7
- **Maps**: Leaflet + React Leaflet
- **HTTP client**: Axios
- **i18n**: i18next

### Infrastructure

- **Containerization**: Docker + Docker Compose
- **Web Server**: Apache 2.4 (reverse proxy)
- **SSL**: Let's Encrypt

## Project Structure

```
dilowa/
├── backend/                    # Node.js API server
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── routes/             # API route definitions
│   │   ├── services/           # Business logic (LISA, email, taxonomy)
│   │   ├── models/             # Data models
│   │   ├── middlewares/        # Auth, error handling
│   │   ├── prisma/             # Prisma client & seed scripts
│   │   ├── config/             # Configuration files
│   │   ├── utils/              # Helper utilities
│   │   └── server.ts           # Express app setup
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── migrations/         # DB migrations
│   ├── public/                 # Static files & uploads
│   ├── Dockerfile
│   ├── .env.development        # Local env vars
│   └── .env.production         # Production env vars
│
├── frontend/                   # React web app
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API clients
│   │   ├── context/            # React context providers
│   │   ├── hooks/              # Custom React hooks
│   │   ├── layouts/            # Layout components
│   │   ├── forms/              # Form components
│   │   ├── i18n/               # Translations
│   │   ├── utils/              # Helper utilities
│   │   └── App.tsx             # Root component
│   ├── docker/                 # Apache vhost configs
│   ├── public/                 # Static assets
│   ├── Dockerfile
│   └── vite.config.ts
│
├── docker-compose.dev.yml      # Local development
├── docker-compose.prod.yml     # Production setup
├── DEPLOYMENT.md               # Deployment guide
└── SECURITY_AUDIT_REPORT.md    # Security audit findings

```

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local dev without Docker)

### Local Development (Docker)

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd dilowa
   ```

2. **Configure environment**

   ```bash
   cp backend/.env.development backend/.env
   # Edit backend/.env with your values
   ```

3. **Start services**

   ```bash
   docker compose -f docker-compose.dev.yml up -d --build
   ```

4. **Access the application**
   - Frontend: http://localhost:8080/
   - Backend API: http://localhost:3001/api/health

### Local Development (without Docker)

1. **Start MySQL**

   ```bash
   # Use your local MySQL or run just the DB container
   docker run -d -p 3307:3306 \
     -e MYSQL_ROOT_PASSWORD=your_password \
     -e MYSQL_DATABASE=dilowa-db \
     mysql:8.0
   ```

2. **Backend**

   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

3. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Database Seeding

Seed the database with initial data:

```bash
cd backend
npm run seed:countries
npm run seed:taxonomy
npm run seed:admin
npm run seed:faq
```

## Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed production deployment instructions.

## API Documentation

Key endpoints:

- **Authentication**: `/api/auth/login`, `/api/auth/register`
- **Digital Solutions**: `/api/digital-solutions`
- **Organizations**: `/api/organizations`
- **Taxonomy**: `/api/taxonomyNodes/taxonomy-structure`
- **Expert Videos**: `/api/expert-videos`
- **Helpdesk (LISA)**: `/api/helpdesk/chat`
- **Health Check**: `/api/health`

## Scripts

### Backend

- `npm run dev` - Start development server
- `npm run build` - Compile TypeScript
- `npm run start` - Run production build
- `npm run seed:*` - Seed database tables

### Frontend

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Security

See [SECURITY_AUDIT_REPORT.md](SECURITY_AUDIT_REPORT.md) for security audit findings and [SECURITY_REMEDIATION_QUICKSTART.md](SECURITY_REMEDIATION_QUICKSTART.md) for remediation steps.
