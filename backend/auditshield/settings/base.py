"""
AuditShield Base Settings
Shared across all environments. Do NOT store secrets here.
"""
from datetime import timedelta
from pathlib import Path

import environ

BASE_DIR = Path(__file__).resolve().parent.parent.parent

env = environ.Env(
    DEBUG=(bool, False),
)

# Read .env file if present (dev convenience)
environ.Env.read_env(BASE_DIR / ".env")

SECRET_KEY = env("DJANGO_SECRET_KEY")
DEBUG = env("DEBUG")
ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=["localhost", "127.0.0.1"])

# ─── Application definition ───────────────────────────────────────────────────
DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "django_filters",
    "django_extensions",
    "drf_spectacular",
    "django_celery_beat",
    "django_celery_results",
    "axes",
    # GraphQL (Strawberry — Apollo-compatible)
    "strawberry_django",
]

LOCAL_APPS = [
    "core",
    "apps.geography",
    "apps.accounts",
    "apps.companies",
    "apps.employees",
    "apps.documents",
    "apps.compliance",
    "apps.reports",
    "apps.notifications",
    "apps.audit_logs",
    "apps.payroll",
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# ─── Middleware ───────────────────────────────────────────────────────────────
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "axes.middleware.AxesMiddleware",              # brute-force lockout
    "core.middleware.audit.AuditLogMiddleware",    # activity logging
    "core.middleware.tenant.TenantMiddleware",     # multi-tenancy
]

ROOT_URLCONF = "auditshield.urls"
WSGI_APPLICATION = "auditshield.wsgi.application"
ASGI_APPLICATION = "auditshield.asgi.application"

# ─── Database ─────────────────────────────────────────────────────────────────
# Priority order:
#   1. DATABASE_URL  — PostgreSQL for Docker Compose / production self-hosted
#   2. TURSO_DATABASE_URL — SQLite for CI or Fly.io (file:/data/db.sqlite3)
#   3. Fallback: local SQLite file:db.sqlite3
_pg_url = env("DATABASE_URL", default="")

if _pg_url:
    import dj_database_url
    DATABASES = {"default": dj_database_url.parse(_pg_url, conn_max_age=60)}
else:
    _db_url = env("TURSO_DATABASE_URL", default="file:db.sqlite3")
    _sqlite_path = _db_url.removeprefix("file:") if _db_url.startswith("file:") else "db.sqlite3"
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / _sqlite_path,
        }
    }

# ─── Custom User Model ────────────────────────────────────────────────────────
AUTH_USER_MODEL = "accounts.User"

# ─── Password Validation ──────────────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 10}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.Argon2PasswordHasher",   # most secure
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
]

# ─── Internationalization ─────────────────────────────────────────────────────
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# ─── Static & Media ───────────────────────────────────────────────────────────
STATIC_URL = "/static/"
STATIC_ROOT = env("STATIC_ROOT", default=str(BASE_DIR / "staticfiles"))
STATICFILES_DIRS = [BASE_DIR / "static"]

MEDIA_URL = "/media/"
MEDIA_ROOT = env("MEDIA_ROOT", default=str(BASE_DIR / "media"))

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ─── Templates ────────────────────────────────────────────────────────────────
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# ─── REST Framework ───────────────────────────────────────────────────────────
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_PAGINATION_CLASS": "core.utils.pagination.StandardPagination",
    "PAGE_SIZE": 25,
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "20/min",
        "user": "60/min",
        "auth": "5/min",          # login / token endpoints
        "document_upload": "10/min",
    },
    "EXCEPTION_HANDLER": "core.utils.exceptions.custom_exception_handler",
}

# ─── JWT ──────────────────────────────────────────────────────────────────────
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=env.int("JWT_ACCESS_TOKEN_LIFETIME_MINUTES", default=30)),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=env.int("JWT_REFRESH_TOKEN_LIFETIME_DAYS", default=7)),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "TOKEN_OBTAIN_SERIALIZER": "apps.accounts.serializers.CustomTokenObtainPairSerializer",
}

# ─── CORS ─────────────────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=["http://localhost:3000"])
CORS_ALLOW_CREDENTIALS = True

# ─── Redis / Cache ────────────────────────────────────────────────────────────
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": env("REDIS_URL", default="redis://redis:6379/0"),
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "SOCKET_CONNECT_TIMEOUT": 5,
            "SOCKET_TIMEOUT": 5,
        },
    }
}

SESSION_ENGINE = "django.contrib.sessions.backends.cache"
SESSION_CACHE_ALIAS = "default"
SESSION_COOKIE_AGE = env.int("SESSION_COOKIE_AGE", default=3600)

# ─── Celery ───────────────────────────────────────────────────────────────────
CELERY_BROKER_URL = env("CELERY_BROKER_URL", default="redis://redis:6379/1")
CELERY_RESULT_BACKEND = "django-db"
CELERY_CACHE_BACKEND = "default"
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = TIME_ZONE
CELERY_BEAT_SCHEDULER = "django_celery_beat.schedulers:DatabaseScheduler"
CELERY_TASK_ROUTES = {
    "apps.documents.*": {"queue": "documents"},
    "apps.reports.*": {"queue": "reports"},
    "apps.notifications.*": {"queue": "notifications"},
}

# ─── Email ────────────────────────────────────────────────────────────────────
EMAIL_BACKEND = env("EMAIL_BACKEND", default="django.core.mail.backends.console.EmailBackend")
EMAIL_HOST = env("EMAIL_HOST", default="")
EMAIL_PORT = env.int("EMAIL_PORT", default=587)
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default="")
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", default="AuditShield <noreply@auditshield.io>")

