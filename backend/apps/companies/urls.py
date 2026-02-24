from django.urls import path
from . import views

urlpatterns = [
    path("onboard/",  views.OnboardingView.as_view(),   name="company-onboard"),
    path("profile/",  views.CompanyDetailView.as_view(), name="company-profile"),
]
