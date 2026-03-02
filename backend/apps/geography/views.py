from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import mixins, permissions, viewsets

from .models import Country, Currency, ExchangeRate
from .serializers import CountrySerializer, CurrencySerializer, ExchangeRateSerializer


@extend_schema_view(
    list=extend_schema(
        tags=["geography"],
        summary="List all countries",
        description="Returns all active countries with their currencies, timezones, and flag emojis. No authentication required.",
    ),
    retrieve=extend_schema(
        tags=["geography"],
        summary="Get country by ID",
    ),
)
class CountryViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """Public read-only list of supported countries."""
    queryset = Country.objects.filter(is_active=True).select_related("default_currency")
    serializer_class = CountrySerializer
    permission_classes = [permissions.AllowAny]


@extend_schema_view(
    list=extend_schema(
        tags=["geography"],
        summary="List all currencies",
        description="Returns all active currencies with their symbols and decimal places. No authentication required.",
    ),
    retrieve=extend_schema(
        tags=["geography"],
        summary="Get currency by ID",
    ),
)
class CurrencyViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """Public read-only list of currencies."""
    queryset = Currency.objects.filter(is_active=True)
    serializer_class = CurrencySerializer
    permission_classes = [permissions.AllowAny]


@extend_schema_view(
    list=extend_schema(
        tags=["geography"],
        summary="List exchange rates",
        description="Returns latest exchange rates between currencies. Requires authentication.",
    ),
)
class ExchangeRateViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """Latest exchange rates (authenticated)."""
    queryset = ExchangeRate.objects.select_related("base_currency", "target_currency").order_by(
        "base_currency", "target_currency", "-effective_date"
    ).distinct("base_currency", "target_currency")
    serializer_class = ExchangeRateSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None
