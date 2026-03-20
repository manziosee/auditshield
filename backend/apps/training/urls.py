from rest_framework.routers import DefaultRouter
from .views import CertificationTypeViewSet, EmployeeCertificationViewSet

router = DefaultRouter()
router.register("types", CertificationTypeViewSet, basename="certification-type")
router.register("certifications", EmployeeCertificationViewSet, basename="employee-certification")

urlpatterns = router.urls
