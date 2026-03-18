import time

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

from auditshield.graphql.context import AuthenticatedGraphQLView
from auditshield.schema import schema

API_V1 = "api/v1/"


def health_check(request):
    """Liveness/readiness probe for Fly.io, k8s, Docker health checks."""
    return JsonResponse({
        "status": "ok",
        "service": "auditshield-api",
        "timestamp": int(time.time()),
    })


def root_view(request):
    """Welcome message for root URL."""
    return JsonResponse({
        "message": "🛡️ AuditShield API — Keep your business audit-ready, anywhere in the world.",
        "version": "1.0.0",
        "docs": {
            "swagger": request.build_absolute_uri("/api/docs/"),
            "redoc": request.build_absolute_uri("/api/redoc/"),
            "graphql": request.build_absolute_uri("/graphql/"),
        },
        "endpoints": {
            "health": request.build_absolute_uri("/health/"),
            "api": request.build_absolute_uri("/api/v1/"),
        },
        "status": "operational",
    })


urlpatterns = [
    # ── Root welcome ───────────────────────────────────────────────────────────
    path("", root_view, name="root"),

    # ── Health check (no auth — required by Fly.io/load balancers) ────────────
    path("health/", health_check, name="health"),

    # Admin
    path("admin/", admin.site.urls),

    # ── GraphQL (Apollo-compatible) ────────────────────────────────────────────
    path(
        "graphql/",
        AuthenticatedGraphQLView.as_view(schema=schema),
        name="graphql",
    ),

    # ── REST API v1 ────────────────────────────────────────────────────────────
    path(API_V1 + "auth/",          include("apps.accounts.urls")),
    path(API_V1 + "companies/",     include("apps.companies.urls")),
    path(API_V1 + "employees/",     include("apps.employees.urls")),
    path(API_V1 + "documents/",     include("apps.documents.urls")),
    path(API_V1 + "compliance/",    include("apps.compliance.urls")),
    path(API_V1 + "reports/",       include("apps.reports.urls")),
    path(API_V1 + "notifications/", include("apps.notifications.urls")),
    path(API_V1 + "audit-logs/",    include("apps.audit_logs.urls")),
    path(API_V1 + "geo/",           include("apps.geography.urls")),
    path(API_V1 + "payroll/",       include("apps.payroll.urls")),
    path(API_V1 + "webhooks/",      include("apps.webhooks.urls")),

    # ── OpenAPI / Swagger (REST docs) ─────────────────────────────────────────
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/",   SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/",  SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]

if settings.DEBUG:
    import debug_toolbar
    urlpatterns += [path("__debug__/", include(debug_toolbar.urls))]
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
