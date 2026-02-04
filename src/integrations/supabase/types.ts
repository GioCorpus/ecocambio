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
      alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string
          id: string
          inverter_id: string | null
          is_active: boolean | null
          message: string | null
          plant_id: string
          raw_code: string | null
          resolved_at: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          started_at: string
          title: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string
          id?: string
          inverter_id?: string | null
          is_active?: boolean | null
          message?: string | null
          plant_id: string
          raw_code?: string | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          started_at?: string
          title: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string
          id?: string
          inverter_id?: string | null
          is_active?: boolean | null
          message?: string | null
          plant_id?: string
          raw_code?: string | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          started_at?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_inverter_id_fkey"
            columns: ["inverter_id"]
            isOneToOne: false
            referencedRelation: "inverters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
      }
      inverters: {
        Row: {
          api_credentials: Json | null
          api_url: string | null
          brand: Database["public"]["Enums"]["inverter_brand"]
          created_at: string
          firmware_version: string | null
          id: string
          last_seen_at: string | null
          model: string | null
          plant_id: string
          rated_power_kw: number | null
          serial_number: string | null
          status: Database["public"]["Enums"]["connection_status"] | null
          updated_at: string
        }
        Insert: {
          api_credentials?: Json | null
          api_url?: string | null
          brand: Database["public"]["Enums"]["inverter_brand"]
          created_at?: string
          firmware_version?: string | null
          id?: string
          last_seen_at?: string | null
          model?: string | null
          plant_id: string
          rated_power_kw?: number | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["connection_status"] | null
          updated_at?: string
        }
        Update: {
          api_credentials?: Json | null
          api_url?: string | null
          brand?: Database["public"]["Enums"]["inverter_brand"]
          created_at?: string
          firmware_version?: string | null
          id?: string
          last_seen_at?: string | null
          model?: string | null
          plant_id?: string
          rated_power_kw?: number | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["connection_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inverters_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
      }
      plant_technicians: {
        Row: {
          assigned_at: string
          can_edit: boolean | null
          id: string
          plant_id: string
          technician_id: string
        }
        Insert: {
          assigned_at?: string
          can_edit?: boolean | null
          id?: string
          plant_id: string
          technician_id: string
        }
        Update: {
          assigned_at?: string
          can_edit?: boolean | null
          id?: string
          plant_id?: string
          technician_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plant_technicians_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plant_technicians_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      plants: {
        Row: {
          address: string | null
          capacity_kw: number | null
          city: string | null
          client_email: string | null
          client_name: string | null
          client_phone: string | null
          created_at: string
          created_by: string | null
          id: string
          installation_date: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          name: string
          notes: string | null
          state: string | null
          tariff_mxn_kwh: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          capacity_kw?: number | null
          city?: string | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          installation_date?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name: string
          notes?: string | null
          state?: string | null
          tariff_mxn_kwh?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          capacity_kw?: number | null
          city?: string | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          installation_date?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name?: string
          notes?: string | null
          state?: string | null
          tariff_mxn_kwh?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      readings: {
        Row: {
          battery_soc: number | null
          created_at: string
          current_dc: number | null
          energy_today_kwh: number | null
          energy_total_kwh: number | null
          frequency_hz: number | null
          id: string
          inverter_id: string
          plant_id: string
          power_kw: number | null
          raw_data: Json | null
          recorded_at: string
          temperature_c: number | null
          voltage_ac: number | null
          voltage_dc: number | null
        }
        Insert: {
          battery_soc?: number | null
          created_at?: string
          current_dc?: number | null
          energy_today_kwh?: number | null
          energy_total_kwh?: number | null
          frequency_hz?: number | null
          id?: string
          inverter_id: string
          plant_id: string
          power_kw?: number | null
          raw_data?: Json | null
          recorded_at?: string
          temperature_c?: number | null
          voltage_ac?: number | null
          voltage_dc?: number | null
        }
        Update: {
          battery_soc?: number | null
          created_at?: string
          current_dc?: number | null
          energy_today_kwh?: number | null
          energy_total_kwh?: number | null
          frequency_hz?: number | null
          id?: string
          inverter_id?: string
          plant_id?: string
          power_kw?: number | null
          raw_data?: Json | null
          recorded_at?: string
          temperature_c?: number | null
          voltage_ac?: number | null
          voltage_dc?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "readings_inverter_id_fkey"
            columns: ["inverter_id"]
            isOneToOne: false
            referencedRelation: "inverters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "readings_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
      }
      sensor_readings: {
        Row: {
          created_at: string
          current: number
          id: string
          is_low_voltage: boolean
          kilowatts: number
          voltage: number
          watts: number
        }
        Insert: {
          created_at?: string
          current: number
          id?: string
          is_low_voltage?: boolean
          kilowatts: number
          voltage: number
          watts: number
        }
        Update: {
          created_at?: string
          current?: number
          id?: string
          is_low_voltage?: boolean
          kilowatts?: number
          voltage?: number
          watts?: number
        }
        Relationships: []
      }
      technicians: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          preferences: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          full_name: string
          id?: string
          phone?: string | null
          preferences?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          preferences?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      voltage_alerts: {
        Row: {
          avg_voltage: number | null
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          is_active: boolean
          min_voltage: number
          started_at: string
        }
        Insert: {
          avg_voltage?: number | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          is_active?: boolean
          min_voltage: number
          started_at?: string
        }
        Update: {
          avg_voltage?: number | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          is_active?: boolean
          min_voltage?: number
          started_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_plant: {
        Args: { _plant_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      alert_severity: "info" | "warning" | "critical"
      app_role: "admin" | "technician" | "viewer"
      connection_status: "online" | "offline" | "degraded" | "unknown"
      inverter_brand: "fronius" | "huawei" | "hoymiles" | "growatt" | "sma"
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
    Enums: {
      alert_severity: ["info", "warning", "critical"],
      app_role: ["admin", "technician", "viewer"],
      connection_status: ["online", "offline", "degraded", "unknown"],
      inverter_brand: ["fronius", "huawei", "hoymiles", "growatt", "sma"],
    },
  },
} as const
