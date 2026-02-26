from django.contrib import admin

from .models import Country, Currency, ExchangeRate


@admin.register(Currency)
class CurrencyAdmin(admin.ModelAdmin):
    list_display = ["code", "name", "symbol", "decimal_places", "is_active"]
    list_filter = ["is_active"]
    search_fields = ["code", "name"]


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ["flag_emoji", "name", "iso_code", "default_currency", "default_timezone", "is_active"]
    list_filter = ["is_active"]
    search_fields = ["name", "iso_code"]
    raw_id_fields = ["default_currency"]


@admin.register(ExchangeRate)
class ExchangeRateAdmin(admin.ModelAdmin):
    list_display = ["base_currency", "target_currency", "rate", "effective_date"]
    list_filter = ["effective_date"]
    date_hierarchy = "effective_date"
