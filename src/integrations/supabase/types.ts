export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_usage_logs: {
        Row: {
          ai_type: string
          client_id: string
          created_at: string
          id: string
          language: string
          response_time_ms: number | null
          success: boolean
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          ai_type: string
          client_id: string
          created_at?: string
          id?: string
          language?: string
          response_time_ms?: number | null
          success?: boolean
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          ai_type?: string
          client_id?: string
          created_at?: string
          id?: string
          language?: string
          response_time_ms?: number | null
          success?: boolean
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      billing_diagnostics: {
        Row: {
          catalog_ready: boolean
          created_at: string
          device_info: Json
          diagnostics_result: Json
          errors: string[]
          id: string
          readiness_score: number
          readiness_summary: string
          user_id: string | null
        }
        Insert: {
          catalog_ready?: boolean
          created_at?: string
          device_info?: Json
          diagnostics_result?: Json
          errors?: string[]
          id?: string
          readiness_score?: number
          readiness_summary?: string
          user_id?: string | null
        }
        Update: {
          catalog_ready?: boolean
          created_at?: string
          device_info?: Json
          diagnostics_result?: Json
          errors?: string[]
          id?: string
          readiness_score?: number
          readiness_summary?: string
          user_id?: string | null
        }
        Relationships: []
      }
      bump_photos: {
        Row: {
          ai_analysis: string | null
          caption: string | null
          created_at: string
          id: string
          image_ref: string
          storage_path: string
          updated_at: string
          user_id: string
          week: number
        }
        Insert: {
          ai_analysis?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          image_ref: string
          storage_path: string
          updated_at?: string
          user_id: string
          week: number
        }
        Update: {
          ai_analysis?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          image_ref?: string
          storage_path?: string
          updated_at?: string
          user_id?: string
          week?: number
        }
        Relationships: []
      }
      coupon_claims: {
        Row: {
          activated_at: string
          coupon_id: string
          created_at: string
          device_fingerprint: string
          expires_at: string
          id: string
          user_id: string
        }
        Insert: {
          activated_at?: string
          coupon_id: string
          created_at?: string
          device_fingerprint: string
          expires_at: string
          id?: string
          user_id: string
        }
        Update: {
          activated_at?: string
          coupon_id?: string
          created_at?: string
          device_fingerprint?: string
          expires_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_claims_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          bonus_points: number
          code: string
          created_at: string
          current_claims: number
          duration_type: string
          expires_at: string | null
          id: string
          is_active: boolean
          max_claims: number
        }
        Insert: {
          bonus_points?: number
          code: string
          created_at?: string
          current_claims?: number
          duration_type: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_claims?: number
        }
        Update: {
          bonus_points?: number
          code?: string
          created_at?: string
          current_claims?: number
          duration_type?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_claims?: number
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          body: string
          created_at: string
          id: string
          language: string | null
          title: string
          total_failed: number
          total_sent: number
          total_subscribers: number
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          language?: string | null
          title: string
          total_failed?: number
          total_sent?: number
          total_subscribers?: number
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          language?: string | null
          title?: string
          total_failed?: number
          total_sent?: number
          total_subscribers?: number
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          pregnancy_week: number | null
          updated_at: string
          user_language: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          pregnancy_week?: number | null
          updated_at?: string
          user_language?: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          pregnancy_week?: number | null
          updated_at?: string
          user_language?: string
        }
        Relationships: []
      }
      seo_categories: {
        Row: {
          created_at: string
          description_ar: string | null
          icon: string | null
          id: string
          name_ar: string
          name_en: string | null
          sort_order: number
        }
        Insert: {
          created_at?: string
          description_ar?: string | null
          icon?: string | null
          id?: string
          name_ar: string
          name_en?: string | null
          sort_order?: number
        }
        Update: {
          created_at?: string
          description_ar?: string | null
          icon?: string | null
          id?: string
          name_ar?: string
          name_en?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      seo_keywords: {
        Row: {
          category_id: string
          competition_tier: string
          created_at: string
          id: string
          intent: string
          keyword_ar: string
          keyword_en: string | null
          notes: string | null
          volume_tier: string
        }
        Insert: {
          category_id: string
          competition_tier?: string
          created_at?: string
          id?: string
          intent?: string
          keyword_ar: string
          keyword_en?: string | null
          notes?: string | null
          volume_tier?: string
        }
        Update: {
          category_id?: string
          competition_tier?: string
          created_at?: string
          id?: string
          intent?: string
          keyword_ar?: string
          keyword_en?: string | null
          notes?: string | null
          volume_tier?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_keywords_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "seo_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          google_play_order_id: string | null
          google_play_token: string | null
          id: string
          status: string
          subscription_end: string | null
          subscription_start: string | null
          subscription_type: string
          trial_end: string
          trial_start: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          google_play_order_id?: string | null
          google_play_token?: string | null
          id?: string
          status?: string
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_type?: string
          trial_end?: string
          trial_start?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          google_play_order_id?: string | null
          google_play_token?: string | null
          id?: string
          status?: string
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_type?: string
          trial_end?: string
          trial_start?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tool_analytics: {
        Row: {
          action_type: string
          created_at: string
          id: string
          metadata: Json | null
          session_id: string
          tool_id: string
        }
        Insert: {
          action_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          session_id: string
          tool_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          session_id?: string
          tool_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_ai_logs: { Args: never; Returns: number }
      cleanup_old_analytics: { Args: never; Returns: number }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
