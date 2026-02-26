"""
Geography — Country, Currency, ExchangeRate.
Makes the platform country-agnostic: every company is tied to a Country
which carries its own currency, timezone, tax-year, and authority tree.
"""
from django.db import models

from core.models import TimeStampedModel, UUIDModel


class Currency(UUIDModel):
    """ISO-4217 currency."""
    code = models.CharField(max_length=3, unique=True)   # USD, EUR, KES, RWF, GBP …
    name = models.CharField(max_length=100)
    symbol = models.CharField(max_length=5)              # $, €, KSh, Rwf, £ …
    decimal_places = models.PositiveSmallIntegerField(default=2)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "currencies"
        ordering = ["code"]
        verbose_name_plural = "currencies"

    def __str__(self):
        return f"{self.code} — {self.name}"


class Country(UUIDModel):
    """
    Top-level geo entity. One row per supported country.
    Carries all country-specific defaults so the rest of the system stays generic.
    """
    name = models.CharField(max_length=100, unique=True)
    iso_code = models.CharField(max_length=2, unique=True)   # ISO-3166 alpha-2
    iso_code_3 = models.CharField(max_length=3, unique=True, blank=True)
    phone_prefix = models.CharField(max_length=6, blank=True)    # e.g. +1, +44, +250
    default_currency = models.ForeignKey(
        Currency, on_delete=models.PROTECT, related_name="default_for_countries"
    )
    default_timezone = models.CharField(max_length=60, default="UTC")
    # Tax-year start: 1 = January, 4 = April (UK), 7 = July …
    tax_year_start_month = models.PositiveSmallIntegerField(default=1)
    tax_year_start_day = models.PositiveSmallIntegerField(default=1)
    date_format = models.CharField(max_length=20, default="DD/MM/YYYY")
    is_active = models.BooleanField(default=True)
    flag_emoji = models.CharField(max_length=4, blank=True)

    class Meta:
        db_table = "countries"
        ordering = ["name"]
        verbose_name_plural = "countries"

    def __str__(self):
        return f"{self.flag_emoji} {self.name} ({self.iso_code})"


class ExchangeRate(UUIDModel, TimeStampedModel):
    """Daily spot rate between two currencies."""
    base_currency = models.ForeignKey(
        Currency, on_delete=models.CASCADE, related_name="exchange_rates_base"
    )
    target_currency = models.ForeignKey(
        Currency, on_delete=models.CASCADE, related_name="exchange_rates_target"
    )
    rate = models.DecimalField(max_digits=18, decimal_places=6)
    effective_date = models.DateField()

    class Meta:
        db_table = "exchange_rates"
        unique_together = ["base_currency", "target_currency", "effective_date"]
        ordering = ["-effective_date"]

    def __str__(self):
        return f"1 {self.base_currency.code} = {self.rate} {self.target_currency.code} ({self.effective_date})"
