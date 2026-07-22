export interface Project {
  id: string;
  title: string;
  description: string;
  tech_tags: string[];
  live_url?: string;
  github_url?: string;
  image_url?: string;
  category?: string;
  featured?: boolean;
  display_order?: number;
  logo_url?: string;
  thumbnail_url?: string;
  hero_banner_url?: string;
  gallery_images?: string[];
  created_at?: string;
}

export interface TechStack {
  id: string;
  name: string;
  icon_name: string;
  icon_url?: string;
  category?: 'frontend' | 'backend' | 'database' | 'ai' | 'deployment' | 'tools' | 'libraries' | 'coreskills' | 'languages' | 'other' | string;
  display_order?: number;
  created_at?: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  duration: string;
  location: string;
  details: string[];
  logo_url?: string;
  display_order?: number;
  created_at?: string;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  issue_date: string;
  credential_url?: string;
  logo_url?: string;
  display_order?: number;
  created_at?: string;
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  field?: string;
  university?: string;
  location?: string;
  description?: string;
  start_year?: string;
  end_year?: string;
  grade?: string;
  logo_url?: string;
  display_order?: number;
  created_at?: string;
}


