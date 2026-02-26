import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "auditshield.settings.production")

_django_app = get_wsgi_application()

_HEALTH_RESPONSE = b'{"status":"ok","service":"auditshield-api"}'


def application(environ, start_response):
    # Intercept Fly.io / Consul health checks before Django's ALLOWED_HOSTS
    # validation runs. The probe uses the internal machine IP as the Host
    # header, which would otherwise produce DisallowedHost errors.
    if environ.get("PATH_INFO") == "/health/":
        start_response(
            "200 OK",
            [
                ("Content-Type", "application/json"),
                ("Content-Length", str(len(_HEALTH_RESPONSE))),
            ],
        )
        return [_HEALTH_RESPONSE]
    return _django_app(environ, start_response)
