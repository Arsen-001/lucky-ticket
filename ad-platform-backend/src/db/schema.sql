-- ============================================================================
--  Ad-platform schema — sponsor tournaments with budget HOLD + hybrid billing.
--
--  MONEY MODEL: every monetary value is an INTEGER NUMBER OF CENTS (USD) in a
--  BIGINT column. No floating point anywhere — $0.80 = 80, $50 = 5000. CHECK
--  constraints make negative balances / holds impossible at the storage layer,
--  as a last line of defence behind the application's transactional logic.
-- ============================================================================

-- ---------------------------------------------------------------------------
--  advertisers — sponsors (casinos) and their main spendable balance.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS advertisers (
  id         BIGSERIAL   PRIMARY KEY,
  username   TEXT        NOT NULL UNIQUE,
  -- Main balance, in cents. Can never go negative (DB-enforced).
  balance    BIGINT      NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
--  tournaments — one sponsor ad-campaign.
--
--  Lifecycle: ACTIVE → COMPLETED (auto, on budget exhaustion or expiry).
--  HOLD / CANCELED are reserved for manual moderation / cancellation flows.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tournaments (
  id                 BIGSERIAL   PRIMARY KEY,
  advertiser_id      BIGINT      NOT NULL REFERENCES advertisers(id) ON DELETE RESTRICT,
  title              TEXT        NOT NULL,
  short_text         TEXT,
  long_text          TEXT,
  banner_url         TEXT,
  target_url         TEXT        NOT NULL,
  -- Detected once at creation; freezes which CPC rate applies.
  link_type_detected TEXT        NOT NULL
                       CHECK (link_type_detected IN ('WEB_LINK', 'GOOGLE_PLAY', 'APP_STORE')),
  -- Fixed fee charged to platform revenue at creation (cents).
  fixed_cost         BIGINT      NOT NULL CHECK (fixed_cost >= 0),
  -- Price per unique click (cents), frozen from link_type_detected.
  cpc_rate           BIGINT      NOT NULL CHECK (cpc_rate > 0),
  clicks_requested   INTEGER     NOT NULL CHECK (clicks_requested > 0),
  clicks_current     INTEGER     NOT NULL DEFAULT 0 CHECK (clicks_current >= 0),
  -- Remaining FROZEN click budget (cents). Decremented per unique click,
  -- returned to the advertiser on completion. Never negative.
  click_budget_hold  BIGINT      NOT NULL DEFAULT 0 CHECK (click_budget_hold >= 0),
  status             TEXT        NOT NULL DEFAULT 'ACTIVE'
                       CHECK (status IN ('HOLD', 'ACTIVE', 'COMPLETED', 'CANCELED')),
  starts_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at         TIMESTAMPTZ NOT NULL,
  completed_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Drives the cron expiry sweep ("ACTIVE and past expires_at") efficiently.
CREATE INDEX IF NOT EXISTS idx_tournaments_status_expires
  ON tournaments (status, expires_at);

CREATE INDEX IF NOT EXISTS idx_tournaments_advertiser
  ON tournaments (advertiser_id);

-- ---------------------------------------------------------------------------
--  click_logs — one row per UNIQUE player click, for analytics + anti-fraud.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS click_logs (
  id            BIGSERIAL   PRIMARY KEY,
  tournament_id BIGINT      NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  telegram_id   BIGINT      NOT NULL,
  -- Cents billed for THIS click (= cpc_rate for billed clicks).
  charged       BIGINT      NOT NULL DEFAULT 0 CHECK (charged >= 0),
  clicked_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- THE anti-fraud guarantee: a player can be billed at most once per
  -- tournament. A repeat click hits this constraint and is never charged.
  CONSTRAINT uq_click_logs_tournament_player UNIQUE (tournament_id, telegram_id)
);

-- ---------------------------------------------------------------------------
--  ledger — append-only audit trail of every money movement.
--
--  amount is always a positive magnitude; `type` conveys the direction.
--  Platform revenue = SUM(amount) WHERE type IN ('FIXED_FEE', 'CLICK_CHARGE').
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ledger (
  id            BIGSERIAL   PRIMARY KEY,
  advertiser_id BIGINT      NOT NULL REFERENCES advertisers(id) ON DELETE RESTRICT,
  tournament_id BIGINT      REFERENCES tournaments(id) ON DELETE SET NULL,
  type          TEXT        NOT NULL
                  CHECK (type IN ('HOLD', 'FIXED_FEE', 'CLICK_CHARGE', 'REFUND')),
  amount        BIGINT      NOT NULL CHECK (amount >= 0),
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ledger_tournament ON ledger (tournament_id);
CREATE INDEX IF NOT EXISTS idx_ledger_advertiser ON ledger (advertiser_id);
