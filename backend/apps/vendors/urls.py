from rest_framework.routers import DefaultRouter
from .views import VendorViewSet, VendorDocumentViewSet

router = DefaultRouter()
router.register("documents", VendorDocumentViewSet, basename="vendor-document")
router.register("", VendorViewSet, basename="vendor")

urlpatterns = router.urls
