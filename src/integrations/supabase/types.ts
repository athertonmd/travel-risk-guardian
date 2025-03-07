export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          created_at: string
          id: string
          name: string
          status: Database["public"]["Enums"]["client_status"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          status?: Database["public"]["Enums"]["client_status"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["client_status"] | null
          updated_at?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          cc: string[] | null
          cc_error_message: string | null
          cc_status: Database["public"]["Enums"]["email_status"] | null
          client_id: string | null
          country: string
          id: string
          recipient: string
          recipient_error_message: string | null
          recipient_status: Database["public"]["Enums"]["email_status"]
          risk_level: Database["public"]["Enums"]["risk_level"]
          sent_at: string | null
          sent_by: string
          traveller_name: string | null
          updated_at: string | null
        }
        Insert: {
          cc?: string[] | null
          cc_error_message?: string | null
          cc_status?: Database["public"]["Enums"]["email_status"] | null
          client_id?: string | null
          country: string
          id?: string
          recipient: string
          recipient_error_message?: string | null
          recipient_status: Database["public"]["Enums"]["email_status"]
          risk_level: Database["public"]["Enums"]["risk_level"]
          sent_at?: string | null
          sent_by: string
          traveller_name?: string | null
          updated_at?: string | null
        }
        Update: {
          cc?: string[] | null
          cc_error_message?: string | null
          cc_status?: Database["public"]["Enums"]["email_status"] | null
          client_id?: string | null
          country?: string
          id?: string
          recipient?: string
          recipient_error_message?: string | null
          recipient_status?: Database["public"]["Enums"]["email_status"]
          risk_level?: Database["public"]["Enums"]["risk_level"]
          sent_at?: string | null
          sent_by?: string
          traveller_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Relationships: []
      }
      risk_assessments: {
        Row: {
          amended_by: string
          assessment: Database["public"]["Enums"]["risk_level"]
          client_id: string | null
          country: string
          created_at: string
          id: string
          information: string
          updated_at: string
        }
        Insert: {
          amended_by: string
          assessment: Database["public"]["Enums"]["risk_level"]
          client_id?: string | null
          country: string
          created_at?: string
          id?: string
          information: string
          updated_at?: string
        }
        Update: {
          amended_by?: string
          assessment?: Database["public"]["Enums"]["risk_level"]
          client_id?: string | null
          country?: string
          created_at?: string
          id?: string
          information?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_assessments_amended_by_fkey"
            columns: ["amended_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_assessments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      client_status: "active" | "inactive"
      email_status: "sent" | "failed" | "pending"
      risk_level: "low" | "medium" | "high" | "extreme"
      user_role: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
