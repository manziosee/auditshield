from .base import *  # noqa: F401, F403

DEBUG = True

INSTALLED_APPS += ["debug_toolbar"]  # noqa: F405

MIDDLEWARE = ["debug_toolbar.middleware.DebugToolbarMiddleware"] + MIDDLEWARE  # noqa: F405

INTERNAL_IPS = ["127.0.0.1", "localhost"]

# Use console email in dev
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Relax CORS in dev
CORS_ALLOW_ALL_ORIGINS = True

# Show throttle errors clearly
REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"] = {  # noqa: F405
    "anon": "1000/min",
    "user": "1000/min",
    "auth": "100/min",
    "document_upload": "100/min",
}
