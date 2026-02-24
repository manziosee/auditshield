"""
Audit Log Middleware
Automatically records every mutating API request (POST/PUT/PATCH/DELETE)
so we have a full trail of who did what and when.
"""
import json
import logging
import time

from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger("auditshield")


class AuditLogMiddleware(MiddlewareMixin):
    MUTATING_METHODS = {"POST", "PUT", "PATCH", "DELETE"}

    def process_request(self, request):
        request._start_time = time.monotonic()

    def process_response(self, request, response):
        if request.method not in self.MUTATING_METHODS:
            return response

        # Avoid circular import
        from apps.audit_logs.models import AuditLog

        duration_ms = int((time.monotonic() - getattr(request, "_start_time", time.monotonic())) * 1000)
        user = request.user if request.user.is_authenticated else None

        try:
            body = {}
            if request.content_type and "json" in request.content_type:
                raw = request.body.decode("utf-8", errors="replace")
                body = json.loads(raw) if raw else {}
                # Scrub sensitive fields
                for field in ("password", "password1", "password2", "token", "refresh", "access"):
                    body.pop(field, None)
        except Exception:
            body = {}

        try:
            AuditLog.objects.create(
                user=user,
                method=request.method,
                path=request.path,
                status_code=response.status_code,
                ip_address=self._get_ip(request),
                user_agent=request.META.get("HTTP_USER_AGENT", "")[:500],
                request_body=body,
                duration_ms=duration_ms,
                company_id=getattr(request, "company_id", None),
            )
        except Exception as exc:
            logger.exception("Failed to write audit log: %s", exc)

        return response

    @staticmethod
    def _get_ip(request) -> str:
        forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
        return forwarded.split(",")[0].strip() if forwarded else request.META.get("REMOTE_ADDR", "")
