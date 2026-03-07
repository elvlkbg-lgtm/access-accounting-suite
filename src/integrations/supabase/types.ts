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
      accountant_profiles: {
        Row: {
          bio: string | null
          created_at: string
          display_name: string | null
          experience_years: number | null
          id: string
          is_approved: boolean
          location: string | null
          rating: number | null
          specialization: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_name?: string | null
          experience_years?: number | null
          id?: string
          is_approved?: boolean
          location?: string | null
          rating?: number | null
          specialization?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_name?: string | null
          experience_years?: number | null
          id?: string
          is_approved?: boolean
          location?: string | null
          rating?: number | null
          specialization?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      accountant_reviews: {
        Row: {
          accountant_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          reviewer_id: string
        }
        Insert: {
          accountant_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          reviewer_id: string
        }
        Update: {
          accountant_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          reviewer_id?: string
        }
        Relationships: []
      }
      auditor_directory: {
        Row: {
          city: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          ides_number: string | null
          phone: string | null
          qualification: string | null
          source: string
          source_url: string | null
          specialization: string[] | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          ides_number?: string | null
          phone?: string | null
          qualification?: string | null
          source?: string
          source_url?: string | null
          specialization?: string[] | null
        }
        Update: {
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          ides_number?: string | null
          phone?: string | null
          qualification?: string | null
          source?: string
          source_url?: string | null
          specialization?: string[] | null
        }
        Relationships: []
      }
      blog_articles: {
        Row: {
          category: string
          content: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string
          source_name: string | null
          source_url: string | null
          title: string
        }
        Insert: {
          category?: string
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string
          source_name?: string | null
          source_url?: string | null
          title: string
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string
          source_name?: string | null
          source_url?: string | null
          title?: string
        }
        Relationships: []
      }
      consultations: {
        Row: {
          accountant_id: string
          client_id: string
          created_at: string
          duration_minutes: number
          id: string
          notes: string | null
          scheduled_at: string
          status: string
        }
        Insert: {
          accountant_id: string
          client_id: string
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          scheduled_at: string
          status?: string
        }
        Update: {
          accountant_id?: string
          client_id?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          scheduled_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultations_accountant_id_fkey"
            columns: ["accountant_id"]
            isOneToOne: false
            referencedRelation: "accountant_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          folder_id: string | null
          id: string
          service_request_id: string | null
          status: Database["public"]["Enums"]["document_status"]
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          folder_id?: string | null
          id?: string
          service_request_id?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          folder_id?: string | null
          id?: string
          service_request_id?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      folders: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          parent_id: string | null
          shared_with: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          parent_id?: string | null
          shared_with?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          parent_id?: string | null
          shared_with?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          receiver_id: string
          sender_id: string
          service_request_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id: string
          sender_id: string
          service_request_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id?: string
          sender_id?: string
          service_request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          online_status: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          online_status?: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          online_status?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          accountant_id: string
          client_id: string
          created_at: string
          description: string | null
          id: string
          service_id: string | null
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
        }
        Insert: {
          accountant_id: string
          client_id: string
          created_at?: string
          description?: string | null
          id?: string
          service_id?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
        }
        Update: {
          accountant_id?: string
          client_id?: string
          created_at?: string
          description?: string | null
          id?: string
          service_id?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_accountant_id_fkey"
            columns: ["accountant_id"]
            isOneToOne: false
            referencedRelation: "accountant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          accountant_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          price: number
        }
        Insert: {
          accountant_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price: number
        }
        Update: {
          accountant_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "services_accountant_id_fkey"
            columns: ["accountant_id"]
            isOneToOne: false
            referencedRelation: "accountant_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_request_participant: {
        Args: { _request_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "accountant" | "client"
      document_status: "uploaded" | "in_review" | "processed" | "returned"
      request_status:
        | "pending"
        | "accepted"
        | "in_progress"
        | "completed"
        | "rejected"
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
      app_role: ["admin", "accountant", "client"],
      document_status: ["uploaded", "in_review", "processed", "returned"],
      request_status: [
        "pending",
        "accepted",
        "in_progress",
        "completed",
        "rejected",
      ],
    },
  },
} as const
