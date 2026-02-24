"""
Tenant Middleware
Resolves the current company (tenant) from the authenticated user
and attaches it to the request so all querysets can be scoped automatically.
"""
from django.utils.deprecation import MiddlewareMixin


class TenantMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request.company = None
        request.company_id = None

        if request.user.is_authenticated and hasattr(request.user, "company"):
            request.company = request.user.company
            request.company_id = request.user.company_id
