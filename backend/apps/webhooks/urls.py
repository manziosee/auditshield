from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import WebhookEndpointViewSet

router = DefaultRouter()
router.register("endpoints", WebhookEndpointViewSet, basename="webhook-endpoint")

urlpatterns = [path("", include(router.urls))]
