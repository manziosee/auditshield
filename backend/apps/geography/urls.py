from rest_framework.routers import DefaultRouter

from .views import CountryViewSet, CurrencyViewSet, ExchangeRateViewSet

router = DefaultRouter()
router.register("countries", CountryViewSet, basename="country")
router.register("currencies", CurrencyViewSet, basename="currency")
router.register("exchange-rates", ExchangeRateViewSet, basename="exchange-rate")

urlpatterns = router.urls
