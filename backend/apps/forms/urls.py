from rest_framework.routers import DefaultRouter
from .views import FormTemplateViewSet, FormSubmissionViewSet

router = DefaultRouter()
router.register("templates", FormTemplateViewSet, basename="form-template")
router.register("submissions", FormSubmissionViewSet, basename="form-submission")

urlpatterns = router.urls
