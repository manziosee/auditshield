# 🛡️ AuditShield

**Rwanda's SME Digital Records & Compliance Platform**

AuditShield helps Rwandan small and medium enterprises manage employee records, contracts, and statutory compliance documents in one secure platform — so they stay audit-ready for inspections from the **Rwanda Revenue Authority (RRA)** and the **Rwanda Social Security Board (RSSB)**.

---

## 📌 The Problem

Many SMEs in Rwanda still:
- Store employee contracts in physical paper files
- Track PAYE, RSSB and health insurance contributions manually
- Lose critical compliance documents during office moves or staff turnover
- Panic and scramble during RRA or RSSB audits

This leads to fines, legal risk, and wasted time. AuditShield solves all of this.

---

## ✅ Core Features

| Feature | Description |
|---------|-------------|
| **Multi-tenant** | Every company gets a fully isolated data environment |
| **Employee Profiles** | Full records with contracts, salary, RSSB & TIN numbers |
| **Secure Document Vault** | AES-256 encrypted file storage — PDF, Excel, images |
| **OCR Extraction** | Text extracted automatically from scanned documents |
| **Excel / CSV Import** | Bulk-import employee data from spreadsheets |
| **Compliance Dashboard** | Real-time RRA / RSSB checklist with scoring |
| **Audit-Ready Reports** | One-click PDF export for auditors |
| **Smart Notifications** | Alerts for expiring documents and upcoming deadlines |
| **Role-Based Access** | Admin / HR / Accountant / Auditor / Employee roles |
| **Audit Trail** | Immutable log of every action in the system |
| **GraphQL API** | Full GraphQL API via Apollo / Strawberry alongside REST |

---

## 🏗️ Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| Framework | Django 5 + Django REST Framework |
| GraphQL | Strawberry GraphQL (Apollo-compatible) |
| Database | PostgreSQL 16 |
| Cache / Queue | Redis 7 |
| Async Tasks | Celery + Celery Beat |
| Auth | JWT (simplejwt) — rotate-on-refresh |
| Encryption | Fernet (AES-128-CBC + HMAC-SHA256) |
| OCR | Tesseract + PyMuPDF |
| PDF Reports | WeasyPrint |

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | Angular 18 (standalone components + signals) |
| Language | TypeScript (strict mode) |
| UI | Angular Material (Material 3) |
| GraphQL Client | Apollo Angular |
| Styling | SCSS + Material Design tokens |

### Infrastructure
| Component | Technology |
|-----------|-----------|
| Containerization | Docker + Docker Compose |
| Reverse Proxy | Nginx (HTTPS, rate limiting, CSP headers) |
| Backups | GPG AES-256 encrypted — DB + media, with rclone offsite option |
| Task Monitoring | Flower (Celery dashboard) |
| API Docs | Swagger / ReDoc (drf-spectacular) |

---

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 22+ (frontend dev only)
- GPG (for backup encryption)

### 1. Clone and configure

```bash
git clone https://github.com/oseemanzi/auditshield.git
cd auditshield
cp .env.example .env
```

Edit `.env` and fill in:

```bash
# Generate Django secret key
make gen-secret

# Generate file encryption key (Fernet)
make gen-fernet
```

### 2. Start the stack

```bash
make dev          # starts all services
make migrate      # run DB migrations
make createsuperuser
```

### 3. Access the app

| Service | URL |
|---------|-----|
| Application | http://localhost |
| API (REST) | http://localhost:8000/api/v1/ |
| GraphQL Playground | http://localhost:8000/graphql/ |
| API Docs (Swagger) | http://localhost:8000/api/docs/ |
| Flower (Celery) | http://localhost:5555 |
| MinIO Console | http://localhost:9001 (with `--profile s3`) |

---

## 📁 Project Structure

