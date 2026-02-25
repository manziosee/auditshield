<div align="center">
  <img src="frontend/public/logo.svg" width="80" height="80" alt="AuditShield Logo">
  <h1>AuditShield</h1>
  <p><strong>SME Digital Records &amp; Compliance Platform</strong></p>
  <p>Keep your business audit-ready. Manage employees, encrypted documents,<br>and statutory compliance obligations — all in one secure multi-tenant SaaS.</p>

  <!-- CI badges -->
  <a href="https://github.com/manziosee/auditshield/actions/workflows/django.yml">
    <img src="https://github.com/manziosee/auditshield/actions/workflows/django.yml/badge.svg" alt="Backend CI">
  </a>&nbsp;
  <a href="https://github.com/manziosee/auditshield/actions/workflows/frontend.yml">
    <img src="https://github.com/manziosee/auditshield/actions/workflows/frontend.yml/badge.svg" alt="Frontend CI">
  </a>&nbsp;
  <a href="https://github.com/manziosee/auditshield/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-22c55e?style=flat-square" alt="License MIT">
  </a>

  <br><br>

  <!-- Stack badges -->
  <img src="https://img.shields.io/badge/Python-3.11%2B-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/Django-5.0-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django">
  <img src="https://img.shields.io/badge/Angular-18-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <br>
  <img src="https://img.shields.io/badge/Turso-libSQL-4FF8D2?style=for-the-badge&logo=sqlite&logoColor=black" alt="Turso">
  <img src="https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis">
  <img src="https://img.shields.io/badge/Celery-5.x-37814A?style=for-the-badge&logo=celery&logoColor=white" alt="Celery">
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/GraphQL-Strawberry-E10098?style=for-the-badge&logo=graphql&logoColor=white" alt="GraphQL">
</div>

---

## 📋 Table of Contents

