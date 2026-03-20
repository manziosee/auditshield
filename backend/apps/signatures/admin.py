from django.contrib import admin
from .models import SignatureRequest, SignatureRequestSigner


class SignerInline(admin.TabularInline):
    model = SignatureRequestSigner
    extra = 0
    readonly_fields = ["signed_at", "ip_address"]


@admin.register(SignatureRequest)
class SignatureRequestAdmin(admin.ModelAdmin):
    list_display = ["title", "company", "status", "created_by", "created_at"]
    list_filter = ["status"]
    inlines = [SignerInline]
