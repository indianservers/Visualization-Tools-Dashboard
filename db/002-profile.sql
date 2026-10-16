ALTER TABLE aimer_users ADD COLUMN IF NOT EXISTS interests JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE aimer_users ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE aimer_users ADD COLUMN IF NOT EXISTS learning JSONB NOT NULL DEFAULT '{"favorites":[],"pinned":[],"recent":[]}'::jsonb;
ALTER TABLE aimer_users ADD COLUMN IF NOT EXISTS learning_version INTEGER NOT NULL DEFAULT 0;
