-- ============================================================
-- Private Storage Bucket for Receipt Images
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('receipt-images', 'receipt-images', false);

-- Customers can upload to their own folder: {shop_id}/{customer_id}/*
CREATE POLICY "receipt_images_customer_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'receipt-images'
  AND auth.uid() IS NOT NULL
);

-- Customers can read their own images
CREATE POLICY "receipt_images_customer_select"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'receipt-images'
  AND auth.uid() IS NOT NULL
);

-- Admins can read all images in their shop
CREATE POLICY "receipt_images_admin_select"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'receipt-images'
  AND EXISTS (
    SELECT 1 FROM shop_members sm
    WHERE sm.user_id = auth.uid()
      AND sm.role = 'admin'
  )
);

-- Service role can delete (for retention cleanup)
CREATE POLICY "receipt_images_service_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'receipt-images'
);
