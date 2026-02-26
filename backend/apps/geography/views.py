from rest_framework import mixins, permissions, viewsets

from .models import Country, Currency, ExchangeRate
from .serializers import CountrySerializer, CurrencySerializer, ExchangeRateSerializer


class CountryViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """Public read-only list of supported countries."""
    queryset = Country.objects.filter(is_active=True).select_related("default_currency")
    serializer_class = CountrySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class CurrencyViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """Public read-only list of currencies."""
    queryset = Currency.objects.filter(is_active=True)
    serializer_class = CurrencySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class ExchangeRateViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """Latest exchange rates (authenticated)."""
    queryset = ExchangeRate.objects.select_related("base_currency", "target_currency").order_by(
        "base_currency", "target_currency", "-effective_date"
    ).distinct("base_currency", "target_currency")
    serializer_class = ExchangeRateSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None
