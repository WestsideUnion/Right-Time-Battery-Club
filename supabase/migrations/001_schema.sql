-- ============================================================
-- Right Time Battery Clock — Database Schema (MVP v1)
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------
-- shops
-- -----------------------------------------------------------
CREATE TABLE shops (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed the default shop
INSERT INTO shops (name, slug) VALUES ('Right Time Battery Clock', 'right-time');

-- -----------------------------------------------------------
-- customers
-- -----------------------------------------------------------
CREATE TABLE customers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  display_name    TEXT,
  marketing_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
  shop_id         UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (auth_user_id, shop_id)
);

CREATE INDEX idx_customers_auth_user ON customers(auth_user_id);
CREATE INDEX idx_customers_shop ON customers(shop_id);

-- -----------------------------------------------------------
-- receipts
-- -----------------------------------------------------------
CREATE TYPE receipt_status AS ENUM ('pending', 'confirmed', 'expired', 'deleted');

CREATE TABLE receipts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id   UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  shop_id       UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  image_path    TEXT,
  service_date  TIMESTAMPTZ,
  raw_text      TEXT,
  status        receipt_status NOT NULL DEFAULT 'pending',
  confirmed_at  TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_receipts_customer ON receipts(customer_id);
CREATE INDEX idx_receipts_shop ON receipts(shop_id);
CREATE INDEX idx_receipts_expires ON receipts(expires_at);

-- -----------------------------------------------------------
-- receipt_items
-- -----------------------------------------------------------
CREATE TABLE receipt_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_id  UUID NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  shop_id     UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  watch_model TEXT NOT NULL,
  brand_code  TEXT,
  price       NUMERIC(10,2),
  confirmed   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_receipt_items_receipt ON receipt_items(receipt_id);

-- -----------------------------------------------------------
-- shop_members (admin / staff access)
-- -----------------------------------------------------------
CREATE TYPE member_role AS ENUM ('admin', 'staff');

CREATE TABLE shop_members (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id     UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        member_role NOT NULL DEFAULT 'staff',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (shop_id, user_id)
);

-- -----------------------------------------------------------
-- audit_logs
-- -----------------------------------------------------------
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id     UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  user_id     UUID,
  action      TEXT NOT NULL,
  entity_type TEXT,
  entity_id   UUID,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_shop ON audit_logs(shop_id);

-- -----------------------------------------------------------
-- receipt_deletions (retention tracking)
-- -----------------------------------------------------------
CREATE TABLE receipt_deletions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_id  UUID NOT NULL,
  shop_id     UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL,
  deleted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason      TEXT NOT NULL DEFAULT 'retention_policy'
);

CREATE INDEX idx_receipt_deletions_shop ON receipt_deletions(shop_id);
