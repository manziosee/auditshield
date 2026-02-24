-- AuditShield database initialization
-- Runs once when the PostgreSQL container starts for the first time.

-- Enable useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- trigram similarity search
CREATE EXTENSION IF NOT EXISTS "unaccent";       -- accent-insensitive search
CREATE EXTENSION IF NOT EXISTS "btree_gin";      -- multi-column GIN indexes

-- Set timezone
SET timezone = 'Africa/Kigali';
