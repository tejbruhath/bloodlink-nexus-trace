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
      blood_inventory: {
        Row: {
          blockchain_transaction_id: string | null
          blood_type: string
          created_at: string
          donation_date: string
          donor_id: string | null
          expiry_date: string
          hospital_id: string | null
          hospital_name: string | null
          id: string
          quantity: number
          status: string
        }
        Insert: {
          blockchain_transaction_id?: string | null
          blood_type: string
          created_at?: string
          donation_date?: string
          donor_id?: string | null
          expiry_date: string
          hospital_id?: string | null
          hospital_name?: string | null
          id?: string
          quantity: number
          status?: string
        }
        Update: {
          blockchain_transaction_id?: string | null
          blood_type?: string
          created_at?: string
          donation_date?: string
          donor_id?: string | null
          expiry_date?: string
          hospital_id?: string | null
          hospital_name?: string | null
          id?: string
          quantity?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "blood_inventory_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
        ]
      }
      blood_requests: {
        Row: {
          blood_type: string
          created_at: string | null
          hospital_id: string | null
          hospital_name: string
          id: string
          matched_donor_id: string | null
          matched_inventory_id: string | null
          patient_name: string
          status: string | null
          units_needed: number
          updated_at: string | null
          urgency_level: string
        }
        Insert: {
          blood_type: string
          created_at?: string | null
          hospital_id?: string | null
          hospital_name: string
          id?: string
          matched_donor_id?: string | null
          matched_inventory_id?: string | null
          patient_name: string
          status?: string | null
          units_needed: number
          updated_at?: string | null
          urgency_level: string
        }
        Update: {
          blood_type?: string
          created_at?: string | null
          hospital_id?: string | null
          hospital_name?: string
          id?: string
          matched_donor_id?: string | null
          matched_inventory_id?: string | null
          patient_name?: string
          status?: string | null
          units_needed?: number
          updated_at?: string | null
          urgency_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "blood_requests_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blood_requests_matched_donor_id_fkey"
            columns: ["matched_donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blood_requests_matched_inventory_id_fkey"
            columns: ["matched_inventory_id"]
            isOneToOne: false
            referencedRelation: "blood_inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      donors: {
        Row: {
          age: number
          blockchain_id: number | null
          blood_type: string
          contact_number: string
          created_at: string
          distance: number | null
          email: string
          gender: string
          id: string
          last_donation_date: string | null
          location: string
          name: string
        }
        Insert: {
          age: number
          blockchain_id?: number | null
          blood_type: string
          contact_number: string
          created_at?: string
          distance?: number | null
          email: string
          gender: string
          id?: string
          last_donation_date?: string | null
          location: string
          name: string
        }
        Update: {
          age?: number
          blockchain_id?: number | null
          blood_type?: string
          contact_number?: string
          created_at?: string
          distance?: number | null
          email?: string
          gender?: string
          id?: string
          last_donation_date?: string | null
          location?: string
          name?: string
        }
        Relationships: []
      }
      hospitals: {
        Row: {
          contact_number: string | null
          created_at: string
          id: string
          location: string
          name: string
        }
        Insert: {
          contact_number?: string | null
          created_at?: string
          id?: string
          location: string
          name: string
        }
        Update: {
          contact_number?: string | null
          created_at?: string
          id?: string
          location?: string
          name?: string
        }
        Relationships: []
      }
      items: {
        Row: {
          created_at: string
          description: string
          id: string
          image: string | null
          location: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          image?: string | null
          location: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          image?: string | null
          location?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          username?: string | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
