"""
User & Role models.
Supports multi-tenant RBAC: each user belongs to one Company with one Role.
"""
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from core.models import UUIDModel, TimeStampedModel


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin, UUIDModel, TimeStampedModel):
    class Role(models.TextChoices):
        SUPER_ADMIN = "super_admin", "Super Admin"   # platform admin
        COMPANY_ADMIN = "admin", "Company Admin"      # full access within company
        HR = "hr", "HR Manager"
        ACCOUNTANT = "accountant", "Accountant"
        AUDITOR = "auditor", "Auditor (read-only)"
        EMPLOYEE = "employee", "Employee"

    email = models.EmailField(unique=True, db_index=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.EMPLOYEE)
    company = models.ForeignKey(
        "companies.Company",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="users",
    )
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    must_change_password = models.BooleanField(default=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    two_factor_enabled = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    class Meta:
        db_table = "auth_users"
        indexes = [
            models.Index(fields=["company", "role"]),
            models.Index(fields=["email", "is_active"]),
        ]

    def __str__(self):
        return f"{self.get_full_name()} <{self.email}>"

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def is_company_admin(self):
        return self.role in (self.Role.COMPANY_ADMIN, self.Role.SUPER_ADMIN)

    @property
    def can_manage_employees(self):
        return self.role in (self.Role.COMPANY_ADMIN, self.Role.HR, self.Role.SUPER_ADMIN)

    @property
    def can_manage_finance(self):
        return self.role in (self.Role.COMPANY_ADMIN, self.Role.ACCOUNTANT, self.Role.SUPER_ADMIN)
