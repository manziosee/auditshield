from rest_framework.routers import DefaultRouter
from .views import SignatureRequestViewSet

router = DefaultRouter()
router.register("requests", SignatureRequestViewSet, basename="signature-request")

urlpatterns = router.urls