- [The Problem](#-the-problem)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Security](#-security-architecture)
- [Scheduled Tasks](#-scheduled-tasks)
- [Deployment](#-deployment)
- [Makefile](#%EF%B8%8F-makefile-commands)
- [Roadmap](#%EF%B8%8F-roadmap)
- [License](#-license)

---

## 🔥 The Problem

Many small and medium businesses still:

- 📁 Store employee contracts in physical files that get lost
- 🧮 Track PAYE, RSSB and VAT manually in spreadsheets
- 😰 Panic and scramble when tax or social security audits arrive
- ⚠️ Miss compliance deadlines and face avoidable penalties

**AuditShield eliminates all of this** — giving every company a fully encrypted, audit-ready digital records system from day one.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🏢 **Multi-tenant** | Fully isolated data environment per company |
| 👥 **Employee Management** | Complete profiles — contracts, salary, statutory numbers, bulk Excel import |
| 🔒 **Encrypted Document Vault** | Fernet AES-128 at rest — PDF, Excel, images; decrypt only on download |
| 🔍 **OCR Extraction** | Tesseract + PyMuPDF auto-extract text from scanned documents |
| 📊 **Compliance Dashboard** | Real-time RRA / RSSB / Labor Law checklist with scoring |
| 📄 **Async PDF Reports** | Audit-readiness, payroll summaries — generated in background |
| 🔔 **Smart Notifications** | Alerts for expiring documents, overdue compliance, contract renewals |
| 🛡️ **Role-Based Access** | super\_admin → admin → hr → accountant → auditor → employee |
| 📜 **Immutable Audit Trail** | Every mutation logged — tamper-proof evidence for inspectors |
| 🌐 **REST + GraphQL** | Full DRF REST (Swagger) and Strawberry GraphQL (Apollo-compatible) |
| ⚡ **Async Task Queue** | Celery workers for OCR, PDF generation, email notifications |
| 🌍 **Global-Ready** | Works for any company worldwide — not only Rwanda |

---

## 🛠️ Tech Stack

### Backend

| Layer | Technology | Badge |
|-------|-----------|-------|
| Framework | Django 5 + DRF | ![Django](https://img.shields.io/badge/Django-5-092E20?style=flat-square&logo=django) |
| GraphQL | Strawberry (Apollo-compatible) | ![GraphQL](https://img.shields.io/badge/Strawberry-GraphQL-E10098?style=flat-square&logo=graphql) |
| Database | Turso (distributed libSQL / SQLite) | ![Turso](https://img.shields.io/badge/Turso-libSQL-4FF8D2?style=flat-square) |
| Cache & Broker | Redis 7 | ![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis) |
| Async Tasks | Celery 5 + Beat | ![Celery](https://img.shields.io/badge/Celery-5-37814A?style=flat-square) |
| Auth | JWT rotate-on-refresh + blacklist | ![JWT](https://img.shields.io/badge/JWT-simplejwt-black?style=flat-square) |
| File Encryption | Fernet AES-128-CBC + HMAC-SHA256 | ![Crypto](https://img.shields.io/badge/Fernet-AES128-6B40B0?style=flat-square) |
| OCR | Tesseract + PyMuPDF | ![OCR](https://img.shields.io/badge/Tesseract-OCR-4A90D9?style=flat-square) |
| PDF Reports | WeasyPrint + ReportLab | ![PDF](https://img.shields.io/badge/WeasyPrint-PDF-FF6B6B?style=flat-square) |
| API Docs | drf-spectacular (Swagger + ReDoc) | ![Swagger](https://img.shields.io/badge/Swagger-OpenAPI-85EA2D?style=flat-square&logo=swagger) |
| Password Hashing | Argon2 (GPU-resistant) | ![Argon2](https://img.shields.io/badge/Argon2-Hashing-FF8C00?style=flat-square) |
| Brute Force | django-axes (5 failures → 15 min lockout) | ![Axes](https://img.shields.io/badge/django--axes-Security-red?style=flat-square) |

### Frontend

| Layer | Technology | Badge |
|-------|-----------|-------|
| Framework | Angular 18 (standalone + signals) | ![Angular](https://img.shields.io/badge/Angular-18-DD0031?style=flat-square&logo=angular) |
| Language | TypeScript 5 strict | ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript) |
| UI Library | Angular Material 3 | ![Material](https://img.shields.io/badge/Material-3-757575?style=flat-square&logo=materialdesign) |
| GraphQL Client | Apollo Angular | ![Apollo](https://img.shields.io/badge/Apollo-Angular-311C87?style=flat-square&logo=apollographql) |
| Charts | ng2-charts + Chart.js | ![Charts](https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chartdotjs) |
| Deployment | Vercel | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel) |

### Infrastructure

| Component | Technology | Badge |
|-----------|-----------|-------|
| Containers | Docker + Compose | ![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker) |
| Reverse Proxy | Nginx 1.25 | ![Nginx](https://img.shields.io/badge/Nginx-1.25-009639?style=flat-square&logo=nginx) |
| CI / CD | GitHub Actions | ![GHA](https://img.shields.io/badge/GitHub%20Actions-2088FF?style=flat-square&logo=githubactions) |
| Task Monitor | Flower | ![Flower](https://img.shields.io/badge/Flower-Celery%20UI-37814A?style=flat-square) |
| Object Storage | MinIO (optional S3-compatible) | ![MinIO](https://img.shields.io/badge/MinIO-S3-C72E49?style=flat-square) |

---

## 🏗️ Architecture

```
                    ┌─────────────────────────────────────────┐
                    │         Nginx  (Port 80 / 443)          │
                    │  Rate-limit · CSP · HTTPS redirect      │
                    └────────┬───────────────────┬────────────┘
                             │                   │
          ┌──────────────────▼──┐      ┌─────────▼───────────────────┐
          │   Angular Frontend  │      │  Django API  (Port 8000)    │
          │   Vercel / Port 4200│      │  REST  /api/v1/             │
          │   Apollo · Signals  │      │  GraphQL  /graphql/         │
          └─────────────────────┘      │  Swagger  /api/docs/        │
                                       └──────┬──────────────────────┘
                                              │
              ┌───────────────────────────────┼──────────────────────┐
              │                               │                      │
    ┌─────────▼──────────┐       ┌────────────▼──────┐   ┌──────────▼──────┐
    │  Turso (libSQL)    │       │  Redis 7           │   │  Celery Workers │
    │  Distributed SQLite│       │  Cache · Sessions  │   │  OCR · PDF      │
    │  ← file: for CI    │       │  Celery Broker     │   │  Emails         │
    └────────────────────┘       └───────────────────┘   └──────────┬──────┘
                                                                     │
                                                          ┌──────────▼──────┐
                                                          │  Celery Beat    │
                                                          │  · Backup 2 AM  │
                                                          │  · Reminders    │
                                                          │  · Expiry check │
                                                          └─────────────────┘
```

### Multi-tenant Isolation

Every model extends `TenantModel` which enforces a `company` FK. `TenantMiddleware` attaches `request.company` on every request. All querysets are automatically scoped — no cross-tenant data leakage is possible at the ORM level.

---

## 🚀 Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose v2
- [Node.js 20+](https://nodejs.org/) (frontend dev only)

### 1. Clone and configure

```bash
git clone https://github.com/manziosee/auditshield.git
cd auditshield
cp .env.example .env
```

Fill in the key secrets:

```bash
# Django secret key
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Fernet key for file encryption
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

```ini
# .env — minimum required
DJANGO_SECRET_KEY=<50-char-random-string>
TURSO_DATABASE_URL=libsql://your-db.turso.io    # or file:db.sqlite3 for local dev
TURSO_AUTH_TOKEN=<turso-jwt-token>
FILE_ENCRYPTION_KEY=<fernet-key>
REDIS_URL=redis://redis:6379/0
```

### 2. Start the stack

```bash
make dev              # docker compose up --build -d
make migrate          # run all migrations
make createsuperuser  # create first admin user
```

### 3. Access the services

| Service | URL |
|---------|-----|
| App (Nginx) | http://localhost |
| Frontend dev | http://localhost:4200 |
| REST API | http://localhost:8000/api/v1/ |
| **Swagger UI** | **http://localhost:8000/api/docs/** |
| ReDoc | http://localhost:8000/api/redoc/ |
| GraphQL | http://localhost:8000/graphql/ |
| Flower | http://localhost:5555 |

---

## 📡 API Reference

All endpoints require `Authorization: Bearer <access_token>` unless marked ❌.

### Authentication `/api/v1/auth/`

| Method | Endpoint | Auth |
|--------|----------|------|
| `POST` | `/login/` | ❌ |
| `POST` | `/refresh/` | ❌ |
| `POST` | `/logout/` | ✅ |
| `GET/PUT/PATCH` | `/me/` | ✅ |
| `POST` | `/change-password/` | ✅ |
| `GET/POST` | `/users/` | ✅ Admin |

### Companies `/api/v1/companies/`

| Method | Endpoint | Auth |
|--------|----------|------|
| `POST` | `/onboard/` | ❌ |
| `GET/PUT/PATCH` | `/profile/` | ✅ |

### Employees `/api/v1/employees/`

| Method | Endpoint |
|--------|----------|
| `GET/POST` | `/` — list (paginated, filterable) / create |
| `GET/PUT/PATCH/DELETE` | `/{id}/` |
| `POST` | `/bulk_import/` — Excel/CSV import |
| `GET` | `/export/` — download as Excel |
| `GET/POST` | `/departments/` |
| `GET/PUT/PATCH/DELETE` | `/departments/{id}/` |

### Documents `/api/v1/documents/`

| Method | Endpoint |
|--------|----------|
| `GET/POST` | `/` — list / upload (Fernet encrypted + async OCR) |
| `GET/PUT/PATCH/DELETE` | `/{id}/` |
| `GET` | `/{id}/download/` — decrypt and stream |
| `GET` | `/{id}/preview_text/` — OCR result |

**Filters**: `document_type`, `status`, `employee`, `expiring_soon`, `search`

### Compliance `/api/v1/compliance/`

| Method | Endpoint |
|--------|----------|
| `GET` | `/dashboard/` — score + stats |
| `GET/POST` | `/records/` |
| `GET/PUT/PATCH/DELETE` | `/records/{id}/` |
| `GET` | `/requirements/` — global requirement library |
| `GET` | `/categories/` — RRA, RSSB, Labor Law, etc. |

### Reports `/api/v1/reports/`

| Method | Endpoint |
|--------|----------|
| `GET/POST` | `/` — list / request async generation |
| `GET` | `/{id}/` — poll `is_ready` |
| `GET` | `/{id}/download/` — download PDF (202 if pending) |
| `DELETE` | `/{id}/` |

### Notifications `/api/v1/notifications/`

| Method | Endpoint |
|--------|----------|
| `GET` | `/` — my notifications |
| `PATCH` | `/{id}/` — mark read |
| `POST` | `/mark_all_read/` |
| `GET` | `/unread_count/` — badge count |

### Audit Logs `/api/v1/audit-logs/`

| Method | Endpoint |
|--------|----------|
| `GET` | `/` — immutable read-only trail |

> Full interactive docs at **`/api/docs/`** (Swagger UI) and **`/api/redoc/`**.

---

## 🔐 Security Architecture

| Layer | Mechanism |
|-------|-----------|
| **Auth** | JWT rotate-on-refresh + simplejwt token blacklist |
| **Passwords** | Argon2 (GPU-resistant — strongest Django hasher) |
| **Brute Force** | django-axes — 5 failures → 15 min IP lockout |
| **Multi-tenancy** | Every query scoped via `TenantModel` company FK |
| **File Encryption** | Fernet AES-128-CBC at rest — decrypt in-memory only |
| **File Validation** | MIME type via `python-magic` — not file extension |
| **Audit Trail** | Immutable — every mutation stored, can never be edited |
| **Transport** | TLS 1.2/1.3, HSTS preload, CSRF protection |
| **HTTP Headers** | CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` |
| **Rate Limiting** | 5/min on auth endpoints, 60/min authenticated users |
| **UUID PKs** | All models — prevents sequential ID enumeration |

---

## 🔄 Scheduled Tasks

| Task | Schedule |
|------|----------|
| Document expiry check + notifications | Daily 08:00 Africa/Kigali |
| Compliance deadline reminders | Every Monday 09:00 |
| Expired JWT token cleanup | Every Sunday 03:00 |

---

## 📁 Project Structure

```
auditshield/
├── backend/
│   ├── auditshield/settings/{base,development,production}.py
│   ├── apps/
│   │   ├── accounts/       # User, JWT, RBAC
│   │   ├── companies/      # Multi-tenant Company
│   │   ├── employees/      # Employee + Department + bulk import
│   │   ├── documents/      # Encrypted vault + OCR
│   │   ├── compliance/     # RRA/RSSB/Labor Law checklists
│   │   ├── reports/        # Async PDF reports
│   │   ├── notifications/  # Alerts + email
│   │   └── audit_logs/     # Immutable trail
│   ├── core/               # UUIDModel, TenantModel, middleware, utils
│   └── requirements/{base,development,production}.txt
│
├── frontend/               # Angular 18 SPA
│   └── src/app/
│       ├── core/           # guards, interceptors, services, models
│       ├── features/       # auth, dashboard, employees, documents…
│       └── shared/layout/  # shell (sidebar + topbar)
│
├── nginx/
├── .github/workflows/      # Backend CI + Frontend CI
├── docker-compose.yml
└── Makefile
```

---

## 🚢 Deployment

### Frontend — Vercel

Connect GitHub repo → set root directory to `frontend` → deploy. The `vercel.json` handles SPA routing automatically.

### Backend — Docker

```bash
# Production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
docker compose exec backend python manage.py migrate --settings=auditshield.settings.production
```

Production env extras:

```ini
DJANGO_SETTINGS_MODULE=auditshield.settings.production
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=<jwt>
SENTRY_DSN=https://...@sentry.io/...
```

---

## 🛠️ Makefile Commands

```bash
make dev              # start full docker stack
make stop             # stop all containers
make logs             # tail all logs
make migrate          # run migrations
make makemigrations   # create new migrations
make createsuperuser  # create super admin
make shell            # Django shell_plus
make test             # run test suite
make lint             # ruff + mypy
make format           # ruff format
make gen-secret       # generate DJANGO_SECRET_KEY
make gen-fernet       # generate FILE_ENCRYPTION_KEY
```

---

## 🗺️ Roadmap

- [ ] Two-factor authentication (TOTP)
- [ ] Digital signature on contracts
- [ ] Mobile PWA (offline support)
- [ ] WhatsApp / SMS compliance reminders
- [ ] Multi-language (Kinyarwanda, French, English, Arabic)
- [ ] Direct e-Tax filing integration
- [ ] Payroll module with bank transfer export
- [ ] Public API for accounting software integrations

---

## 📄 License

MIT License — Copyright © 2026 [Osee Manzi](mailto:oseemanzi3@gmail.com)

---

<div align="center">
  <sub>Built with ❤️ for SMEs worldwide — from Rwanda to the world.</sub>
</div>
