from django.urls import path

from . import views

urlpatterns = [
    path("onboard/",         views.OnboardingView.as_view(),    name="company-onboard"),
    path("profile/",         views.CompanyDetailView.as_view(), name="company-profile"),
    # Alias used by the frontend settings component
    path("me/",              views.CompanyDetailView.as_view(), name="company-me"),
    # UUID-based endpoint used by frontend PATCH calls (companies/{id}/)
    path("<uuid:pk>/",       views.CompanyByIdView.as_view(),   name="company-by-id"),
    # Data export
    path("export/",          views.CompanyExportView.as_view(), name="company-export"),
]
