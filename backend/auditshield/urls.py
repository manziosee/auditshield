from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

API_V1 = "api/v1/"

urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),

    # API v1
    path(API_V1 + "auth/",        include("apps.accounts.urls")),
    path(API_V1 + "companies/",   include("apps.companies.urls")),
    path(API_V1 + "employees/",   include("apps.employees.urls")),
    path(API_V1 + "documents/",   include("apps.documents.urls")),
    path(API_V1 + "compliance/",  include("apps.compliance.urls")),
    path(API_V1 + "reports/",     include("apps.reports.urls")),
    path(API_V1 + "notifications/", include("apps.notifications.urls")),
    path(API_V1 + "audit-logs/",  include("apps.audit_logs.urls")),

    # OpenAPI / Swagger
    path("api/schema/",           SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/",             SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/",            SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]

if settings.DEBUG:
    import debug_toolbar
    urlpatterns += [path("__debug__/", include(debug_toolbar.urls))]
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
