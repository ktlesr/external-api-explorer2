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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: number
          setting_value_text: string | null
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: number
          setting_value_text?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: number
          setting_value_text?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          announcement_date: string
          created_at: string
          detail: string
          display_order: number | null
          external_link: string | null
          id: string
          institution_logo: string
          institution_name: string
          is_active: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          announcement_date?: string
          created_at?: string
          detail: string
          display_order?: number | null
          external_link?: string | null
          id?: string
          institution_logo: string
          institution_name: string
          is_active?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          announcement_date?: string
          created_at?: string
          detail?: string
          display_order?: number | null
          external_link?: string | null
          id?: string
          institution_logo?: string
          institution_name?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      app_statistics: {
        Row: {
          created_at: string
          id: string
          stat_name: string
          stat_value: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          stat_name: string
          stat_value?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          stat_name?: string
          stat_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      cb_knowledge_base: {
        Row: {
          answer: string
          created_at: string | null
          embedding: string | null
          id: string
          question: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          question: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          question?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cb_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          session_id?: string
        }
        Relationships: []
      }
      cb_sessions: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          session_id: string
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          session_id: string
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          session_id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          grounding_chunks: Json | null
          id: string
          role: string
          session_id: string
          sources: string[] | null
        }
        Insert: {
          content: string
          created_at?: string | null
          grounding_chunks?: Json | null
          id?: string
          role: string
          session_id: string
          sources?: string[] | null
        }
        Update: {
          content?: string
          created_at?: string | null
          grounding_chunks?: Json | null
          id?: string
          role?: string
          session_id?: string
          sources?: string[] | null
        }
        Relationships: []
      }
      chat_sessions: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chatbot_knowledge: {
        Row: {
          answer: string
          created_at: string | null
          embedding: string | null
          id: string
          question: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          question: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          question?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chatbot_knowledge_768: {
        Row: {
          answer: string
          created_at: string | null
          embedding: string | null
          id: string
          question: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          question: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          question?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      custom_rag_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string | null
          document_id: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          store_id: string | null
          token_count: number | null
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string | null
          document_id?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          store_id?: string | null
          token_count?: number | null
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string | null
          document_id?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          store_id?: string | null
          token_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_rag_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "custom_rag_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_rag_chunks_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "custom_rag_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_rag_documents: {
        Row: {
          chunks_count: number | null
          created_at: string | null
          custom_metadata: Json | null
          display_name: string
          error_message: string | null
          file_size: number | null
          file_type: string | null
          id: string
          name: string
          original_content: string | null
          status: string | null
          store_id: string | null
        }
        Insert: {
          chunks_count?: number | null
          created_at?: string | null
          custom_metadata?: Json | null
          display_name: string
          error_message?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          name: string
          original_content?: string | null
          status?: string | null
          store_id?: string | null
        }
        Update: {
          chunks_count?: number | null
          created_at?: string | null
          custom_metadata?: Json | null
          display_name?: string
          error_message?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          name?: string
          original_content?: string | null
          status?: string | null
          store_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_rag_documents_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "custom_rag_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_rag_stores: {
        Row: {
          chunk_overlap: number | null
          chunk_size: number | null
          created_at: string | null
          created_by: string | null
          display_name: string
          embedding_dimensions: number
          embedding_model: string
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          chunk_overlap?: number | null
          chunk_size?: number | null
          created_at?: string | null
          created_by?: string | null
          display_name: string
          embedding_dimensions?: number
          embedding_model?: string
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          chunk_overlap?: number | null
          chunk_size?: number | null
          created_at?: string | null
          created_by?: string | null
          display_name?: string
          embedding_dimensions?: number
          embedding_model?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      districts: {
        Row: {
          created_at: string | null
          id: number
          name: string
          province_id: number
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          province_id: number
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          province_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "districts_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      document_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      document_chunks: {
        Row: {
          content: string
          created_at: string | null
          embedding: string
          id: number
          metadata: Json
        }
        Insert: {
          content: string
          created_at?: string | null
          embedding: string
          id?: number
          metadata: Json
        }
        Update: {
          content?: string
          created_at?: string | null
          embedding?: string
          id?: number
          metadata?: Json
        }
        Relationships: []
      }
      document_tags: {
        Row: {
          color: string | null
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: number
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      document_uploads: {
        Row: {
          chunks_count: number | null
          created_at: string
          error_message: string | null
          file_size: number
          filename: string
          id: string
          status: string
          uploaded_by: string | null
        }
        Insert: {
          chunks_count?: number | null
          created_at?: string
          error_message?: string | null
          file_size: number
          filename: string
          id?: string
          status?: string
          uploaded_by?: string | null
        }
        Update: {
          chunks_count?: number | null
          created_at?: string
          error_message?: string | null
          file_size?: number
          filename?: string
          id?: string
          status?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      exchange_rates: {
        Row: {
          created_at: string
          date: string
          eur_buying: number
          eur_selling: number
          gbp_buying: number
          gbp_selling: number
          id: string
          updated_at: string
          usd_buying: number
          usd_selling: number
        }
        Insert: {
          created_at?: string
          date: string
          eur_buying: number
          eur_selling: number
          gbp_buying: number
          gbp_selling: number
          id?: string
          updated_at?: string
          usd_buying: number
          usd_selling: number
        }
        Update: {
          created_at?: string
          date?: string
          eur_buying?: number
          eur_selling?: number
          gbp_buying?: number
          gbp_selling?: number
          id?: string
          updated_at?: string
          usd_buying?: number
          usd_selling?: number
        }
        Relationships: []
      }
      file_attachments: {
        Row: {
          display_order: number
          file_url: string
          filename: string
          id: string
          support_program_id: string | null
          uploaded_at: string | null
        }
        Insert: {
          display_order?: number
          file_url: string
          filename: string
          id?: string
          support_program_id?: string | null
          uploaded_at?: string | null
        }
        Update: {
          display_order?: number
          file_url?: string
          filename?: string
          id?: string
          support_program_id?: string | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "file_attachments_support_program_id_fkey"
            columns: ["support_program_id"]
            isOneToOne: false
            referencedRelation: "support_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      glossary_terms: {
        Row: {
          created_at: string
          definition: string
          id: string
          term: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          definition: string
          id?: string
          term: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          definition?: string
          id?: string
          term?: string
          updated_at?: string
        }
        Relationships: []
      }
      gtipdortlu: {
        Row: {
          created_at: string | null
          description: string
          gtipcode: string
          id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          gtipcode: string
          id?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          gtipcode?: string
          id?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      incentive_queries: {
        Row: {
          created_at: string | null
          district: string | null
          id: string
          osb_status: string | null
          province: string | null
          result: Json | null
          sector: string | null
          sector_nace: string | null
          session_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          district?: string | null
          id?: string
          osb_status?: string | null
          province?: string | null
          result?: Json | null
          sector?: string | null
          sector_nace?: string | null
          session_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          district?: string | null
          id?: string
          osb_status?: string | null
          province?: string | null
          result?: Json | null
          sector?: string | null
          sector_nace?: string | null
          session_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incentive_queries_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      incentive_supports: {
        Row: {
          created_at: string | null
          customs_exemption: boolean | null
          district_id: number
          id: number
          kdv_exemption: boolean | null
          osb_status: boolean
          priority_cap: string | null
          priority_cap_ratio: string | null
          priority_interest_support: string | null
          priority_tax_discount: string | null
          province_id: number
          sgk_duration: string | null
          target_cap: string | null
          target_cap_ratio: string | null
          target_interest_support: string | null
          target_tax_discount: string | null
        }
        Insert: {
          created_at?: string | null
          customs_exemption?: boolean | null
          district_id: number
          id?: number
          kdv_exemption?: boolean | null
          osb_status: boolean
          priority_cap?: string | null
          priority_cap_ratio?: string | null
          priority_interest_support?: string | null
          priority_tax_discount?: string | null
          province_id: number
          sgk_duration?: string | null
          target_cap?: string | null
          target_cap_ratio?: string | null
          target_interest_support?: string | null
          target_tax_discount?: string | null
        }
        Update: {
          created_at?: string | null
          customs_exemption?: boolean | null
          district_id?: number
          id?: number
          kdv_exemption?: boolean | null
          osb_status?: boolean
          priority_cap?: string | null
          priority_cap_ratio?: string | null
          priority_interest_support?: string | null
          priority_tax_discount?: string | null
          province_id?: number
          sgk_duration?: string | null
          target_cap?: string | null
          target_cap_ratio?: string | null
          target_interest_support?: string | null
          target_tax_discount?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incentive_supports_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incentive_supports_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      investment_feasibility_reports: {
        Row: {
          alt_sektor_tanim_tag: string | null
          created_at: string | null
          dokumanlar: string | null
          fizibilitenin_hazirlanma_tarihi: string | null
          geri_odeme_suresi: number | null
          gtip_kodu_tag: string | null
          guncellenme_tarihi: string | null
          hedef_ulke_tag: string | null
          id: string
          il_tag: string | null
          istihdam: number | null
          kalkinma_ajansi_tag: string | null
          keywords_tag: string | null
          link: string | null
          nace_kodu_tanim: string | null
          sabit_yatirim_tutari: number | null
          sabit_yatirim_tutari_aralik_tag: string | null
          ska_tag: string | null
          updated_at: string | null
          ust_sektor_tanim_tag: string | null
          yatirim_boyutu_tag: string | null
          yatirim_konusu: string
        }
        Insert: {
          alt_sektor_tanim_tag?: string | null
          created_at?: string | null
          dokumanlar?: string | null
          fizibilitenin_hazirlanma_tarihi?: string | null
          geri_odeme_suresi?: number | null
          gtip_kodu_tag?: string | null
          guncellenme_tarihi?: string | null
          hedef_ulke_tag?: string | null
          id?: string
          il_tag?: string | null
          istihdam?: number | null
          kalkinma_ajansi_tag?: string | null
          keywords_tag?: string | null
          link?: string | null
          nace_kodu_tanim?: string | null
          sabit_yatirim_tutari?: number | null
          sabit_yatirim_tutari_aralik_tag?: string | null
          ska_tag?: string | null
          updated_at?: string | null
          ust_sektor_tanim_tag?: string | null
          yatirim_boyutu_tag?: string | null
          yatirim_konusu: string
        }
        Update: {
          alt_sektor_tanim_tag?: string | null
          created_at?: string | null
          dokumanlar?: string | null
          fizibilitenin_hazirlanma_tarihi?: string | null
          geri_odeme_suresi?: number | null
          gtip_kodu_tag?: string | null
          guncellenme_tarihi?: string | null
          hedef_ulke_tag?: string | null
          id?: string
          il_tag?: string | null
          istihdam?: number | null
          kalkinma_ajansi_tag?: string | null
          keywords_tag?: string | null
          link?: string | null
          nace_kodu_tanim?: string | null
          sabit_yatirim_tutari?: number | null
          sabit_yatirim_tutari_aralik_tag?: string | null
          ska_tag?: string | null
          updated_at?: string | null
          ust_sektor_tanim_tag?: string | null
          yatirim_boyutu_tag?: string | null
          yatirim_konusu?: string
        }
        Relationships: []
      }
      investments_by_province: {
        Row: {
          created_at: string | null
          id: number
          investment_name: string
          province: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          investment_name: string
          province: string
        }
        Update: {
          created_at?: string | null
          id?: number
          investment_name?: string
          province?: string
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          chunk_index: number
          content: string
          created_at: string
          created_by: string | null
          embedding: string | null
          filename: string
          id: string
          metadata: Json | null
          updated_at: string
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string
          created_by?: string | null
          embedding?: string | null
          filename: string
          id?: string
          metadata?: Json | null
          updated_at?: string
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string
          created_by?: string | null
          embedding?: string | null
          filename?: string
          id?: string
          metadata?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      legal_document_tags: {
        Row: {
          created_at: string | null
          document_id: string | null
          id: string
          tag_id: number | null
        }
        Insert: {
          created_at?: string | null
          document_id?: string | null
          id?: string
          tag_id?: number | null
        }
        Update: {
          created_at?: string | null
          document_id?: string | null
          id?: string
          tag_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_document_tags_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_document_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "document_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          category_id: number | null
          created_at: string | null
          description: string | null
          display_order: number | null
          document_number: string | null
          document_type: string
          external_url: string | null
          file_url: string | null
          id: string
          keywords: string | null
          ministry: string | null
          publication_date: string | null
          status: string | null
          title: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          category_id?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          document_number?: string | null
          document_type: string
          external_url?: string | null
          file_url?: string | null
          id?: string
          keywords?: string | null
          ministry?: string | null
          publication_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          category_id?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          document_number?: string | null
          document_type?: string
          external_url?: string | null
          file_url?: string | null
          id?: string
          keywords?: string | null
          ministry?: string | null
          publication_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_documents_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "document_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      location_support: {
        Row: {
          alt_bolge: string | null
          created_at: string | null
          gumruk_muafiyeti: boolean | null
          hedef_faiz_karpayi_do: string | null
          hedef_faiz_karpayi_syt_orani: string | null
          hedef_faiz_karpayi_ust_limit_tutari: string | null
          hedef_vergi_indirimi_yko: string | null
          id: number
          il: string
          ilce: string
          kdv_istisnasi: boolean | null
          oncelikli_faiz_karpayi_do: string | null
          oncelikli_faiz_karpayi_syt_orani: string | null
          oncelikli_faiz_karpayi_ust_limit_tutari: string | null
          oncelikli_vergi_indirimi_yko: string | null
          sgk_destek_suresi: string | null
          updated_at: string | null
        }
        Insert: {
          alt_bolge?: string | null
          created_at?: string | null
          gumruk_muafiyeti?: boolean | null
          hedef_faiz_karpayi_do?: string | null
          hedef_faiz_karpayi_syt_orani?: string | null
          hedef_faiz_karpayi_ust_limit_tutari?: string | null
          hedef_vergi_indirimi_yko?: string | null
          id?: number
          il: string
          ilce: string
          kdv_istisnasi?: boolean | null
          oncelikli_faiz_karpayi_do?: string | null
          oncelikli_faiz_karpayi_syt_orani?: string | null
          oncelikli_faiz_karpayi_ust_limit_tutari?: string | null
          oncelikli_vergi_indirimi_yko?: string | null
          sgk_destek_suresi?: string | null
          updated_at?: string | null
        }
        Update: {
          alt_bolge?: string | null
          created_at?: string | null
          gumruk_muafiyeti?: boolean | null
          hedef_faiz_karpayi_do?: string | null
          hedef_faiz_karpayi_syt_orani?: string | null
          hedef_faiz_karpayi_ust_limit_tutari?: string | null
          hedef_vergi_indirimi_yko?: string | null
          id?: number
          il?: string
          ilce?: string
          kdv_istisnasi?: boolean | null
          oncelikli_faiz_karpayi_do?: string | null
          oncelikli_faiz_karpayi_syt_orani?: string | null
          oncelikli_faiz_karpayi_ust_limit_tutari?: string | null
          oncelikli_vergi_indirimi_yko?: string | null
          sgk_destek_suresi?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      nace_codes: {
        Row: {
          code: string
          conditions: string | null
          created_at: string | null
          description: string
          id: number
          is_high_tech: boolean | null
          is_mid_high_tech: boolean | null
          is_priority: boolean | null
          is_target: boolean | null
          min_investment_region_1: number | null
          min_investment_region_2: number | null
          min_investment_region_3: number | null
          min_investment_region_4: number | null
          min_investment_region_5: number | null
          min_investment_region_6: number | null
        }
        Insert: {
          code: string
          conditions?: string | null
          created_at?: string | null
          description: string
          id?: number
          is_high_tech?: boolean | null
          is_mid_high_tech?: boolean | null
          is_priority?: boolean | null
          is_target?: boolean | null
          min_investment_region_1?: number | null
          min_investment_region_2?: number | null
          min_investment_region_3?: number | null
          min_investment_region_4?: number | null
          min_investment_region_5?: number | null
          min_investment_region_6?: number | null
        }
        Update: {
          code?: string
          conditions?: string | null
          created_at?: string | null
          description?: string
          id?: number
          is_high_tech?: boolean | null
          is_mid_high_tech?: boolean | null
          is_priority?: boolean | null
          is_target?: boolean | null
          min_investment_region_1?: number | null
          min_investment_region_2?: number | null
          min_investment_region_3?: number | null
          min_investment_region_4?: number | null
          min_investment_region_5?: number | null
          min_investment_region_6?: number | null
        }
        Relationships: []
      }
      nacedortlu: {
        Row: {
          created_at: string | null
          description: string
          id: number
          nacecode: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: number
          nacecode: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: number
          nacecode?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      pre_requests: {
        Row: {
          created_at: string | null
          documents_url: string | null
          e_posta: string
          firma_adi: string
          firma_kisa_adi: string | null
          id: string
          iletisim_kisisi: string
          logo_url: string | null
          on_request_id: string | null
          status: string | null
          talep_icerigi: string
          telefon: string
          unvan: string
          updated_at: string | null
          vergi_kimlik_no: string
        }
        Insert: {
          created_at?: string | null
          documents_url?: string | null
          e_posta: string
          firma_adi: string
          firma_kisa_adi?: string | null
          id?: string
          iletisim_kisisi: string
          logo_url?: string | null
          on_request_id?: string | null
          status?: string | null
          talep_icerigi: string
          telefon: string
          unvan: string
          updated_at?: string | null
          vergi_kimlik_no: string
        }
        Update: {
          created_at?: string | null
          documents_url?: string | null
          e_posta?: string
          firma_adi?: string
          firma_kisa_adi?: string | null
          id?: string
          iletisim_kisisi?: string
          logo_url?: string | null
          on_request_id?: string | null
          status?: string | null
          talep_icerigi?: string
          telefon?: string
          unvan?: string
          updated_at?: string | null
          vergi_kimlik_no?: string
        }
        Relationships: []
      }
      pre_requests_audit: {
        Row: {
          accessed_at: string
          action: string
          changed_fields: Json | null
          id: string
          ip_address: string | null
          new_values: Json | null
          notes: string | null
          old_values: Json | null
          pre_request_id: string | null
          user_agent: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          accessed_at?: string
          action: string
          changed_fields?: Json | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          notes?: string | null
          old_values?: Json | null
          pre_request_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          accessed_at?: string
          action?: string
          changed_fields?: Json | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          notes?: string | null
          old_values?: Json | null
          pre_request_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pre_requests_audit_pre_request_id_fkey"
            columns: ["pre_request_id"]
            isOneToOne: false
            referencedRelation: "approved_pre_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_requests_audit_pre_request_id_fkey"
            columns: ["pre_request_id"]
            isOneToOne: false
            referencedRelation: "pre_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          basvuru_son_tarihi: string
          created_at: string | null
          firma_olcegi: string
          id: string
          minimum_deneyim: number
          minimum_yerlilik_orani: number
          pre_request_id: string
          status: string | null
          updated_at: string | null
          urun_aciklamasi: string
          urun_grubu_adi: string
        }
        Insert: {
          basvuru_son_tarihi: string
          created_at?: string | null
          firma_olcegi: string
          id?: string
          minimum_deneyim?: number
          minimum_yerlilik_orani?: number
          pre_request_id: string
          status?: string | null
          updated_at?: string | null
          urun_aciklamasi: string
          urun_grubu_adi: string
        }
        Update: {
          basvuru_son_tarihi?: string
          created_at?: string | null
          firma_olcegi?: string
          id?: string
          minimum_deneyim?: number
          minimum_yerlilik_orani?: number
          pre_request_id?: string
          status?: string | null
          updated_at?: string | null
          urun_aciklamasi?: string
          urun_grubu_adi?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_pre_request_id_fkey"
            columns: ["pre_request_id"]
            isOneToOne: false
            referencedRelation: "approved_pre_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_pre_request_id_fkey"
            columns: ["pre_request_id"]
            isOneToOne: false
            referencedRelation: "pre_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      province_region_map: {
        Row: {
          created_at: string | null
          id: number
          province_name: string
          region_number: number
        }
        Insert: {
          created_at?: string | null
          id?: number
          province_name: string
          region_number: number
        }
        Update: {
          created_at?: string | null
          id?: number
          province_name?: string
          region_number?: number
        }
        Relationships: []
      }
      provinces: {
        Row: {
          created_at: string | null
          id: number
          name: string
          region_id: number
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          region_id: number
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          region_id?: number
        }
        Relationships: []
      }
      qna_admin_emails: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          password: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_active?: boolean
          password?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          password?: string | null
        }
        Relationships: []
      }
      qna_audit_trail: {
        Row: {
          action: string
          created_at: string
          id: string
          notes: string | null
          soru_cevap_id: string
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          notes?: string | null
          soru_cevap_id: string
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          notes?: string | null
          soru_cevap_id?: string
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qna_audit_trail_soru_cevap_id_fkey"
            columns: ["soru_cevap_id"]
            isOneToOne: false
            referencedRelation: "public_qna_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qna_audit_trail_soru_cevap_id_fkey"
            columns: ["soru_cevap_id"]
            isOneToOne: false
            referencedRelation: "soru_cevap"
            referencedColumns: ["id"]
          },
        ]
      }
      qna_email_logs: {
        Row: {
          created_at: string
          email_subject: string
          email_type: string
          error_message: string | null
          id: string
          recipient_email: string
          sender_email: string
          sent_date: string
          sent_page: string
          soru_cevap_id: string | null
          transmission_status: string
        }
        Insert: {
          created_at?: string
          email_subject: string
          email_type: string
          error_message?: string | null
          id?: string
          recipient_email: string
          sender_email: string
          sent_date?: string
          sent_page: string
          soru_cevap_id?: string | null
          transmission_status?: string
        }
        Update: {
          created_at?: string
          email_subject?: string
          email_type?: string
          error_message?: string | null
          id?: string
          recipient_email?: string
          sender_email?: string
          sent_date?: string
          sent_page?: string
          soru_cevap_id?: string | null
          transmission_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "qna_email_logs_soru_cevap_id_fkey"
            columns: ["soru_cevap_id"]
            isOneToOne: false
            referencedRelation: "public_qna_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qna_email_logs_soru_cevap_id_fkey"
            columns: ["soru_cevap_id"]
            isOneToOne: false
            referencedRelation: "soru_cevap"
            referencedColumns: ["id"]
          },
        ]
      }
      question_variants: {
        Row: {
          canonical_answer: string
          canonical_question: string
          confidence_score: number | null
          created_at: string | null
          created_by: string | null
          embedding: string | null
          fts_vector: unknown
          id: string
          metadata: Json | null
          source_document: string | null
          updated_at: string | null
          variants: string[] | null
        }
        Insert: {
          canonical_answer: string
          canonical_question: string
          confidence_score?: number | null
          created_at?: string | null
          created_by?: string | null
          embedding?: string | null
          fts_vector?: unknown
          id?: string
          metadata?: Json | null
          source_document?: string | null
          updated_at?: string | null
          variants?: string[] | null
        }
        Update: {
          canonical_answer?: string
          canonical_question?: string
          confidence_score?: number | null
          created_at?: string | null
          created_by?: string | null
          embedding?: string | null
          fts_vector?: unknown
          id?: string
          metadata?: Json | null
          source_document?: string | null
          updated_at?: string | null
          variants?: string[] | null
        }
        Relationships: []
      }
      real_time_notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          message: string
          notification_type: string
          priority: string
          title: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message: string
          notification_type: string
          priority?: string
          title: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string
          notification_type?: string
          priority?: string
          title?: string
        }
        Relationships: []
      }
      sector_search: {
        Row: {
          bolge_1: number | null
          bolge_2: number | null
          bolge_3: number | null
          bolge_4: number | null
          bolge_5: number | null
          bolge_6: number | null
          created_at: string | null
          hedef_yatirim: boolean | null
          id: number
          nace_kodu: string
          oncelikli_yatirim: boolean | null
          orta_yuksek_teknoloji: boolean | null
          sartlar: string | null
          sektor: string
          updated_at: string | null
          yuksek_teknoloji: boolean | null
        }
        Insert: {
          bolge_1?: number | null
          bolge_2?: number | null
          bolge_3?: number | null
          bolge_4?: number | null
          bolge_5?: number | null
          bolge_6?: number | null
          created_at?: string | null
          hedef_yatirim?: boolean | null
          id?: number
          nace_kodu: string
          oncelikli_yatirim?: boolean | null
          orta_yuksek_teknoloji?: boolean | null
          sartlar?: string | null
          sektor: string
          updated_at?: string | null
          yuksek_teknoloji?: boolean | null
        }
        Update: {
          bolge_1?: number | null
          bolge_2?: number | null
          bolge_3?: number | null
          bolge_4?: number | null
          bolge_5?: number | null
          bolge_6?: number | null
          created_at?: string | null
          hedef_yatirim?: boolean | null
          id?: number
          nace_kodu?: string
          oncelikli_yatirim?: boolean | null
          orta_yuksek_teknoloji?: boolean | null
          sartlar?: string | null
          sektor?: string
          updated_at?: string | null
          yuksek_teknoloji?: boolean | null
        }
        Relationships: []
      }
      sgk: {
        Row: {
          alt_bolge: number | null
          bolge: number | null
          district: string | null
          osb_status: boolean | null
          province: string | null
          sgk_duration: number | null
        }
        Insert: {
          alt_bolge?: number | null
          bolge?: number | null
          district?: string | null
          osb_status?: boolean | null
          province?: string | null
          sgk_duration?: number | null
        }
        Update: {
          alt_bolge?: number | null
          bolge?: number | null
          district?: string | null
          osb_status?: boolean | null
          province?: string | null
          sgk_duration?: number | null
        }
        Relationships: []
      }
      sgk_durations: {
        Row: {
          alt_bolge: number | null
          bolge: number | null
          district: string | null
          id: number
          osb_status: boolean | null
          province: string | null
          sgk_duration: number | null
        }
        Insert: {
          alt_bolge?: number | null
          bolge?: number | null
          district?: string | null
          id?: number
          osb_status?: boolean | null
          province?: string | null
          sgk_duration?: number | null
        }
        Update: {
          alt_bolge?: number | null
          bolge?: number | null
          district?: string | null
          id?: number
          osb_status?: boolean | null
          province?: string | null
          sgk_duration?: number | null
        }
        Relationships: []
      }
      soru_cevap: {
        Row: {
          admin_notes: string | null
          admin_sent: boolean | null
          answer: string | null
          answer_date: string | null
          answer_status: string | null
          answered: boolean
          answered_by_full_name: string | null
          answered_by_user_id: string | null
          approved_by_admin_id: string | null
          category: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          province: string
          question: string
          question_number: number
          return_date: string | null
          return_reason: string | null
          return_status:
            | Database["public"]["Enums"]["return_status_enum"]
            | null
          sent_to_user: boolean
          sent_to_ydo: boolean
        }
        Insert: {
          admin_notes?: string | null
          admin_sent?: boolean | null
          answer?: string | null
          answer_date?: string | null
          answer_status?: string | null
          answered?: boolean
          answered_by_full_name?: string | null
          answered_by_user_id?: string | null
          approved_by_admin_id?: string | null
          category?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          province: string
          question: string
          question_number?: number
          return_date?: string | null
          return_reason?: string | null
          return_status?:
            | Database["public"]["Enums"]["return_status_enum"]
            | null
          sent_to_user?: boolean
          sent_to_ydo?: boolean
        }
        Update: {
          admin_notes?: string | null
          admin_sent?: boolean | null
          answer?: string | null
          answer_date?: string | null
          answer_status?: string | null
          answered?: boolean
          answered_by_full_name?: string | null
          answered_by_user_id?: string | null
          approved_by_admin_id?: string | null
          category?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          province?: string
          question?: string
          question_number?: number
          return_date?: string | null
          return_reason?: string | null
          return_status?:
            | Database["public"]["Enums"]["return_status_enum"]
            | null
          sent_to_user?: boolean
          sent_to_ydo?: boolean
        }
        Relationships: []
      }
      submission_tracking: {
        Row: {
          id: string
          identifier: string
          last_submission: string | null
          submission_count: number | null
          submission_type: string
        }
        Insert: {
          id?: string
          identifier: string
          last_submission?: string | null
          submission_count?: number | null
          submission_type: string
        }
        Update: {
          id?: string
          identifier?: string
          last_submission?: string | null
          submission_count?: number | null
          submission_type?: string
        }
        Relationships: []
      }
      supplier_applications: {
        Row: {
          created_at: string | null
          dosyalar_url: string | null
          e_posta: string
          firma_adi: string
          firma_olcegi: string
          firma_websitesi: string | null
          id: string
          il: string
          iletisim_kisisi: string
          minimum_yerlilik_orani: number | null
          notlar: string | null
          on_request_id: string | null
          product_id: string
          status: string | null
          tedarikci_deneyim_suresi: number | null
          telefon: string
          unvan: string
          vergi_kimlik_no: string
        }
        Insert: {
          created_at?: string | null
          dosyalar_url?: string | null
          e_posta: string
          firma_adi: string
          firma_olcegi: string
          firma_websitesi?: string | null
          id?: string
          il: string
          iletisim_kisisi: string
          minimum_yerlilik_orani?: number | null
          notlar?: string | null
          on_request_id?: string | null
          product_id: string
          status?: string | null
          tedarikci_deneyim_suresi?: number | null
          telefon: string
          unvan: string
          vergi_kimlik_no: string
        }
        Update: {
          created_at?: string | null
          dosyalar_url?: string | null
          e_posta?: string
          firma_adi?: string
          firma_olcegi?: string
          firma_websitesi?: string | null
          id?: string
          il?: string
          iletisim_kisisi?: string
          minimum_yerlilik_orani?: number | null
          notlar?: string | null
          on_request_id?: string | null
          product_id?: string
          status?: string | null
          tedarikci_deneyim_suresi?: number | null
          telefon?: string
          unvan?: string
          vergi_kimlik_no?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_applications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      support_program_tags: {
        Row: {
          created_at: string | null
          id: string
          support_program_id: string | null
          tag_id: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          support_program_id?: string | null
          tag_id?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          support_program_id?: string | null
          tag_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "support_program_tags_support_program_id_fkey"
            columns: ["support_program_id"]
            isOneToOne: false
            referencedRelation: "support_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_program_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      support_programs: {
        Row: {
          application_deadline: string | null
          contact_info: string | null
          created_at: string | null
          description: string
          eligibility_criteria: string | null
          id: string
          institution_id: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          application_deadline?: string | null
          contact_info?: string | null
          created_at?: string | null
          description: string
          eligibility_criteria?: string | null
          id?: string
          institution_id?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          application_deadline?: string | null
          contact_info?: string | null
          created_at?: string | null
          description?: string
          eligibility_criteria?: string | null
          id?: string
          institution_id?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_programs_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      tag_categories: {
        Row: {
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          category_id: number | null
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          category_id?: number | null
          created_at?: string | null
          id?: number
          name: string
        }
        Update: {
          category_id?: number | null
          created_at?: string | null
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "tag_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_metadata: {
        Row: {
          created_at: string | null
          department: string | null
          id: string
          is_active: boolean | null
          last_password_change: string | null
          province: string | null
          two_factor_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          id?: string
          is_active?: boolean | null
          last_password_change?: string | null
          province?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          department?: string | null
          id?: string
          is_active?: boolean | null
          last_password_change?: string | null
          province?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      user_sessions: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string
          id: string
          incentive_type: string | null
          investment_topic: string | null
          ip_address: string | null
          location_city: string | null
          location_country: string | null
          module_name: string | null
          page_path: string | null
          search_term: string | null
          session_id: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string
          id?: string
          incentive_type?: string | null
          investment_topic?: string | null
          ip_address?: string | null
          location_city?: string | null
          location_country?: string | null
          module_name?: string | null
          page_path?: string | null
          search_term?: string | null
          session_id: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string
          id?: string
          incentive_type?: string | null
          investment_topic?: string | null
          ip_address?: string | null
          location_city?: string | null
          location_country?: string | null
          module_name?: string | null
          page_path?: string | null
          search_term?: string | null
          session_id?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      vertex_configs: {
        Row: {
          config_key: string
          created_at: string | null
          id: number
          internal_api_key: string | null
          max_output_tokens: number | null
          model_name: string
          rag_corpus: string | null
          similarity_top_k: number | null
          staging_bucket: string | null
          system_instruction: string | null
          temperature: number | null
          top_p: number | null
          updated_at: string | null
          vertex_client_email: string | null
          vertex_private_key: string | null
          vertex_project_id: string | null
        }
        Insert: {
          config_key?: string
          created_at?: string | null
          id?: number
          internal_api_key?: string | null
          max_output_tokens?: number | null
          model_name: string
          rag_corpus?: string | null
          similarity_top_k?: number | null
          staging_bucket?: string | null
          system_instruction?: string | null
          temperature?: number | null
          top_p?: number | null
          updated_at?: string | null
          vertex_client_email?: string | null
          vertex_private_key?: string | null
          vertex_project_id?: string | null
        }
        Update: {
          config_key?: string
          created_at?: string | null
          id?: number
          internal_api_key?: string | null
          max_output_tokens?: number | null
          model_name?: string
          rag_corpus?: string | null
          similarity_top_k?: number | null
          staging_bucket?: string | null
          system_instruction?: string | null
          temperature?: number | null
          top_p?: number | null
          updated_at?: string | null
          vertex_client_email?: string | null
          vertex_private_key?: string | null
          vertex_project_id?: string | null
        }
        Relationships: []
      }
      ydo_users: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          province: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          province: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          province?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      approved_pre_requests: {
        Row: {
          created_at: string | null
          firma_kisa_adi: string | null
          id: string | null
          logo_url: string | null
          on_request_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          firma_kisa_adi?: string | null
          id?: string | null
          logo_url?: string | null
          on_request_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          firma_kisa_adi?: string | null
          id?: string | null
          logo_url?: string | null
          on_request_id?: string | null
          status?: string | null
        }
        Relationships: []
      }
      pre_requests_security_summary: {
        Row: {
          access_count: number | null
          access_date: string | null
          action: string | null
          unique_requests: number | null
          unique_users: number | null
          user_role: string | null
        }
        Relationships: []
      }
      public_qna_view: {
        Row: {
          answer: string | null
          answer_date: string | null
          category: string | null
          created_at: string | null
          id: string | null
          province: string | null
          question: string | null
          question_number: number | null
        }
        Insert: {
          answer?: string | null
          answer_date?: string | null
          category?: string | null
          created_at?: string | null
          id?: string | null
          province?: string | null
          question?: string | null
          question_number?: number | null
        }
        Update: {
          answer?: string | null
          answer_date?: string | null
          category?: string | null
          created_at?: string | null
          id?: string | null
          province?: string | null
          question?: string | null
          question_number?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_chat_rate_limit: {
        Args: { session_id_param: string }
        Returns: boolean
      }
      check_submission_spam: {
        Args: {
          p_cooldown_minutes?: number
          p_identifier: string
          p_submission_type: string
        }
        Returns: boolean
      }
      cleanup_old_sensitive_data: { Args: never; Returns: undefined }
      cleanup_pre_requests_audit_logs: { Args: never; Returns: undefined }
      expire_old_products: { Args: never; Returns: undefined }
      get_approved_pre_requests: {
        Args: never
        Returns: {
          created_at: string
          firma_kisa_adi: string
          id: string
          logo_url: string
          on_request_id: string
          status: string
        }[]
      }
      get_chat_sessions: {
        Args: never
        Returns: {
          session_id: string
          title: string
        }[]
      }
      get_public_qna: {
        Args: { limit_count?: number }
        Returns: {
          answer: string
          answer_date: string
          category: string
          created_at: string
          id: string
          province: string
          question: string
          question_number: number
        }[]
      }
      get_public_qna_count: { Args: never; Returns: number }
      get_user_roles: { Args: { p_user_id: string }; Returns: string[] }
      get_ydo_user_count: { Args: never; Returns: number }
      has_any_role: {
        Args: { p_roles: string[]; p_user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_ydo_province_access: {
        Args: { _province: string; _user_id: string }
        Returns: boolean
      }
      hybrid_match_question_variants: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
          query_text: string
        }
        Returns: {
          canonical_answer: string
          canonical_question: string
          id: string
          match_type: string
          metadata: Json
          similarity: number
          source_document: string
          variants: string[]
        }[]
      }
      increment_stat: { Args: { stat_name_param: string }; Returns: undefined }
      is_admin: { Args: { user_id?: string }; Returns: boolean }
      log_qna_audit: {
        Args: {
          p_action: string
          p_notes?: string
          p_soru_cevap_id: string
          p_user_role?: string
        }
        Returns: undefined
      }
      match_cb_knowledge: {
        Args: {
          match_count: number
          match_threshold: number
          query_embedding: string
          query_text: string
        }
        Returns: {
          answer: string
          id: string
          question: string
          similarity: number
        }[]
      }
      match_chatbot_embedding_768:
        | {
            Args: {
              match_count: number
              match_threshold: number
              query_embedding: number[]
            }
            Returns: {
              answer: string
              id: string
              question: string
              similarity: number
            }[]
          }
        | {
            Args: {
              match_count: number
              match_threshold: number
              query_embedding: string
            }
            Returns: {
              answer: string
              id: string
              question: string
              similarity: number
            }[]
          }
      match_chatbot_knowledge:
        | {
            Args: { p_limit?: number; query_embedding: string }
            Returns: {
              answer: string
              created_at: string
              embedding: string
              id: string
              question: string
              updated_at: string
            }[]
          }
        | {
            Args: {
              match_count?: number
              match_threshold?: number
              query_embedding: string
            }
            Returns: {
              answer: string
              id: string
              question: string
              similarity: number
            }[]
          }
      match_custom_rag_chunks: {
        Args: {
          match_count?: number
          match_threshold?: number
          p_store_id: string
          query_embedding: string
        }
        Returns: {
          chunk_index: number
          content: string
          document_id: string
          document_name: string
          id: string
          similarity: number
        }[]
      }
      match_document_chunks: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      match_documents: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          filename: string
          id: string
          similarity: number
        }[]
      }
      match_knowledge: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          answer: string
          id: string
          question: string
          similarity: number
        }[]
      }
      match_knowledge_base: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          answer: string
          id: string
          question: string
          similarity: number
        }[]
      }
      match_question_variants: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          canonical_answer: string
          canonical_question: string
          id: string
          metadata: Json
          similarity: number
          source_document: string
          variants: string[]
        }[]
      }
      record_submission: {
        Args: { p_identifier: string; p_submission_type: string }
        Returns: undefined
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      test_final_security: { Args: never; Returns: string }
      unaccent: { Args: { "": string }; Returns: string }
      update_chatbot_768: {
        Args: { row_id: string; vals: number }
        Returns: undefined
      }
      update_chatbot_embedding:
        | { Args: { payload: Json }; Returns: undefined }
        | { Args: { p_row_id: string; p_vals: number[] }; Returns: undefined }
        | {
            Args: {
              match_count: number
              match_threshold: number
              query_embedding: string
            }
            Returns: undefined
          }
        | {
            Args: {
              match_count: number
              match_threshold: number
              query_embedding: number[]
            }
            Returns: undefined
          }
      update_chatbot_embedding_768:
        | { Args: { p_row_id: string; p_vals: number }; Returns: undefined }
        | { Args: { p_row_id: string; p_vals: number[] }; Returns: undefined }
      update_chatbot_embedding_768_array: {
        Args: { p_row_id: string; p_vals: number[] }
        Returns: undefined
      }
      update_chatbot_embedding_768_from_array: {
        Args: {
          match_count: number
          match_threshold: number
          query_embedding: number
        }
        Returns: undefined
      }
      update_chatbot_embedding_from_array: {
        Args: {
          match_count: number
          match_threshold: number
          query_embedding: number[]
        }
        Returns: undefined
      }
      update_embedding: {
        Args: { row_id: string; vals: number[] }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "ydo" | "qna"
      return_status_enum: "returned" | "corrected"
      user_role: "admin" | "user"
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
      app_role: ["admin", "moderator", "user", "ydo", "qna"],
      return_status_enum: ["returned", "corrected"],
      user_role: ["admin", "user"],
    },
  },
} as const
