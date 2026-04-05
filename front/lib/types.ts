export interface User {
  id: number;
  email: string;
}

export interface Lead {
  id?: number;
  place_id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  instagram: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  rating: number | null;
  segment: string | null;
  created_at?: string;
}

export interface SearchResponse {
  new_leads: Lead[];
  skipped: number;
  total: number;
}

export interface HistoryResponse {
  leads: Lead[];
  total: number;
  segments: string[];
  cities: string[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface SearchParams {
  query: string;
  max_results: number;
}

export interface HistoryFilters {
  segment?: string;
  city?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}
