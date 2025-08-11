-- Script d'initialisation de la base de données PME 360
-- Ce fichier sera exécuté lors de la création du conteneur PostgreSQL

-- Création de la base de données (si elle n'existe pas)
SELECT 'CREATE DATABASE pme360_dev' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'pme360_dev')\gexec

-- Extensions utiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Commentaire sur la base de données
COMMENT ON DATABASE pme360_dev IS 'Base de données pour l application PME 360';