```
auditshield/
├── backend/
│   ├── auditshield/
│   │   ├── settings/
│   │   │   ├── base.py          # shared config
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   ├── celery.py            # scheduled tasks
│   │   ├── schema.py            # GraphQL root schema
│   │   └── urls.py
│   ├── apps/
│   │   ├── accounts/            # auth, users, JWT
│   │   ├── companies/           # multi-tenant companies
│   │   ├── employees/           # employee profiles
│   │   ├── documents/           # encrypted file vault
│   │   ├── compliance/          # RRA/RSSB checklists
│   │   ├── reports/             # PDF report generation
│   │   ├── notifications/       # reminders & alerts
│   │   └── audit_logs/          # immutable activity trail
│   ├── core/
│   │   ├── models.py            # UUIDModel, TenantModel
│   │   ├── middleware/          # audit + tenant middleware
│   │   └── utils/               # encryption, validators, pagination
│   └── requirements/
│       ├── base.txt
│       ├── development.txt
│       └── production.txt
│
├── frontend/
│   └── src/app/
│       ├── core/
│       │   ├── guards/          # authGuard, roleGuard
│       │   ├── interceptors/    # JWT auth interceptor
│       │   ├── models/          # TypeScript interfaces
│       │   └── services/        # API, Auth, Apollo GQL
│       ├── features/
│       │   ├── auth/            # login, register
│       │   ├── dashboard/       # KPI overview
│       │   ├── employees/       # employee CRUD + import
│       │   ├── documents/       # upload, list, download
│       │   ├── compliance/      # checklist tracker
│       │   ├── reports/         # PDF generation
│       │   ├── notifications/   # alerts center
│       │   ├── audit-logs/      # activity trail
│       │   └── company/         # company settings
│       └── shared/
│           └── layout/shell/    # sidebar + topbar
│
├── nginx/
│   ├── nginx.dev.conf
│   └── nginx.prod.conf
├── scripts/
│   └── backup/                  # encrypted backup scripts
├── docker-compose.yml
├── docker-compose.prod.yml
└── Makefile
```

---

## 🔐 Security Architecture

| Layer | Mechanism |
|-------|-----------|
| Authentication | JWT with rotate-on-refresh + token blacklist |
| Passwords | Argon2 hashing (strongest Django hasher) |
| Brute Force | django-axes — 5 failures → 15 min lockout |
| Data Isolation | Every query scoped to company via `TenantModel` |
| File Encryption | Fernet AES-128-CBC at rest, decrypt only on download |
| File Validation | MIME type checked via `python-magic` (not extension) |
| Audit Trail | Immutable log — every POST/PUT/PATCH/DELETE recorded |
| Transport | TLS 1.2/1.3 (production), HSTS, CSRF protection |
| Headers | CSP, X-Frame-Options DENY, X-Content-Type-Options |
| Rate Limiting | 5/min on auth endpoints, 60/min on general API |
| UUID PKs | All models use UUIDs — no sequential ID enumeration |

---

## 🔄 Scheduled Tasks (Celery Beat)

| Task | Schedule |
|------|----------|
| Full backup (DB + media, GPG encrypted) | Daily — 02:00 Africa/Kigali |
| Compliance deadline reminders | Every Monday — 09:00 |
| Document expiry checks + notifications | Daily — 08:00 |
| Expired JWT token cleanup | Every Sunday — 03:00 |

---

## 🛠️ Makefile Commands

```bash
# Development
make dev                  # start full docker stack
make stop                 # stop all containers
make logs                 # tail all logs
make logs-backend         # tail backend only

# Django
make migrate              # run migrations
make makemigrations       # create new migrations
make createsuperuser      # create admin user
make shell                # Django shell_plus

# Testing & Quality
make test                 # pytest with coverage
make lint                 # ruff + mypy
make format               # ruff format

# Backup
make backup               # manual full backup
make backup-db            # DB only
make restore-db BACKUP_FILE=path/to/file.gpg

# Production
make prod-up              # start production stack
make prod-migrate         # migrate in production

# Secrets
make gen-secret           # generate Django SECRET_KEY
make gen-fernet           # generate FILE_ENCRYPTION_KEY
```

---

## 🌍 Target Users

- Small & Medium Enterprises (SMEs) across Rwanda
- NGOs and non-profits
- Accounting firms managing multiple clients
- HR consultancies

---

## 🗺️ Roadmap

- [ ] Digital signature on contracts (DocuSign / local signing)
- [ ] Two-factor authentication (TOTP)
- [ ] Mobile app (PWA)
- [ ] Public API for accounting software integrations
- [ ] WhatsApp / SMS compliance reminders
- [ ] Multi-language support (Kinyarwanda, French, English)
- [ ] RRA e-Tax direct filing integration

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

Copyright (c) 2026 Osee Manzi
