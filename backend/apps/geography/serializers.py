from rest_framework import serializers

from .models import Country, Currency, ExchangeRate


class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = ["id", "code", "name", "symbol", "decimal_places"]


class CountrySerializer(serializers.ModelSerializer):
    default_currency = CurrencySerializer(read_only=True)

    class Meta:
        model = Country
        fields = [
            "id", "name", "iso_code", "iso_code_3", "phone_prefix",
            "default_currency", "default_timezone",
            "tax_year_start_month", "tax_year_start_day",
            "date_format", "flag_emoji",
        ]


class ExchangeRateSerializer(serializers.ModelSerializer):
    base_currency = serializers.StringRelatedField()
    target_currency = serializers.StringRelatedField()

    class Meta:
        model = ExchangeRate
        fields = ["id", "base_currency", "target_currency", "rate", "effective_date"]
