"""
File Encryption Utility
Uses Fernet (AES-128-CBC + HMAC-SHA256) to encrypt files at rest.
"""
from cryptography.fernet import Fernet
from django.conf import settings


def get_fernet() -> Fernet:
    key = settings.FILE_ENCRYPTION_KEY
    if not key:
        raise RuntimeError("FILE_ENCRYPTION_KEY is not configured")
    return Fernet(key.encode() if isinstance(key, str) else key)


def encrypt_file(data: bytes) -> bytes:
    return get_fernet().encrypt(data)


def decrypt_file(data: bytes) -> bytes:
    return get_fernet().decrypt(data)


def encrypt_field(value: str) -> str:
    """Encrypt a string field value (e.g. RRA TIN number)."""
    return get_fernet().encrypt(value.encode()).decode()


def decrypt_field(token: str) -> str:
    return get_fernet().decrypt(token.encode()).decode()
