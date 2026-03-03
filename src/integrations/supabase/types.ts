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
      dimensions: {
        Row: {
          description: string | null
          framework_version_id: string
          id: string
          key: string
          name: string
          sort_order: number
          weight: number
        }
        Insert: {
          description?: string | null
          framework_version_id: string
          id?: string
          key: string
          name: string
          sort_order?: number
          weight?: number
        }
        Update: {
          description?: string | null
          framework_version_id?: string
          id?: string
          key?: string
          name?: string
          sort_order?: number
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "dimensions_framework_version_id_fkey"
            columns: ["framework_version_id"]
            isOneToOne: false
            referencedRelation: "framework_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      framework_versions: {
        Row: {
          created_at: string
          framework_id: string
          id: string
          status: string
          version_label: string
        }
        Insert: {
          created_at?: string
          framework_id: string
          id?: string
          status?: string
          version_label: string
        }
        Update: {
          created_at?: string
          framework_id?: string
          id?: string
          status?: string
          version_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "framework_versions_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "frameworks"
            referencedColumns: ["id"]
          },
        ]
      }
      frameworks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          created_by: string | null
          delivery_model: string | null
          dependencies: string | null
          estimated_cost_band: string | null
          id: string
          links: Json | null
          name: string
          primary_users: string[] | null
          risks: string | null
          service_or_journey: string | null
          short_description: string | null
          sponsoring_area: string | null
          stage: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          delivery_model?: string | null
          dependencies?: string | null
          estimated_cost_band?: string | null
          id?: string
          links?: Json | null
          name: string
          primary_users?: string[] | null
          risks?: string | null
          service_or_journey?: string | null
          short_description?: string | null
          sponsoring_area?: string | null
          stage?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          delivery_model?: string | null
          dependencies?: string | null
          estimated_cost_band?: string | null
          id?: string
          links?: Json | null
          name?: string
          primary_users?: string[] | null
          risks?: string | null
          service_or_journey?: string | null
          short_description?: string | null
          sponsoring_area?: string | null
          stage?: string
          updated_at?: string
        }
        Relationships: []
      }
      test_responses: {
        Row: {
          created_at: string
          id: string
          response_value_json: Json | null
          test_id: string
          test_run_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          response_value_json?: Json | null
          test_id: string
          test_run_id: string
        }
        Update: {
          created_at?: string
          id?: string
          response_value_json?: Json | null
          test_id?: string
          test_run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_responses_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_responses_test_run_id_fkey"
            columns: ["test_run_id"]
            isOneToOne: false
            referencedRelation: "test_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      test_runs: {
        Row: {
          assessed_at: string
          assessed_by: string | null
          checkpoint: string
          created_at: string
          dimension_scores_json: Json | null
          framework_version_id: string
          id: string
          outcome: string | null
          overall_score: number | null
          project_id: string
          rationale_json: Json | null
        }
        Insert: {
          assessed_at?: string
          assessed_by?: string | null
          checkpoint: string
          created_at?: string
          dimension_scores_json?: Json | null
          framework_version_id: string
          id?: string
          outcome?: string | null
          overall_score?: number | null
          project_id: string
          rationale_json?: Json | null
        }
        Update: {
          assessed_at?: string
          assessed_by?: string | null
          checkpoint?: string
          created_at?: string
          dimension_scores_json?: Json | null
          framework_version_id?: string
          id?: string
          outcome?: string | null
          overall_score?: number | null
          project_id?: string
          rationale_json?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "test_runs_framework_version_id_fkey"
            columns: ["framework_version_id"]
            isOneToOne: false
            referencedRelation: "framework_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_runs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          description: string | null
          dimension_id: string
          framework_version_id: string
          gate_rule_json: Json | null
          guidance: string | null
          id: string
          input_type: string
          is_gate: boolean
          key: string
          label: string
          scale_max: number
          scale_min: number
          scoring_rule_json: Json | null
          sort_order: number
          weight: number
        }
        Insert: {
          description?: string | null
          dimension_id: string
          framework_version_id: string
          gate_rule_json?: Json | null
          guidance?: string | null
          id?: string
          input_type?: string
          is_gate?: boolean
          key: string
          label: string
          scale_max?: number
          scale_min?: number
          scoring_rule_json?: Json | null
          sort_order?: number
          weight?: number
        }
        Update: {
          description?: string | null
          dimension_id?: string
          framework_version_id?: string
          gate_rule_json?: Json | null
          guidance?: string | null
          id?: string
          input_type?: string
          is_gate?: boolean
          key?: string
          label?: string
          scale_max?: number
          scale_min?: number
          scoring_rule_json?: Json | null
          sort_order?: number
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "tests_dimension_id_fkey"
            columns: ["dimension_id"]
            isOneToOne: false
            referencedRelation: "dimensions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tests_framework_version_id_fkey"
            columns: ["framework_version_id"]
            isOneToOne: false
            referencedRelation: "framework_versions"
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
