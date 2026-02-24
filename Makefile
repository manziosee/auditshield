# ─── AuditShield Makefile ─────────────────────────────────────────────────────
.PHONY: help dev prod stop logs shell migrate makemigrations createsuperuser \
        test lint format backup restore build clean

COMPOSE        = docker-compose
COMPOSE_PROD   = docker-compose -f docker-compose.yml -f docker-compose.prod.yml
BACKEND        = $(COMPOSE) exec backend
BACKEND_RUN    = $(COMPOSE) run --rm backend

help:           ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	  awk 'BEGIN{FS=":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ── Development ───────────────────────────────────────────────────────────────
dev:            ## Start development stack
	$(COMPOSE) up --build

dev-bg:         ## Start dev stack in background
	$(COMPOSE) up --build -d

stop:           ## Stop all containers
	$(COMPOSE) down

logs:           ## Tail logs (all services)
	$(COMPOSE) logs -f

logs-backend:   ## Tail backend logs only
	$(COMPOSE) logs -f backend

# ── Django management ─────────────────────────────────────────────────────────
shell:          ## Django shell
	$(BACKEND) python manage.py shell_plus

migrate:        ## Run migrations
	$(BACKEND) python manage.py migrate

makemigrations: ## Make migrations
	$(BACKEND) python manage.py makemigrations

createsuperuser: ## Create superuser
	$(BACKEND) python manage.py createsuperuser

collectstatic:  ## Collect static files
	$(BACKEND) python manage.py collectstatic --noinput

# ── Testing & Quality ─────────────────────────────────────────────────────────
test:           ## Run all backend tests
	$(BACKEND_RUN) pytest --cov=. --cov-report=term-missing -v

test-fast:      ## Run tests without coverage
	$(BACKEND_RUN) pytest -x -q

lint:           ## Lint backend code (ruff + mypy)
	$(BACKEND_RUN) ruff check .
	$(BACKEND_RUN) mypy .

format:         ## Format code (ruff + black)
	$(BACKEND_RUN) ruff format .
	$(BACKEND_RUN) ruff check --fix .

# ── Backup & Restore ──────────────────────────────────────────────────────────
backup:         ## Manual backup (DB + media)
	$(BACKEND) python manage.py backup_now

backup-db:      ## Backup database only
	bash scripts/backup/backup_db.sh

restore-db:     ## Restore database from file (BACKUP_FILE=path/to/file.sql.gz)
	bash scripts/backup/restore_db.sh $(BACKUP_FILE)

# ── Production ────────────────────────────────────────────────────────────────
prod-up:        ## Start production stack
	$(COMPOSE_PROD) up -d --build

prod-down:      ## Stop production stack
	$(COMPOSE_PROD) down

prod-logs:      ## Production logs
	$(COMPOSE_PROD) logs -f

prod-migrate:   ## Run migrations in production
	$(COMPOSE_PROD) exec backend python manage.py migrate --noinput

# ── Build & Clean ─────────────────────────────────────────────────────────────
build:          ## Build all images
	$(COMPOSE) build

clean:          ## Remove containers, volumes (DESTRUCTIVE — ask first)
	@echo "This will DELETE all data. Continue? [y/N]" && read ans && [ $${ans:-N} = y ]
	$(COMPOSE) down -v --remove-orphans

# ── Database utils ────────────────────────────────────────────────────────────
psql:           ## Connect to PostgreSQL shell
	$(COMPOSE) exec db psql -U $${POSTGRES_USER:-auditshield_user} -d $${POSTGRES_DB:-auditshield_db}

redis-cli:      ## Connect to Redis CLI
	$(COMPOSE) exec redis redis-cli

# ── Secrets ───────────────────────────────────────────────────────────────────
gen-secret:     ## Generate Django secret key
	python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

gen-fernet:     ## Generate Fernet encryption key
	python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
