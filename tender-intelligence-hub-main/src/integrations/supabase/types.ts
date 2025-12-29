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
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          daily_usage_count: number
          epf_number: string | null
          esic_number: string | null
          full_name: string | null
          gst_number: string | null
          has_epf: boolean | null
          has_esic: boolean | null
          has_gst: boolean | null
          has_iso: boolean | null
          has_pan: boolean | null
          has_psara: boolean | null
          has_startup_india: boolean | null
          has_udyam: boolean | null
          id: string
          incorporation_date: string | null
          iso_number: string | null
          last_usage_date: string | null
          legal_status: string | null
          msme_udyam_no: string | null
          net_worth: number | null
          pan_number: string | null
          psara_number: string | null
          solvency_cert_value: number | null
          startup_india_number: string | null
          startup_reg_no: string | null
          turnover_2223: number | null
          turnover_2324: number | null
          turnover_2425: number | null
          udyam_number: string | null
          updated_at: string
          work_orders: Json | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          daily_usage_count?: number
          epf_number?: string | null
          esic_number?: string | null
          full_name?: string | null
          gst_number?: string | null
          has_epf?: boolean | null
          has_esic?: boolean | null
          has_gst?: boolean | null
          has_iso?: boolean | null
          has_pan?: boolean | null
          has_psara?: boolean | null
          has_startup_india?: boolean | null
          has_udyam?: boolean | null
          id: string
          incorporation_date?: string | null
          iso_number?: string | null
          last_usage_date?: string | null
          legal_status?: string | null
          msme_udyam_no?: string | null
          net_worth?: number | null
          pan_number?: string | null
          psara_number?: string | null
          solvency_cert_value?: number | null
          startup_india_number?: string | null
          startup_reg_no?: string | null
          turnover_2223?: number | null
          turnover_2324?: number | null
          turnover_2425?: number | null
          udyam_number?: string | null
          updated_at?: string
          work_orders?: Json | null
        }
        Update: {
          company_name?: string | null
          created_at?: string
          daily_usage_count?: number
          epf_number?: string | null
          esic_number?: string | null
          full_name?: string | null
          gst_number?: string | null
          has_epf?: boolean | null
          has_esic?: boolean | null
          has_gst?: boolean | null
          has_iso?: boolean | null
          has_pan?: boolean | null
          has_psara?: boolean | null
          has_startup_india?: boolean | null
          has_udyam?: boolean | null
          id?: string
          incorporation_date?: string | null
          iso_number?: string | null
          last_usage_date?: string | null
          legal_status?: string | null
          msme_udyam_no?: string | null
          net_worth?: number | null
          pan_number?: string | null
          psara_number?: string | null
          solvency_cert_value?: number | null
          startup_india_number?: string | null
          startup_reg_no?: string | null
          turnover_2223?: number | null
          turnover_2324?: number | null
          turnover_2425?: number | null
          udyam_number?: string | null
          updated_at?: string
          work_orders?: Json | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          expires_at: string | null
          id: string
          plan: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          expires_at?: string | null
          id?: string
          plan?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          expires_at?: string | null
          id?: string
          plan?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
