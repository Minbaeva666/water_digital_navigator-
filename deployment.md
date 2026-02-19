# Deployment Guide

This document describes how to deploy the Dilowa project with Docker Compose (dev and prod) and how to configure Apache as a reverse proxy.

## Prerequisites

- Docker and Docker Compose installed
- Apache 2 with proxy modules (for production)
- DNS or IP access to the host

## Repository layout

- backend/ (Node.js API)
- frontend/ (React + Vite, served by Apache in container)
- docker-compose.dev.yml (local dev)
- docker-compose.prod.yml (production)

## Environment files

### backend/.env.development

```env
DATABASE_URL="mysql://root:CHANGE_PASSWORD@localhost:3307/dilowa-db"
CLIENT_ORIGIN="http://localhost:8080"

LISA_API_TOKEN=YOUR_TOKEN
LLM_MODEL=dilowa
USE_MOCK_LISA=true

ACCESS_SECRET=GENERATE_RANDOM_64_CHAR_STRING
REFRESH_SECRET=GENERATE_RANDOM_64_CHAR_STRING

EMAIL_USER=your-email@hof-university.de
EMAIL_PASS=YOUR_PASSWORD
```

### backend/.env.production

```env
DATABASE_URL="mysql://root:CHANGE_PASSWORD@mysql:3306/dilowa-db"
CLIENT_ORIGIN="http://192.168.84.86"

LISA_API_TOKEN=YOUR_TOKEN
LLM_MODEL=dilowa
USE_MOCK_LISA=false

ACCESS_SECRET=GENERATE_RANDOM_64_CHAR_STRING
REFRESH_SECRET=GENERATE_RANDOM_64_CHAR_STRING

EMAIL_USER=your-email@hof-university.de
EMAIL_PASS=YOUR_PASSWORD
```

## Local development (Docker)

```
cd /path/to/dilowa

docker compose -f docker-compose.dev.yml up -d --build
```

Local endpoints:

- Frontend: http://localhost:8080/
- Backend: http://localhost:3001/api/health

## Deployment on server

### 1) Clone or pull the repository

```bash
cd /var/www/html
git clone <repo-url> dilowa
# or if already cloned:
cd dilowa && git pull
```

### 2) Configure environment variables

Edit `backend/.env.production` with your production values (DB password, LISA token, email credentials, etc.).

### 3) Build and run containers

```bash
cd /var/www/html/dilowa
docker compose -f docker-compose.prod.yml up -d --build
```

### 4) Database access in production

The production compose exposes MySQL on host port 3307. If you change the MySQL password, update both:

- `MYSQL_ROOT_PASSWORD` in the host env (or `.env`)
- `DATABASE_URL` in `backend/.env.production`

### 5) Static files and uploads

The backend serves files from `/app/public` inside the container. To reuse existing uploads from the old project:

```yaml
volumes:
  - /var/www/html/dilowa_backend/public:/app/public
```

### 6) Apache vhost configuration

The Apache vhost file is located at:

- **Active vhost:** `/etc/apache2/sites-enabled/dilowa-docker.conf` (symlink)
- **Source vhost:** `/etc/apache2/sites-available/dilowa-docker.conf`

A template is also available in the repo:

- `frontend/docker/digital-lotse-wasser.conf`

**Note:** The vhost must proxy `/dilowa/api` → `http://127.0.0.1:3001/api` and `/dilowa/` → `http://127.0.0.1:8080/dilowa/`.

## Common checks

- Backend health: http://127.0.0.1:3001/api/health
- Frontend container: http://127.0.0.1:8080/dilowa/
- Apache routing: http://192.168.84.86/dilowa/

## Rebuild after env changes

The backend image copies backend/.env.production at build time. If you change it, rebuild:

```
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml up -d backend
```
