from rest_framework.routers import DefaultRouter
from .views import ApprovalWorkflowViewSet, ApprovalRequestViewSet

router = DefaultRouter()
router.register("workflows", ApprovalWorkflowViewSet, basename="approval-workflow")
router.register("requests", ApprovalRequestViewSet, basename="approval-request")

urlpatterns = router.urls
