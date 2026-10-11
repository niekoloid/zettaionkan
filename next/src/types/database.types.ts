export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          email: string | null
          subscription_tier: 'free' | 'entry' | 'standard' | 'premium'
          stripe_customer_id: string | null
          naming_convention: string | null
          preferred_instrument: string | null
          color_format: string | null
          custom_chords: Json | null
        }
        Insert: {
          id: string
          created_at?: string
          email?: string | null
          subscription_tier?: 'free' | 'entry' | 'standard' | 'premium'
          stripe_customer_id?: string | null
          naming_convention?: string | null
          preferred_instrument?: string | null
          color_format?: string | null
          custom_chords?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string | null
          subscription_tier?: 'free' | 'entry' | 'standard' | 'premium'
          stripe_customer_id?: string | null
          naming_convention?: string | null
          preferred_instrument?: string | null
          color_format?: string | null
          custom_chords?: Json | null
        }
      }
      training_sessions: {
        Row: {
          id: string
          user_id: string
          created_at: string
          score: number
          total_questions: number
          details: Json
          settings: Json
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          score: number
          total_questions: number
          details: Json
          settings: Json
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          score?: number
          total_questions?: number
          details?: Json
          settings?: Json
        }
      }
      inquiries: {
        Row: {
          id: string
          created_at: string
          name: string
          email: string
          subject: string
          message: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          email: string
          subject: string
          message: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          email?: string
          subject?: string
          message?: string
        }
      }

    }
  }
}
