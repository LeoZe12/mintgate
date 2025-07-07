export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      access_history: {
        Row: {
          access_granted: boolean
          apartment_number: string | null
          confidence_score: number | null
          id: string
          image_url: string | null
          plate: string
          reason: string | null
          timestamp: string
        }
        Insert: {
          access_granted: boolean
          apartment_number?: string | null
          confidence_score?: number | null
          id?: string
          image_url?: string | null
          plate: string
          reason?: string | null
          timestamp?: string
        }
        Update: {
          access_granted?: boolean
          apartment_number?: string | null
          confidence_score?: number | null
          id?: string
          image_url?: string | null
          plate?: string
          reason?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_access_vehicle_plate"
            columns: ["plate"]
            isOneToOne: false
            referencedRelation: "vehicle_plates"
            referencedColumns: ["plate"]
          },
        ]
      }
      esp32_config: {
        Row: {
          config_key: string
          config_value: string
          created_at: string
          device_id: string
          id: string
          updated_at: string
        }
        Insert: {
          config_key: string
          config_value: string
          created_at?: string
          device_id?: string
          id?: string
          updated_at?: string
        }
        Update: {
          config_key?: string
          config_value?: string
          created_at?: string
          device_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      esp32_status_history: {
        Row: {
          created_at: string
          device_id: string
          id: string
          is_loading: boolean | null
          last_heartbeat: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          device_id?: string
          id?: string
          is_loading?: boolean | null
          last_heartbeat?: string | null
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          device_id?: string
          id?: string
          is_loading?: boolean | null
          last_heartbeat?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      vehicle_plates: {
        Row: {
          apartment_number: string
          created_at: string
          id: string
          is_active: boolean | null
          owner_name: string | null
          plate: string
          updated_at: string
          vehicle_color: string | null
          vehicle_model: string | null
        }
        Insert: {
          apartment_number: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          owner_name?: string | null
          plate: string
          updated_at?: string
          vehicle_color?: string | null
          vehicle_model?: string | null
        }
        Update: {
          apartment_number?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          owner_name?: string | null
          plate?: string
          updated_at?: string
          vehicle_color?: string | null
          vehicle_model?: string | null
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
