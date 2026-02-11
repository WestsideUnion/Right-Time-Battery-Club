export type Database = {
  public: {
    Tables: {
      shops: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          auth_user_id: string;
          email: string;
          display_name: string | null;
          marketing_opt_in: boolean;
          shop_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          email: string;
          display_name?: string | null;
          marketing_opt_in?: boolean;
          shop_id: string;
          created_at?: string;
        };
        Update: {
          email?: string;
          display_name?: string | null;
          marketing_opt_in?: boolean;
        };
      };
      receipts: {
        Row: {
          id: string;
          customer_id: string;
          shop_id: string;
          image_path: string | null;
          service_date: string | null;
          raw_text: string | null;
          status: string;
          confirmed_at: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          shop_id: string;
          image_path?: string | null;
          service_date?: string | null;
          raw_text?: string | null;
          status?: string;
          confirmed_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          image_path?: string | null;
          service_date?: string | null;
          raw_text?: string | null;
          status?: string;
          confirmed_at?: string | null;
          expires_at?: string | null;
        };
      };
      receipt_items: {
        Row: {
          id: string;
          receipt_id: string;
          shop_id: string;
          watch_model: string;
          brand_code: string | null;
          price: number | null;
          confirmed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          receipt_id: string;
          shop_id: string;
          watch_model: string;
          brand_code?: string | null;
          price?: number | null;
          confirmed?: boolean;
          created_at?: string;
        };
        Update: {
          watch_model?: string;
          brand_code?: string | null;
          price?: number | null;
          confirmed?: boolean;
        };
      };
      shop_members: {
        Row: {
          id: string;
          shop_id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          user_id: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          role?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          shop_id: string;
          user_id: string | null;
          action: string;
          entity_type: string | null;
          entity_id: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          user_id?: string | null;
          action: string;
          entity_type?: string | null;
          entity_id?: string | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: never;
      };
      receipt_deletions: {
        Row: {
          id: string;
          receipt_id: string;
          shop_id: string;
          customer_id: string;
          deleted_at: string;
          reason: string;
        };
        Insert: {
          id?: string;
          receipt_id: string;
          shop_id: string;
          customer_id: string;
          deleted_at?: string;
          reason?: string;
        };
        Update: never;
      };
    };
  };
};

// Convenience types
export type Shop = Database['public']['Tables']['shops']['Row'];
export type Customer = Database['public']['Tables']['customers']['Row'];
export type Receipt = Database['public']['Tables']['receipts']['Row'];
export type ReceiptItem = Database['public']['Tables']['receipt_items']['Row'];
export type ShopMember = Database['public']['Tables']['shop_members']['Row'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
export type ReceiptDeletion = Database['public']['Tables']['receipt_deletions']['Row'];

export type ReceiptWithItems = Receipt & {
  receipt_items: ReceiptItem[];
};
