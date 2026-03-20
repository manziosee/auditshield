<div align="center">

<br/>

<img src="frontend/public/logo.svg" width="110" height="110" alt="AuditShield Logo">

<br/>
<br/>

# 🛡️ AuditShield

### **The Global SME Compliance Platform**

> _Keep your business audit-ready — anywhere in the world._
> Manage employees, encrypted documents, payroll, and regulatory obligations in one secure multi-tenant SaaS.

<br/>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deployed on Fly.io](https://img.shields.io/badge/Deployed%20on-Fly.io-8b5cf6?logo=flydotio&logoColor=white)](https://fly.io)

<br/>

---

### 🔧 Built With

<br/>

**Backend**

![Python](https://img.shields.io/badge/Python_3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django_5-092E20?style=for-the-badge&logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/Django_REST_Framework-a30000?style=for-the-badge&logo=django&logoColor=white)
![GraphQL](https://img.shields.io/badge/Strawberry_GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white)

**Database & Cache**

![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Redis](https://img.shields.io/badge/Redis_7-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Celery](https://img.shields.io/badge/Celery-37814A?style=for-the-badge&logo=celery&logoColor=white)

**Frontend**

![Angular](https://img.shields.io/badge/Angular_18-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Angular Material](https://img.shields.io/badge/Angular_Material-757575?style=for-the-badge&logo=materialdesign&logoColor=white)
![Apollo](https://img.shields.io/badge/Apollo_Client-311C87?style=for-the-badge&logo=apollographql&logoColor=white)

**Infrastructure**

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![Fly.io](https://img.shields.io/badge/Fly.io-8b5cf6?style=for-the-badge&logo=flydotio&logoColor=white)

<br/>

---

</div>

## What is AuditShield?

**AuditShield** is a **multi-tenant SaaS compliance platform** built for small and medium enterprises (SMEs) operating across multiple countries. It centralises everything an SME needs to stay audit-ready:

- 📋 **Employee records** — full lifecycle management with department hierarchy
- 🔒 **Encrypted document vault** — AES-128 Fernet encryption at rest, OCR text extraction, expiry alerts
- ✅ **Compliance tracker** — tax, social security, and labour law obligations mapped to global authorities
- 💰 **Payroll engine** — country-specific tax rules, payroll runs, and payslip generation
- 📄 **PDF report generation** — async via Celery + WeasyPrint, download when ready
- 🌍 **Multi-country** — 16+ countries, 17+ currencies, global authority mapping
- 🔍 **Immutable audit trail** — every write recorded automatically by middleware
- 🔔 **Notifications** — in-app + email with unread badge and mark-all-read
- 🔗 **Dual API** — REST (DRF + Swagger) **and** GraphQL (Strawberry + Apollo)

Every company is a **fully isolated tenant** with UUID-keyed records and scoped row-level queries. No data leaks across tenants — ever.

---

## Table of Contents

- [Features](#features)
- [Innovation Features](#innovation-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Quick Start (Docker)](#quick-start-docker)
- [Local Development (without Docker)](#local-development-without-docker)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [New API Endpoints](#new-api-endpoints)
- [Deployment — Fly.io](#deployment--flyio)
- [Deployment — Docker Compose Production](#deployment--docker-compose-production)
- [User Roles](#user-roles)
- [Project Structure](#project-structure)
- [Makefile Commands](#makefile-commands)
- [License](#license)

---

## Features

### Core Platform

| 🏷️ Area | ✨ Capabilities |
|---------|----------------|
| 🏢 **Multi-tenancy** | Each company is a fully isolated tenant — UUID PKs, cascading row-level scoping |
| 👥 **Employees** | Full CRUD, department management, bulk Excel/CSV import, one-click export, risk scoring |
| 🔒 **Documents** | Fernet AES-128 encryption at rest, OCR extraction, version control, expiry tracking & email alerts |
| 🤖 **AI Extraction** | OCR auto-extracts employee name, salary, start/end dates from uploaded contracts |
| ✅ **Compliance** | Tax, social security & labour law tracker; authority dashboards; full CRUD; bulk updates |
| 🧠 **Health Pulse** | Rolling 6-month compliance trend + 30-day AI risk prediction |
| 🔍 **Gap Analysis** | Auto-detects missing requirements vs your country + industry |
| 📅 **Deadline Calendar** | Monthly calendar view of all compliance deadlines with iCal export |
| 👤 **Self-Service Portal** | Employees see only their own payslips, documents, and compliance status |
| 📊 **Reports** | Async PDF generation (WeasyPrint + Celery); scheduled delivery via email |
| 💰 **Payroll** | Country-specific tax rule engine, payroll runs, payslip generation, variance alerts |
| 🌍 **Geography** | 16+ countries, 17+ currencies, live exchange rate support |
| 🔑 **Auth** | JWT rotate-on-refresh, Argon2 hashing, brute-force lockout (django-axes) |
| 📜 **Audit Trail** | Immutable middleware log of every POST/PUT/PATCH/DELETE; CSV/PDF export |
| 🔔 **Notifications** | In-app + email alerts, unread badge, mark-all-read |
| 🏛️ **Portfolio** | Super-admin sees all tenant companies with live compliance scores |
| 🔗 **Webhooks** | Outbound HMAC-signed webhooks for all platform events |
| 🔗 **GraphQL** | Strawberry endpoint — Apollo-compatible at `/graphql/` |
| 📖 **REST API** | Full DRF REST API with OpenAPI/Swagger docs at `/api/docs/` |

### New Features (v2)

| 🏷️ Area | ✨ Capabilities |
|---------|----------------|
| ✍️ **E-Signatures** | Request legally-binding document signatures from employees; track signing status per signer |
| 🚀 **Onboarding** | Configurable onboarding checklists with task types (document, form, training, sign); progress tracking |
| 🎓 **Training & Certifications** | Track employee certifications with validity periods, expiry alerts, and compliance reports |
| 📋 **Policy Management** | Version-controlled policies with mandatory employee acknowledgment tracking and audit trail |
| 🚨 **Incident Log** | Report and investigate compliance violations, data breaches, and safety incidents; update trail |
| ✅ **Approval Workflows** | Configurable multi-step approval chains for documents, expenses, leave; full audit trail |
| 🏭 **Vendor Compliance** | Vendor registry with compliance scores, insurance tracking, contract expiry monitoring |
| 📝 **Custom Forms** | Drag-and-drop form builder; collect employee and vendor data with structured field types |
| 🤝 **Partner / White-Label** | Partner portal with custom branding, sub-company management, revenue dashboards |
| 🔌 **Integration Hub** | Connect QuickBooks, Xero, BambooHR, Slack, Google Workspace via OAuth; sync status & logs |
| 📊 **Employee Risk Scores** | Composite risk scoring per employee based on document status, training gaps, compliance history |
| 📅 **Scheduled Reports** | Schedule PDF reports for automatic email delivery (daily/weekly/monthly) |
| 🔍 **Audit Prep Assistant** | Step-by-step audit readiness checklist with live progress score per regulatory framework |
| 📱 **Mobile PWA** | Progressive Web App — installable on iOS/Android, offline capability, responsive design |

---

## Innovation Features

### 🧠 Compliance Health Pulse
`GET /api/v1/compliance/health-pulse/`

Returns rolling 6-month history + linear regression prediction:
```json
{
  "current_score": 78,
  "trend": "improving",
  "predicted_30d": 83,
  "risk_level": "moderate",
  "days_to_threshold": null,
  "history": [
    {"month": "2025-10", "score": 65},
    {"month": "2025-11", "score": 70},
    {"month": "2025-12", "score": 72},
    {"month": "2026-01", "score": 74},
    {"month": "2026-02", "score": 76},
    {"month": "2026-03", "score": 78}
  ]
}
```

### 🔍 Compliance Gap Analysis
`GET /api/v1/compliance/gap-analysis/`

Compares your company's tracked requirements against the global requirement library for your country + industry. Returns prioritised list of missing requirements:
```json
{
  "total_gaps": 4,
  "coverage_percent": 76,
  "gaps": [
    {
      "requirement_id": "...",
      "title": "Annual Tax Return Filing",
      "authority": "IRS",
      "priority": "high",
      "is_mandatory": true,
      "frequency": "annually"
    }
  ]
}
```

### ⚠️ Payroll Variance Check
`POST /api/v1/payroll/runs/{id}/variance-check/`

Compares current run against the previous completed run. Flags salary spikes >15%, missing employees, and new additions.

### 📤 Audit Trail Export
`GET /api/v1/audit-logs/export/?format=csv&date_from=2026-01-01&date_to=2026-03-31`

Downloads the audit trail as CSV (or JSON) for external auditors. Supports date range, method, and status filters.

### 🏛️ Portfolio Dashboard
`GET /api/v1/companies/portfolio/` _(super_admin only)_

Returns all tenant companies with live compliance scores, employee counts, and last activity — for accounting firms managing multiple clients.

### 🔗 Webhooks
`/api/v1/webhooks/` — Full CRUD for webhook endpoints.

Configure outbound HTTP webhooks for platform events:
- `employee.created` / `employee.updated`
- `payroll.run.completed`
- `document.expired` / `document.expiring_soon`
- `compliance.overdue`

All deliveries are HMAC-SHA256 signed with `X-AuditShield-Signature` header. Automatic retry on failure.

---

## Tech Stack

### 🐍 Backend

| Technology | Version | Purpose |
|-----------|:-------:|---------|
| ![Python](https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white) **Python** | 3.12 | Runtime |
| ![Django](https://img.shields.io/badge/-Django-092E20?logo=django&logoColor=white) **Django** | 5.0 | Web framework |
| ![DRF](https://img.shields.io/badge/-DRF-a30000?logo=django&logoColor=white) **Django REST Framework** | 3.15 | REST API |
| ![Strawberry](https://img.shields.io/badge/-Strawberry_GraphQL-E10098?logo=graphql&logoColor=white) **Strawberry GraphQL** | 0.236 | GraphQL (Apollo-compatible) |
| ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-4169E1?logo=postgresql&logoColor=white) **PostgreSQL** | 16 | Primary database (Docker / self-hosted) |
| ![SQLite](https://img.shields.io/badge/-SQLite-003B57?logo=sqlite&logoColor=white) **SQLite** | 3 | Lightweight DB (Fly.io / CI) |
| ![Redis](https://img.shields.io/badge/-Redis-DC382D?logo=redis&logoColor=white) **Redis** | 7 | Celery message broker + cache |
| ![Celery](https://img.shields.io/badge/-Celery-37814A?logo=celery&logoColor=white) **Celery** + Beat | 5.3 | Async task queue + scheduler |
| **Gunicorn** gthread | — | Production WSGI server |
| **drf-spectacular** | 0.27 | Auto OpenAPI / Swagger docs |
| **WeasyPrint** | 61 | PDF report generation |
| **pytesseract** | 0.3 | OCR text extraction from documents |
| **cryptography** (Fernet) | 42 | AES-128 file encryption at rest |
| **django-axes** | 6.4 | Brute-force login protection |
| **Argon2** | — | Strongest password hashing |

### 🅰️ Frontend

| Technology | Version | Purpose |
|-----------|:-------:|---------|
| ![Angular](https://img.shields.io/badge/-Angular-DD0031?logo=angular&logoColor=white) **Angular** | 18 | SPA framework — standalone components + signals |
| ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white) **TypeScript** | 5 | Strict type-safe development |
| ![Material](https://img.shields.io/badge/-Angular_Material-757575?logo=materialdesign&logoColor=white) **Angular Material** | 18 | UI component library |
| ![Apollo](https://img.shields.io/badge/-Apollo_Angular-311C87?logo=apollographql&logoColor=white) **Apollo Angular** | 7 | GraphQL client |
| **RxJS** | 7 | Reactive streams & observables |

### 🏗️ Infrastructure

| Technology | Purpose |
|-----------|---------|
| ![Docker](https://img.shields.io/badge/-Docker-2496ED?logo=docker&logoColor=white) **Docker Compose** | Dev (7 services) + Production stacks |
| ![Nginx](https://img.shields.io/badge/-Nginx-009639?logo=nginx&logoColor=white) **Nginx** | Reverse proxy, SSL termination, static serving |
| ![Fly.io](https://img.shields.io/badge/-Fly.io-8b5cf6?logo=flydotio&logoColor=white) **Fly.io** | Backend cloud deployment with persistent volume |
| ![GitHub Actions](https://img.shields.io/badge/-GitHub_Actions-2088FF?logo=githubactions&logoColor=white) **GitHub Actions** | CI/CD — lint, test, coverage, auto-deploy |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User's Browser                           │
│               Angular 18 SPA  (TypeScript + Signals)           │
└────────────────────────────┬────────────────────────────────────┘
                             │  HTTPS
                ┌────────────▼────────────┐
                │      Nginx :80/:443     │
                │  /api/v1/* → Django     │
                │  /graphql/ → Django     │
                │  /*        → Angular    │
                └────────────┬────────────┘
                             │
          ┌──────────────────▼────────────────────────┐
          │    Django 5  +  DRF  +  Strawberry GQL   │
          │  ┌────────────────────────────────────┐   │
          │  │  JWT Auth │  Tenant  │  AuditLog  │   │
          │  │ middleware│  scoping │  middleware │   │
          │  └────────────────────────────────────┘   │
          │          REST API ──── GraphQL API         │
          └──────────┬───────────────────────────────┘
                     │
        ┌────────────┴─────────────┐
        │                          │
┌───────▼────────┐       ┌─────────▼───────┐
│  PostgreSQL 16 │       │    Redis 7       │
│  (app data)    │       │  broker + cache  │
└────────────────┘       └─────────┬───────┘
                                   │
                    ┌──────────────▼─────────────┐
                    │     Celery Workers + Beat   │
                    │  📄 OCR · 📊 PDF reports    │
                    │  📧 Emails · 💾 Backups     │
                    │  🔔 Reminders · 🧹 Cleanup  │
                    └────────────────────────────┘
```

---

## Quick Start (Docker)

> **Prerequisites**: Docker Desktop ≥ 24 with the Compose v2 plugin

```bash
# 1. Clone
git clone https://github.com/manziosee/auditshield.git
cd auditshield

# 2. Environment file
cp .env.example .env

# 3. Generate required secret keys
make gen-secret    # → paste as DJANGO_SECRET_KEY in .env
make gen-fernet    # → paste as FILE_ENCRYPTION_KEY in .env

# Also set DATABASE_URL in .env:
# DATABASE_URL=postgresql://auditshield:auditshield@db:5432/auditshield

# 4. Start the full stack (PostgreSQL + Redis + Django + Celery + Angular + Nginx)
make dev

# 5. Create your admin user
make createsuperuser

# 6. (Optional) Seed realistic demo data across all 18 modules
docker compose exec backend python manage.py seed_demo_data
# Login: admin@technova.com / Demo@12345

# 7. Open the app 🎉
```

| Service | URL |
|---------|-----|
| 🌐 **Frontend** | http://localhost:4200 |
| 🔌 **API** | http://localhost:8000/api/v1/ |
| 📖 **Swagger UI** | http://localhost:8000/api/docs/ |
| 🔗 **GraphiQL** | http://localhost:8000/graphql/ |
| 🌸 **Flower (Celery)** | http://localhost:5555 |

### Demo Credentials

After running `seed_demo_data`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@technova.com | Demo@12345 |
| HR | hr@technova.com | Demo@12345 |
| Accountant | accountant@technova.com | Demo@12345 |
| Auditor | auditor@technova.com | Demo@12345 |
| Employee | emp1@technova.com | Demo@12345 |

---

## Local Development (without Docker)

### Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements/development.txt

# In .env: set TURSO_DATABASE_URL=file:db.sqlite3  (remove DATABASE_URL line)
python manage.py migrate
python manage.py seed_global_data   # loads countries, currencies, authorities
python manage.py createsuperuser
python manage.py runserver          # → http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm start   # → http://localhost:4200
```

### Celery (optional — needed for PDF gen, OCR, email)

```bash
cd backend
celery -A auditshield worker --loglevel=info -Q default,documents,reports,notifications
celery -A auditshield beat   --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler
```

---

## Environment Variables

| Variable | Required | Description |
|----------|:--------:|-------------|
| `DJANGO_SECRET_KEY` | ✅ | Django secret key (50+ chars) |
| `FILE_ENCRYPTION_KEY` | ✅ | Fernet key — document encryption at rest |
| `DATABASE_URL` | 🐳 Docker | PostgreSQL `postgresql://user:pass@host/db` |
| `TURSO_DATABASE_URL` | ✈️ Fly.io/CI | SQLite `file:db.sqlite3` |
| `REDIS_URL` | ✅ | `redis://:password@host:6379/0` |
| `CELERY_BROKER_URL` | ✅ | Celery broker (Redis) |
| `DJANGO_ALLOWED_HOSTS` | 🚀 Prod | Comma-separated hostnames |
| `CORS_ALLOWED_ORIGINS` | 🚀 Prod | Comma-separated frontend origins |
| `EMAIL_HOST_USER` | optional | SMTP username |
| `EMAIL_HOST_PASSWORD` | optional | SMTP app password |
| `SENTRY_DSN` | optional | Sentry error tracking |
| `DB_NAME / DB_USER / DB_PASSWORD` | 🐳 Docker | PostgreSQL credentials |

---

## API Documentation

> All endpoints require `Authorization: Bearer <access_token>` except `/health/`, `/auth/register/`, `/auth/login/`.

### Login

```http
POST /api/v1/auth/login/
Content-Type: application/json

{ "email": "admin@company.com", "password": "yourpassword" }
```

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health/` | Health check — no auth |
| `POST` | `/api/v1/auth/register/` | Register company + admin |
| `POST` | `/api/v1/auth/login/` | Obtain JWT tokens |
| `GET/PATCH` | `/api/v1/companies/me/` | Company profile |
| `GET` | `/api/v1/companies/export/` | Export all company data |
| `GET/POST` | `/api/v1/employees/` | List / create employees |
| `GET/PATCH/DELETE` | `/api/v1/employees/{id}/` | Employee detail |
| `POST` | `/api/v1/employees/bulk-import/` | Import from Excel/CSV |
| `GET/POST` | `/api/v1/employees/departments/` | List / create departments |
| `GET/POST` | `/api/v1/documents/` | List / upload documents |
| `GET` | `/api/v1/documents/{id}/download/` | Download decrypted file |
| `DELETE` | `/api/v1/documents/{id}/` | Delete document |
| `GET` | `/api/v1/compliance/dashboard/` | Compliance score + stats |
| `GET/POST` | `/api/v1/compliance/records/` | List / create records |
| `PATCH/DELETE` | `/api/v1/compliance/records/{id}/` | Update / delete record |
| `GET` | `/api/v1/reports/` | List reports |
| `POST` | `/api/v1/reports/` | Generate report (async) |
| `POST` | `/api/v1/notifications/mark-all-read/` | Mark all read |
| `GET` | `/api/v1/notifications/unread-count/` | Unread count |
| `GET` | `/api/v1/audit-logs/` | Audit trail |
| `GET` | `/api/v1/geo/countries/` | Countries list |
| `GET` | `/api/v1/geo/currencies/` | Currencies list |

> 📦 **Postman collection** → [`postman_collection.json`](postman_collection.json)
>
> 📖 **Swagger** → `/api/docs/` · **ReDoc** → `/api/redoc/` · **GraphiQL** → `/graphql/`

---

## Deployment — Fly.io

```bash
# Install CLI
curl -L https://fly.io/install.sh | sh && flyctl auth login

# Create persistent SQLite volume
flyctl volumes create auditshield_data --region jnb --size 3 --config backend/fly.toml

# Set secrets
flyctl secrets set \
  DJANGO_SECRET_KEY="<generated>" \
  FILE_ENCRYPTION_KEY="<generated>" \
  DJANGO_ALLOWED_HOSTS="auditshield-backend.fly.dev" \
  CORS_ALLOWED_ORIGINS="https://your-frontend.fly.dev" \
  --config backend/fly.toml

# Deploy
flyctl deploy --config backend/fly.toml
```

**Auto-deploy on push to `main`**: Add `FLY_API_TOKEN` to GitHub repo secrets → (**Settings → Secrets → Actions**).

### Live Production URLs

| | URL |
|---|---|
| 🌐 **API Base** | https://auditshield-backend.fly.dev/api/v1/ |
| 📖 **Swagger UI** | https://auditshield-backend.fly.dev/api/docs/ |
| 📄 **ReDoc** | https://auditshield-backend.fly.dev/api/redoc/ |
| 🔗 **GraphiQL** | https://auditshield-backend.fly.dev/graphql/ |
| ❤️ **Health check** | https://auditshield-backend.fly.dev/health/ |

---

## Deployment — Docker Compose Production

```bash
git clone https://github.com/manziosee/auditshield.git && cd auditshield
cp .env.example .env  # fill in production values

docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
docker compose exec backend python manage.py createsuperuser
```

Place SSL certs in `nginx/ssl/` and configure your domain in `nginx/nginx.prod.conf`.

---

## User Roles

| Role | Access |
|------|--------|
| 👑 `super_admin` | Full platform access |
| 🔧 `admin` | Company admin — full access to own tenant |
| 👩‍💼 `hr` | Employees, documents, compliance |
| 🧾 `accountant` | Payroll, financial reports |
| 🔍 `auditor` | Read-only + audit logs |
| 👤 `employee` | Own profile and documents only |

---

## Project Structure

```
auditshield/
├── 🐍 backend/
│   ├── auditshield/settings/       # base / development / production
│   ├── apps/
│   │   ├── accounts/               # User + JWT auth
│   │   ├── companies/              # Company (tenant) + onboarding
│   │   ├── employees/              # Employee + Department
│   │   ├── documents/              # Encrypted upload + OCR
│   │   ├── compliance/             # Authority + Requirements + Records
│   │   ├── reports/                # PDF generation (WeasyPrint)
│   │   ├── notifications/          # In-app + email alerts
│   │   ├── audit_logs/             # Immutable activity trail
│   │   ├── geography/              # Country + Currency + ExchangeRate
│   │   └── payroll/                # TaxRule + PayrollRun + Payslip
│   ├── core/                       # Shared: TenantModel, middleware, utils
│   ├── Dockerfile.dev / Dockerfile.prod
│   ├── entrypoint.sh               # Fly.io startup script
│   └── fly.toml                    # Fly.io deployment config
│
├── 🅰️ frontend/src/app/
│   ├── core/                       # Guards, interceptors, services, models
│   ├── features/
│   │   ├── auth/                   # Login + Register pages
│   │   ├── dashboard/              # KPI cards + live charts
│   │   ├── employees/              # List, Detail, Form (CRUD)
│   │   ├── documents/              # List, Upload, Detail (CRUD)
│   │   ├── compliance/             # Tracker + Add/Edit/Delete
│   │   ├── reports/                # List + Generate
│   │   ├── notifications/          # Notification centre
│   │   ├── audit-logs/             # Audit log viewer
│   │   └── company/                # Company settings
│   └── shared/layout/              # Shell — sidebar + topbar
│
├── 🌐 nginx/                       # nginx.dev.conf / nginx.prod.conf
├── 💾 scripts/backup/              # GPG-encrypted backup + restore
├── ⚙️  .github/workflows/          # CI/CD pipelines
├── 🐳 docker-compose.yml           # Dev stack
├── 🐳 docker-compose.prod.yml      # Production overrides
├── 📦 postman_collection.json      # Full Postman API collection
├── 🔧 Makefile
└── 📋 .env.example
```

---

## Makefile Commands

```bash
make dev              # Start dev stack (docker compose up --build)
make stop             # Stop all services
make logs             # Tail all service logs
make migrate          # Run database migrations
make makemigrations   # Create new migrations
make shell            # Django shell_plus
make createsuperuser  # Create admin user
make seed             # Seed global countries, currencies, authorities
make test             # Run Django test suite
make lint             # Ruff linter
make coverage         # Tests with coverage report
make deploy           # Deploy backend to Fly.io
make build-prod       # Build production Docker images
make backup           # GPG-encrypted DB + media backup
make gen-secret       # Generate DJANGO_SECRET_KEY
make gen-fernet       # Generate FILE_ENCRYPTION_KEY
```

---

<div align="center">

**MIT License** — Copyright © 2026 [Osee Manzi](mailto:oseemanzi3@gmail.com)

_Built with ❤️ to make compliance accessible for every SME, everywhere._

</div>
