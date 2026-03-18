from django.urls import path

from . import views

urlpatterns = [
    path("dashboard/",              views.ComplianceDashboardView.as_view(),       name="compliance-dashboard"),
    path("health-pulse/",           views.ComplianceHealthPulseView.as_view(),     name="compliance-health-pulse"),
    path("gap-analysis/",           views.ComplianceGapAnalysisView.as_view(),     name="compliance-gap-analysis"),
    path("records/",                views.ComplianceRecordListView.as_view(),      name="compliance-records"),
    path("records/bulk-update/",    views.ComplianceRecordBulkUpdateView.as_view(),name="compliance-bulk-update"),
    path("records/<uuid:pk>/",      views.ComplianceRecordDetailView.as_view(),    name="compliance-record-detail"),
    path("requirements/",           views.RequirementListView.as_view(),           name="compliance-requirements"),
    path("categories/",             views.ComplianceCategoryListView.as_view(),    name="compliance-categories"),
]
