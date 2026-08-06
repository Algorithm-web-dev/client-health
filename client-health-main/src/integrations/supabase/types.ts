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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      action_log: {
        Row: {
          client_id: string
          created_at: string | null
          cycle_id: string
          deadline: string | null
          description: string
          id: string
          outcome: string | null
          owner: string | null
          status: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          cycle_id: string
          deadline?: string | null
          description: string
          id?: string
          outcome?: string | null
          owner?: string | null
          status?: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          cycle_id?: string
          deadline?: string | null
          description?: string
          id?: string
          outcome?: string | null
          owner?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_log_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_deltas: {
        Row: {
          agent_output_id: string
          client_id: string
          cycle_id: string
          id: string
          new_flags: Json | null
          resolved_flags: Json | null
          risk_after: string | null
          risk_before: string | null
          summary: string | null
        }
        Insert: {
          agent_output_id: string
          client_id: string
          cycle_id: string
          id?: string
          new_flags?: Json | null
          resolved_flags?: Json | null
          risk_after?: string | null
          risk_before?: string | null
          summary?: string | null
        }
        Update: {
          agent_output_id?: string
          client_id?: string
          cycle_id?: string
          id?: string
          new_flags?: Json | null
          resolved_flags?: Json | null
          risk_after?: string | null
          risk_before?: string | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_deltas_agent_output_id_fkey"
            columns: ["agent_output_id"]
            isOneToOne: false
            referencedRelation: "agent_outputs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_deltas_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_deltas_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_outputs: {
        Row: {
          client_id: string
          created_at: string | null
          cycle_id: string
          id: string
          insight_narrative: string | null
          recommended_actions: Json | null
          status: string
          submission_id: string
          trajectory_flag: Json | null
          type: string
          upsell_window: Json | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          cycle_id: string
          id?: string
          insight_narrative?: string | null
          recommended_actions?: Json | null
          status?: string
          submission_id: string
          trajectory_flag?: Json | null
          type?: string
          upsell_window?: Json | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          cycle_id?: string
          id?: string
          insight_narrative?: string | null
          recommended_actions?: Json | null
          status?: string
          submission_id?: string
          trajectory_flag?: Json | null
          type?: string
          upsell_window?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_outputs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_outputs_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_outputs_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          ci_leads: string[]
          director_support: string | null
          id: string
          memory_summary: string | null
          name: string
          scope: Json
          status: string
          tier: string | null
        }
        Insert: {
          ci_leads?: string[]
          director_support?: string | null
          id?: string
          memory_summary?: string | null
          name: string
          scope?: Json
          status?: string
          tier?: string | null
        }
        Update: {
          ci_leads?: string[]
          director_support?: string | null
          id?: string
          memory_summary?: string | null
          name?: string
          scope?: Json
          status?: string
          tier?: string | null
        }
        Relationships: []
      }
      cycles: {
        Row: {
          batch_run_completed: boolean
          end_date: string
          id: string
          is_seed: boolean
          label: string
          start_date: string
          status: string
        }
        Insert: {
          batch_run_completed?: boolean
          end_date: string
          id: string
          is_seed?: boolean
          label: string
          start_date: string
          status?: string
        }
        Update: {
          batch_run_completed?: boolean
          end_date?: string
          id?: string
          is_seed?: boolean
          label?: string
          start_date?: string
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          answer_text: string | null
          client_id: string
          cycle_id: string
          generated_by_agent: boolean
          id: string
          is_fallback: boolean
          question_context: string | null
          question_text: string
          rag_at_time: string | null
          submission_id: string
        }
        Insert: {
          answer_text?: string | null
          client_id: string
          cycle_id: string
          generated_by_agent?: boolean
          id?: string
          is_fallback?: boolean
          question_context?: string | null
          question_text: string
          rag_at_time?: string | null
          submission_id: string
        }
        Update: {
          answer_text?: string | null
          client_id?: string
          cycle_id?: string
          generated_by_agent?: boolean
          id?: string
          is_fallback?: boolean
          question_context?: string | null
          question_text?: string
          rag_at_time?: string | null
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          agent_output_id: string
          decision: string
          id: string
          override_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
        }
        Insert: {
          agent_output_id: string
          decision: string
          id?: string
          override_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Update: {
          agent_output_id?: string
          decision?: string
          id?: string
          override_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_agent_output_id_fkey"
            columns: ["agent_output_id"]
            isOneToOne: false
            referencedRelation: "agent_outputs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          action_deadline: string | null
          action_owner: string | null
          client_id: string
          confidence_score: number | null
          cycle_id: string
          fast_path: boolean
          growth_rag: string | null
          growth_reason: string | null
          hidden_risk: boolean | null
          hidden_risk_reason: string | null
          id: string
          is_seed: boolean
          next_action: string | null
          overall_rag: string | null
          paid_rag: string | null
          paid_reason: string | null
          performance_rag: string | null
          performance_reason: string | null
          relationship_rag: string | null
          relationship_reason: string | null
          status: string
          submitted_at: string | null
          submitted_by: string | null
          upsell_opportunity: string | null
          upsell_probability: number | null
          upsell_value: string | null
          validation_flags: Json | null
          version: number
        }
        Insert: {
          action_deadline?: string | null
          action_owner?: string | null
          client_id: string
          confidence_score?: number | null
          cycle_id: string
          fast_path?: boolean
          growth_rag?: string | null
          growth_reason?: string | null
          hidden_risk?: boolean | null
          hidden_risk_reason?: string | null
          id?: string
          is_seed?: boolean
          next_action?: string | null
          overall_rag?: string | null
          paid_rag?: string | null
          paid_reason?: string | null
          performance_rag?: string | null
          performance_reason?: string | null
          relationship_rag?: string | null
          relationship_reason?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          upsell_opportunity?: string | null
          upsell_probability?: number | null
          upsell_value?: string | null
          validation_flags?: Json | null
          version?: number
        }
        Update: {
          action_deadline?: string | null
          action_owner?: string | null
          client_id?: string
          confidence_score?: number | null
          cycle_id?: string
          fast_path?: boolean
          growth_rag?: string | null
          growth_reason?: string | null
          hidden_risk?: boolean | null
          hidden_risk_reason?: string | null
          id?: string
          is_seed?: boolean
          next_action?: string | null
          overall_rag?: string | null
          paid_rag?: string | null
          paid_reason?: string | null
          performance_rag?: string | null
          performance_reason?: string | null
          relationship_rag?: string | null
          relationship_reason?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          upsell_opportunity?: string | null
          upsell_probability?: number | null
          upsell_value?: string | null
          validation_flags?: Json | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "submissions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_role_is: { Args: { _roles: string[] }; Returns: boolean }
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
