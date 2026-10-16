-- Phone-only Firebase identities need no email. Contact numbers remain separate.
ALTER TABLE aimer_users ALTER COLUMN email DROP NOT NULL;
ALTER TABLE aimer_users ADD COLUMN IF NOT EXISTS verified_phone TEXT;
