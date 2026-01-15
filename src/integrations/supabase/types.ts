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
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          read_at: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          read_at?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          read_at?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      event_updates: {
        Row: {
          body: string
          event_id: string
          id: string
          recipient_count: number | null
          recipient_filter: string | null
          sent_at: string
          subject: string
        }
        Insert: {
          body: string
          event_id: string
          id?: string
          recipient_count?: number | null
          recipient_filter?: string | null
          sent_at?: string
          subject: string
        }
        Update: {
          body?: string
          event_id?: string
          id?: string
          recipient_count?: number | null
          recipient_filter?: string | null
          sent_at?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_updates_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_updates_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_public"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          address: string | null
          allow_going: boolean | null
          allow_maybe: boolean | null
          allow_not_going: boolean | null
          allow_plus_ones: boolean | null
          auto_delete_days: number | null
          capacity: number | null
          collect_dietary: boolean | null
          collect_email: boolean | null
          cover_image: string | null
          created_at: string
          custom_questions: Json | null
          description: string | null
          edit_token: string
          enable_waitlist: boolean | null
          end_time: string | null
          guest_list_visibility: string | null
          host_email: string | null
          host_name: string
          id: string
          location_type: string | null
          location_visibility: string | null
          max_plus_ones: number | null
          notify_on_rsvp: boolean | null
          password: string | null
          password_hash: string | null
          password_hint: string | null
          slug: string
          start_time: string
          status: string | null
          timezone: string | null
          title: string
          updated_at: string
          venue_name: string | null
          virtual_link: string | null
          virtual_link_visibility: string | null
        }
        Insert: {
          address?: string | null
          allow_going?: boolean | null
          allow_maybe?: boolean | null
          allow_not_going?: boolean | null
          allow_plus_ones?: boolean | null
          auto_delete_days?: number | null
          capacity?: number | null
          collect_dietary?: boolean | null
          collect_email?: boolean | null
          cover_image?: string | null
          created_at?: string
          custom_questions?: Json | null
          description?: string | null
          edit_token: string
          enable_waitlist?: boolean | null
          end_time?: string | null
          guest_list_visibility?: string | null
          host_email?: string | null
          host_name: string
          id?: string
          location_type?: string | null
          location_visibility?: string | null
          max_plus_ones?: number | null
          notify_on_rsvp?: boolean | null
          password?: string | null
          password_hash?: string | null
          password_hint?: string | null
          slug: string
          start_time: string
          status?: string | null
          timezone?: string | null
          title: string
          updated_at?: string
          venue_name?: string | null
          virtual_link?: string | null
          virtual_link_visibility?: string | null
        }
        Update: {
          address?: string | null
          allow_going?: boolean | null
          allow_maybe?: boolean | null
          allow_not_going?: boolean | null
          allow_plus_ones?: boolean | null
          auto_delete_days?: number | null
          capacity?: number | null
          collect_dietary?: boolean | null
          collect_email?: boolean | null
          cover_image?: string | null
          created_at?: string
          custom_questions?: Json | null
          description?: string | null
          edit_token?: string
          enable_waitlist?: boolean | null
          end_time?: string | null
          guest_list_visibility?: string | null
          host_email?: string | null
          host_name?: string
          id?: string
          location_type?: string | null
          location_visibility?: string | null
          max_plus_ones?: number | null
          notify_on_rsvp?: boolean | null
          password?: string | null
          password_hash?: string | null
          password_hint?: string | null
          slug?: string
          start_time?: string
          status?: string | null
          timezone?: string | null
          title?: string
          updated_at?: string
          venue_name?: string | null
          virtual_link?: string | null
          virtual_link_visibility?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string
        }
        Insert: {
          action?: string
          created_at?: string
          id?: string
          ip_address: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string
        }
        Relationships: []
      }
      rsvps: {
        Row: {
          created_at: string
          custom_answers: Json | null
          dietary_note: string | null
          email: string | null
          event_id: string
          fingerprint: string | null
          id: string
          name: string
          notifications_enabled: boolean | null
          plus_ones: number | null
          status: string
          updated_at: string
          waitlist_position: number | null
        }
        Insert: {
          created_at?: string
          custom_answers?: Json | null
          dietary_note?: string | null
          email?: string | null
          event_id: string
          fingerprint?: string | null
          id?: string
          name: string
          notifications_enabled?: boolean | null
          plus_ones?: number | null
          status: string
          updated_at?: string
          waitlist_position?: number | null
        }
        Update: {
          created_at?: string
          custom_answers?: Json | null
          dietary_note?: string | null
          email?: string | null
          event_id?: string
          fingerprint?: string | null
          id?: string
          name?: string
          notifications_enabled?: boolean | null
          plus_ones?: number | null
          status?: string
          updated_at?: string
          waitlist_position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      events_public: {
        Row: {
          address: string | null
          allow_going: boolean | null
          allow_maybe: boolean | null
          allow_not_going: boolean | null
          allow_plus_ones: boolean | null
          auto_delete_days: number | null
          capacity: number | null
          collect_dietary: boolean | null
          collect_email: boolean | null
          cover_image: string | null
          created_at: string | null
          custom_questions: Json | null
          description: string | null
          enable_waitlist: boolean | null
          end_time: string | null
          guest_list_visibility: string | null
          host_name: string | null
          id: string | null
          location_type: string | null
          location_visibility: string | null
          max_plus_ones: number | null
          notify_on_rsvp: boolean | null
          slug: string | null
          start_time: string | null
          status: string | null
          timezone: string | null
          title: string | null
          updated_at: string | null
          venue_name: string | null
          virtual_link: string | null
          virtual_link_visibility: string | null
        }
        Insert: {
          address?: string | null
          allow_going?: boolean | null
          allow_maybe?: boolean | null
          allow_not_going?: boolean | null
          allow_plus_ones?: boolean | null
          auto_delete_days?: number | null
          capacity?: number | null
          collect_dietary?: boolean | null
          collect_email?: boolean | null
          cover_image?: string | null
          created_at?: string | null
          custom_questions?: Json | null
          description?: string | null
          enable_waitlist?: boolean | null
          end_time?: string | null
          guest_list_visibility?: string | null
          host_name?: string | null
          id?: string | null
          location_type?: string | null
          location_visibility?: string | null
          max_plus_ones?: number | null
          notify_on_rsvp?: boolean | null
          slug?: string | null
          start_time?: string | null
          status?: string | null
          timezone?: string | null
          title?: string | null
          updated_at?: string | null
          venue_name?: string | null
          virtual_link?: string | null
          virtual_link_visibility?: string | null
        }
        Update: {
          address?: string | null
          allow_going?: boolean | null
          allow_maybe?: boolean | null
          allow_not_going?: boolean | null
          allow_plus_ones?: boolean | null
          auto_delete_days?: number | null
          capacity?: number | null
          collect_dietary?: boolean | null
          collect_email?: boolean | null
          cover_image?: string | null
          created_at?: string | null
          custom_questions?: Json | null
          description?: string | null
          enable_waitlist?: boolean | null
          end_time?: string | null
          guest_list_visibility?: string | null
          host_name?: string | null
          id?: string | null
          location_type?: string | null
          location_visibility?: string | null
          max_plus_ones?: number | null
          notify_on_rsvp?: boolean | null
          slug?: string | null
          start_time?: string | null
          status?: string | null
          timezone?: string | null
          title?: string | null
          updated_at?: string | null
          venue_name?: string | null
          virtual_link?: string | null
          virtual_link_visibility?: string | null
        }
        Relationships: []
      }
      rsvps_public: {
        Row: {
          created_at: string | null
          custom_answers: Json | null
          event_id: string | null
          id: string | null
          name: string | null
          plus_ones: number | null
          status: string | null
          updated_at: string | null
          waitlist_position: number | null
        }
        Insert: {
          created_at?: string | null
          custom_answers?: Json | null
          event_id?: string | null
          id?: string | null
          name?: string | null
          plus_ones?: number | null
          status?: string | null
          updated_at?: string | null
          waitlist_position?: number | null
        }
        Update: {
          created_at?: string | null
          custom_answers?: Json | null
          event_id?: string | null
          id?: string | null
          name?: string | null
          plus_ones?: number | null
          status?: string | null
          updated_at?: string | null
          waitlist_position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      delete_event_with_token: {
        Args: { p_edit_token: string; p_id: string }
        Returns: boolean
      }
      delete_rsvp_secure: {
        Args: {
          p_edit_token?: string
          p_fingerprint?: string
          p_rsvp_id: string
        }
        Returns: boolean
      }
      event_has_password: { Args: { p_slug: string }; Returns: boolean }
      get_event_by_edit_token: {
        Args: { p_edit_token: string }
        Returns: {
          address: string | null
          allow_going: boolean | null
          allow_maybe: boolean | null
          allow_not_going: boolean | null
          allow_plus_ones: boolean | null
          auto_delete_days: number | null
          capacity: number | null
          collect_dietary: boolean | null
          collect_email: boolean | null
          cover_image: string | null
          created_at: string
          custom_questions: Json | null
          description: string | null
          edit_token: string
          enable_waitlist: boolean | null
          end_time: string | null
          guest_list_visibility: string | null
          host_email: string | null
          host_name: string
          id: string
          location_type: string | null
          location_visibility: string | null
          max_plus_ones: number | null
          notify_on_rsvp: boolean | null
          password: string | null
          password_hash: string | null
          password_hint: string | null
          slug: string
          start_time: string
          status: string | null
          timezone: string | null
          title: string
          updated_at: string
          venue_name: string | null
          virtual_link: string | null
          virtual_link_visibility: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "events"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_event_password_hint: { Args: { p_slug: string }; Returns: string }
      get_event_updates_for_host: {
        Args: { p_edit_token: string; p_event_id: string }
        Returns: {
          body: string
          event_id: string
          id: string
          recipient_count: number | null
          recipient_filter: string | null
          sent_at: string
          subject: string
        }[]
        SetofOptions: {
          from: "*"
          to: "event_updates"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_event_with_token: {
        Args: { p_edit_token: string; p_slug: string }
        Returns: {
          address: string | null
          allow_going: boolean | null
          allow_maybe: boolean | null
          allow_not_going: boolean | null
          allow_plus_ones: boolean | null
          auto_delete_days: number | null
          capacity: number | null
          collect_dietary: boolean | null
          collect_email: boolean | null
          cover_image: string | null
          created_at: string
          custom_questions: Json | null
          description: string | null
          edit_token: string
          enable_waitlist: boolean | null
          end_time: string | null
          guest_list_visibility: string | null
          host_email: string | null
          host_name: string
          id: string
          location_type: string | null
          location_visibility: string | null
          max_plus_ones: number | null
          notify_on_rsvp: boolean | null
          password: string | null
          password_hash: string | null
          password_hint: string | null
          slug: string
          start_time: string
          status: string | null
          timezone: string | null
          title: string
          updated_at: string
          venue_name: string | null
          virtual_link: string | null
          virtual_link_visibility: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "events"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_rsvps_for_host: {
        Args: { p_edit_token: string; p_event_id: string }
        Returns: {
          created_at: string
          custom_answers: Json | null
          dietary_note: string | null
          email: string | null
          event_id: string
          fingerprint: string | null
          id: string
          name: string
          notifications_enabled: boolean | null
          plus_ones: number | null
          status: string
          updated_at: string
          waitlist_position: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "rsvps"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      insert_event_update_secure: {
        Args: {
          p_body: string
          p_edit_token: string
          p_event_id: string
          p_recipient_count?: number
          p_recipient_filter?: string
          p_subject: string
        }
        Returns: {
          body: string
          event_id: string
          id: string
          recipient_count: number | null
          recipient_filter: string | null
          sent_at: string
          subject: string
        }
        SetofOptions: {
          from: "*"
          to: "event_updates"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      insert_rsvp_with_capacity_check: {
        Args: {
          p_custom_answers?: Json
          p_dietary_note?: string
          p_email?: string
          p_event_id: string
          p_name: string
          p_notifications_enabled?: boolean
          p_plus_ones?: number
          p_status?: string
        }
        Returns: Json
      }
      is_event_editor: {
        Args: { p_edit_token: string; p_event_id: string }
        Returns: boolean
      }
      update_event_with_token: {
        Args: { p_edit_token: string; p_id: string; p_updates: Json }
        Returns: {
          address: string | null
          allow_going: boolean | null
          allow_maybe: boolean | null
          allow_not_going: boolean | null
          allow_plus_ones: boolean | null
          auto_delete_days: number | null
          capacity: number | null
          collect_dietary: boolean | null
          collect_email: boolean | null
          cover_image: string | null
          created_at: string
          custom_questions: Json | null
          description: string | null
          edit_token: string
          enable_waitlist: boolean | null
          end_time: string | null
          guest_list_visibility: string | null
          host_email: string | null
          host_name: string
          id: string
          location_type: string | null
          location_visibility: string | null
          max_plus_ones: number | null
          notify_on_rsvp: boolean | null
          password: string | null
          password_hash: string | null
          password_hint: string | null
          slug: string
          start_time: string
          status: string | null
          timezone: string | null
          title: string
          updated_at: string
          venue_name: string | null
          virtual_link: string | null
          virtual_link_visibility: string | null
        }
        SetofOptions: {
          from: "*"
          to: "events"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_rsvp_secure: {
        Args: { p_fingerprint: string; p_rsvp_id: string; p_updates: Json }
        Returns: {
          created_at: string
          custom_answers: Json | null
          dietary_note: string | null
          email: string | null
          event_id: string
          fingerprint: string | null
          id: string
          name: string
          notifications_enabled: boolean | null
          plus_ones: number | null
          status: string
          updated_at: string
          waitlist_position: number | null
        }
        SetofOptions: {
          from: "*"
          to: "rsvps"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      verify_event_password: {
        Args: { p_password: string; p_slug: string }
        Returns: boolean
      }
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
