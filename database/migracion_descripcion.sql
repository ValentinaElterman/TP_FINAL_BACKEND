-- no hace falta recrear todo con schema.sql, mas facil lo hacemos aca:
ALTER TABLE canciones ADD COLUMN IF NOT EXISTS descripcion TEXT;
