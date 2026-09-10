-- ============================================================
-- PAIMANA — Project Delay Tracking System
-- PostgreSQL Schema
-- ============================================================

-- Enable UUID generation (Supabase/Neon have this available by default)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- USERS
-- ------------------------------------------------------------
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username      VARCHAR(50) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role          VARCHAR(20) NOT NULL DEFAULT 'public'
                  CHECK (role IN ('public', 'admin')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- PROJECTS
-- ------------------------------------------------------------
CREATE TABLE projects (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(200) NOT NULL,
    sector              VARCHAR(100) NOT NULL,
    ministry            VARCHAR(150) NOT NULL,
    state               VARCHAR(100) NOT NULL,

    lat                 NUMERIC(9,6) NOT NULL CHECK (lat BETWEEN -90 AND 90),
    lng                 NUMERIC(9,6) NOT NULL CHECK (lng BETWEEN -180 AND 180),

    budget_cr           NUMERIC(12,2) NOT NULL CHECK (budget_cr >= 0),
    utilized_cr         NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (utilized_cr >= 0),

    start_date          DATE NOT NULL,
    planned_completion  DATE NOT NULL,

    percent_complete    NUMERIC(5,2) NOT NULL DEFAULT 0
                        CHECK (percent_complete BETWEEN 0 AND 100),
    delay_percent       NUMERIC(6,2) NOT NULL DEFAULT 0
                        CHECK (delay_percent >= 0),
    risk_score          NUMERIC(5,2) NOT NULL DEFAULT 0
                        CHECK (risk_score BETWEEN 0 AND 100),

    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_dates_valid CHECK (planned_completion >= start_date),
    CONSTRAINT chk_utilized_within_budget CHECK (utilized_cr <= budget_cr * 1.5)
);

CREATE INDEX idx_projects_sector      ON projects (sector);
CREATE INDEX idx_projects_state       ON projects (state);
CREATE INDEX idx_projects_risk_score  ON projects (risk_score);

-- ------------------------------------------------------------
-- DELAY_CAUSES  (one-to-one with projects)
-- ------------------------------------------------------------
CREATE TABLE delay_causes (
    project_id       UUID PRIMARY KEY
                     REFERENCES projects(id) ON DELETE CASCADE,

    physical_pct     NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (physical_pct BETWEEN 0 AND 100),
    financial_pct    NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (financial_pct BETWEEN 0 AND 100),
    geographical_pct NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (geographical_pct BETWEEN 0 AND 100),
    manpower_pct     NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (manpower_pct BETWEEN 0 AND 100),
    bureaucratic_pct NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (bureaucratic_pct BETWEEN 0 AND 100),
    other_pct        NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (other_pct BETWEEN 0 AND 100),

    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_causes_sum_100 CHECK (
        physical_pct + financial_pct + geographical_pct +
        manpower_pct + bureaucratic_pct + other_pct = 100
    )
);

-- ------------------------------------------------------------
-- Keep updated_at fresh automatically
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_delay_causes_updated_at
BEFORE UPDATE ON delay_causes
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