# ─── File Upload ──────────────────────────────────────────────────────────────
MAX_UPLOAD_SIZE_MB = env.int("MAX_UPLOAD_SIZE_MB", default=50)
DATA_UPLOAD_MAX_MEMORY_SIZE = MAX_UPLOAD_SIZE_MB * 1024 * 1024
FILE_UPLOAD_MAX_MEMORY_SIZE = DATA_UPLOAD_MAX_MEMORY_SIZE
ALLOWED_UPLOAD_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/tiff",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",  # xlsx
    "application/vnd.ms-excel",    # xls
    "text/csv",
]

# ─── File Encryption ──────────────────────────────────────────────────────────
FILE_ENCRYPTION_KEY = env("FILE_ENCRYPTION_KEY", default="")

# ─── Brute-force Protection (django-axes) ─────────────────────────────────────
AXES_FAILURE_LIMIT = 5
AXES_COOLOFF_TIME = timedelta(minutes=15)
AXES_LOCKOUT_TEMPLATE = None
AXES_RESET_ON_SUCCESS = True
AXES_BACKEND_ORDER = ["axes.backends.AxesStandaloneBackend"]

AUTHENTICATION_BACKENDS = [
    "axes.backends.AxesStandaloneBackend",
    "django.contrib.auth.backends.ModelBackend",
]

# ─── Logging ──────────────────────────────────────────────────────────────────
# Ensure the log directory exists before Django's logging config runs.
# On Fly.io the image has no pre-created /app/logs, so we create it here.
_LOG_DIR = BASE_DIR / "logs"
_LOG_DIR.mkdir(parents=True, exist_ok=True)

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {process:d} {thread:d} {message}",
            "style": "{",
        },
        "simple": {"format": "{levelname} {message}", "style": "{"},
    },
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "verbose"},
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": BASE_DIR / "logs" / "auditshield.log",
            "maxBytes": 10 * 1024 * 1024,  # 10 MB
            "backupCount": 5,
            "formatter": "verbose",
        },
    },
    "root": {"handlers": ["console"], "level": "INFO"},
    "loggers": {
        "django": {"handlers": ["console"], "level": "WARNING", "propagate": False},
        "auditshield": {"handlers": ["console", "file"], "level": "DEBUG", "propagate": False},
        "celery": {"handlers": ["console"], "level": "INFO", "propagate": False},
    },
}

# ─── API Docs (drf-spectacular) ───────────────────────────────────────────────
SPECTACULAR_SETTINGS = {
    "TITLE": "AuditShield API",
    "DESCRIPTION": (
        "## AuditShield — Global SME Compliance Platform\n\n"
        "A multi-tenant API for businesses worldwide to manage employee records, "
        "encrypted documents, payroll, and regulatory compliance obligations.\n\n"
        "### Authentication\n"
        "All endpoints (except `/auth/login/` and `/companies/onboard/`) require a "
        "**Bearer JWT** token in the `Authorization` header.\n\n"
        "```\nAuthorization: Bearer <access_token>\n```\n\n"
        "Obtain tokens via `POST /api/v1/auth/login/`. "
        "Refresh via `POST /api/v1/auth/refresh/`.\n\n"
        "### Multi-tenancy\n"
        "Every resource is automatically scoped to the authenticated user's company. "
        "You cannot access another company's data.\n\n"
        "### Multi-country\n"
        "Compliance requirements, tax rules, and currencies are all country-aware. "
        "Each company is linked to a Country which drives its authority tree, tax brackets, "
        "and default currency.\n\n"
        "### GraphQL\n"
        "A GraphQL endpoint is also available at `/graphql/` (Apollo-compatible, Strawberry)."
    ),
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "CONTACT": {
        "name": "AuditShield Support",
        "email": "support@auditshield.io",
        "url": "https://auditshield.io",
    },
    "LICENSE": {"name": "MIT", "url": "https://opensource.org/licenses/MIT"},
    "SERVERS": [
        {"url": "https://auditshield-backend.fly.dev", "description": "Production"},
        {"url": "http://localhost:8000", "description": "Local Development"},
    ],
    # JWT Bearer security scheme
    "SECURITY": [{"jwtAuth": []}],
    "COMPONENTS": {
        "securitySchemes": {
            "jwtAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
                "description": "Paste your JWT access token (obtained from /api/v1/auth/login/).",
            }
        }
    },
    # Group endpoints by tag in Swagger UI
    "TAGS": [
        {"name": "auth", "description": "Authentication — login, refresh, logout, password change"},
        {"name": "users", "description": "User management within a company"},
        {"name": "companies", "description": "Company onboarding and settings"},
        {"name": "employees", "description": "Employee profiles, bulk import, and Excel export"},
        {"name": "departments", "description": "Departments within a company"},
        {"name": "documents", "description": "Encrypted document vault with OCR and expiry tracking"},
        {"name": "compliance", "description": "Regulatory compliance records, authority tracking, and audit readiness dashboard"},
        {"name": "reports", "description": "Async PDF report generation and download"},
        {"name": "notifications", "description": "In-app notification feed"},
        {"name": "audit-logs", "description": "Immutable activity trail (read-only)"},
    ],
    "SCHEMA_PATH_PREFIX": r"/api/v1/",
    "SORT_OPERATIONS": False,
    "ENUM_GENERATE_CHOICE_DESCRIPTION": True,
    "POSTPROCESSING_HOOKS": [
        "drf_spectacular.hooks.postprocess_schema_enums",
    ],
}
