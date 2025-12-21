// Supabase Database Types
// Auto-generated based on schema

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
      categories: {
        Row: {
          id: string
          name: string
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string | null
          created_at?: string
        }
      }
      items: {
        Row: {
          id: string
          category_id: string | null
          url: string
          platform: string
          product_name: string
          product_image: string | null
          price: number | null
          last_crawled_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          category_id?: string | null
          url: string
          platform: string
          product_name: string
          product_image?: string | null
          price?: number | null
          last_crawled_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          category_id?: string | null
          url?: string
          platform?: string
          product_name?: string
          product_image?: string | null
          price?: number | null
          last_crawled_at?: string | null
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          item_id: string
          author: string | null
          rating: number | null
          content: string | null
          images: string[] | null
          date: string | null
          sentiment: string | null
          crawled_at: string
        }
        Insert: {
          id?: string
          item_id: string
          author?: string | null
          rating?: number | null
          content?: string | null
          images?: string[] | null
          date?: string | null
          sentiment?: string | null
          crawled_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          author?: string | null
          rating?: number | null
          content?: string | null
          images?: string[] | null
          date?: string | null
          sentiment?: string | null
          crawled_at?: string
        }
      }
      review_analysis: {
        Row: {
          id: string
          item_id: string | null
          summary: string | null
          positive_keywords: string[] | null
          negative_keywords: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          item_id?: string | null
          summary?: string | null
          positive_keywords?: string[] | null
          negative_keywords?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          item_id?: string | null
          summary?: string | null
          positive_keywords?: string[] | null
          negative_keywords?: string[] | null
          created_at?: string
        }
      }
    }
  }
}

// Convenience types
export type Category = Database["public"]["Tables"]["categories"]["Row"]
export type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"]

export type Item = Database["public"]["Tables"]["items"]["Row"]
export type ItemInsert = Database["public"]["Tables"]["items"]["Insert"]

export type Review = Database["public"]["Tables"]["reviews"]["Row"]
export type ReviewInsert = Database["public"]["Tables"]["reviews"]["Insert"]

export type ReviewAnalysis = Database["public"]["Tables"]["review_analysis"]["Row"]
export type ReviewAnalysisInsert = Database["public"]["Tables"]["review_analysis"]["Insert"]

// Extended types with relations
export interface ItemWithCategory extends Item {
  categories: Category | null
}

export interface ItemWithStats extends ItemWithCategory {
  review_count: number
  avg_rating: number
  positive_rate: number
}

export interface ReviewWithItem extends Review {
  items: Item | null
}
