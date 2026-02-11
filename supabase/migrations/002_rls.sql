-- ============================================================
-- Row Level Security Policies
-- ============================================================

-- -----------------------------------------------------------
-- Helper: check if current user is admin for a shop
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION is_shop_admin(check_shop_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM shop_members
    WHERE shop_id = check_shop_id
      AND user_id = auth.uid()
      AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get customer id for the current auth user in a shop
CREATE OR REPLACE FUNCTION get_customer_id(check_shop_id UUID)
RETURNS UUID AS $$
  SELECT id FROM customers
  WHERE auth_user_id = auth.uid()
    AND shop_id = check_shop_id
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- -----------------------------------------------------------
-- shops — public read (names only)
-- -----------------------------------------------------------
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shops_select" ON shops
  FOR SELECT USING (true);

-- -----------------------------------------------------------
-- customers
-- -----------------------------------------------------------
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customers_select_own" ON customers
  FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "customers_update_own" ON customers
  FOR UPDATE USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "customers_insert_own" ON customers
  FOR INSERT WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "customers_admin_select" ON customers
  FOR SELECT USING (is_shop_admin(shop_id));

-- -----------------------------------------------------------
-- receipts
-- -----------------------------------------------------------
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "receipts_customer_select" ON receipts
  FOR SELECT USING (customer_id = get_customer_id(shop_id));

CREATE POLICY "receipts_customer_insert" ON receipts
  FOR INSERT WITH CHECK (customer_id = get_customer_id(shop_id));

CREATE POLICY "receipts_admin_select" ON receipts
  FOR SELECT USING (is_shop_admin(shop_id));

CREATE POLICY "receipts_admin_update" ON receipts
  FOR UPDATE USING (is_shop_admin(shop_id))
  WITH CHECK (is_shop_admin(shop_id));

CREATE POLICY "receipts_admin_delete" ON receipts
  FOR DELETE USING (is_shop_admin(shop_id));

-- -----------------------------------------------------------
-- receipt_items
-- -----------------------------------------------------------
ALTER TABLE receipt_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "items_customer_select" ON receipt_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM receipts r
      WHERE r.id = receipt_items.receipt_id
        AND r.customer_id = get_customer_id(receipt_items.shop_id)
    )
  );

CREATE POLICY "items_customer_insert" ON receipt_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM receipts r
      WHERE r.id = receipt_items.receipt_id
        AND r.customer_id = get_customer_id(receipt_items.shop_id)
    )
  );

CREATE POLICY "items_customer_update" ON receipt_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM receipts r
      WHERE r.id = receipt_items.receipt_id
        AND r.customer_id = get_customer_id(receipt_items.shop_id)
    )
  );

CREATE POLICY "items_admin_select" ON receipt_items
  FOR SELECT USING (is_shop_admin(shop_id));

CREATE POLICY "items_admin_update" ON receipt_items
  FOR UPDATE USING (is_shop_admin(shop_id))
  WITH CHECK (is_shop_admin(shop_id));

-- -----------------------------------------------------------
-- shop_members
-- -----------------------------------------------------------
ALTER TABLE shop_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_own_select" ON shop_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "members_admin_select" ON shop_members
  FOR SELECT USING (is_shop_admin(shop_id));

-- -----------------------------------------------------------
-- audit_logs
-- -----------------------------------------------------------
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_admin_select" ON audit_logs
  FOR SELECT USING (is_shop_admin(shop_id));

CREATE POLICY "audit_admin_insert" ON audit_logs
  FOR INSERT WITH CHECK (is_shop_admin(shop_id));

-- Also allow service-role inserts (for cron)
CREATE POLICY "audit_service_insert" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- -----------------------------------------------------------
-- receipt_deletions
-- -----------------------------------------------------------
ALTER TABLE receipt_deletions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deletions_admin_select" ON receipt_deletions
  FOR SELECT USING (is_shop_admin(shop_id));

-- Service role insert for cron
CREATE POLICY "deletions_service_insert" ON receipt_deletions
  FOR INSERT WITH CHECK (true);
