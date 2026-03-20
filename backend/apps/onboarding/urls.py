from rest_framework.routers import DefaultRouter
from .views import OnboardingTemplateViewSet, EmployeeOnboardingViewSet

router = DefaultRouter()
router.register("templates", OnboardingTemplateViewSet, basename="onboarding-template")
router.register("employee", EmployeeOnboardingViewSet, basename="employee-onboarding")

urlpatterns = router.urls
