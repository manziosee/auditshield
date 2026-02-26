from rest_framework.routers import DefaultRouter

from .views import PayrollRunViewSet, TaxRuleViewSet

router = DefaultRouter()
router.register("runs", PayrollRunViewSet, basename="payroll-run")
router.register("tax-rules", TaxRuleViewSet, basename="tax-rule")

urlpatterns = router.urls
