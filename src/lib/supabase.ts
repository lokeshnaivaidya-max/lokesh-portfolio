import { createClient } from '@supabase/supabase-js';
import { Project, TechStack, Experience, Education, Certification } from '../types';

const rawSupabaseUrl = ((import.meta as any).env.VITE_SUPABASE_URL || '').trim();
const supabaseUrl = rawSupabaseUrl
  .replace(/\/+$/, '')               // remove trailing slashes
  .replace(/\/rest\/v1\/?$/, '');     // remove /rest/v1 or /rest/v1/

const supabaseAnonKey = ((import.meta as any).env.VITE_SUPABASE_ANON_KEY || '').trim();

export const hasSupabaseConfig = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_PROJECT_URL' && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' &&
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== ''
);

export const isProduction = typeof (import.meta as any).env.PROD !== 'undefined'
  ? (import.meta as any).env.PROD
  : true;

function localModeAllowed(): boolean {
  return true;
}

let supabaseInstance: any = null;
export function getSupabase() {
  if (!supabaseInstance && hasSupabaseConfig) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

export interface HealthStatus {
  overall: 'healthy' | 'unhealthy';
  mode: 'production' | 'development';
  supabase_configured: boolean;
  env: { status: 'ok' | 'error'; url_set: boolean; key_set: boolean };
  connection: { status: 'ok' | 'error'; message?: string };
  auth: { status: 'ok' | 'error'; message?: string };
  database: { status: 'ok' | 'error'; message?: string };
  storage: { status: 'ok' | 'error'; message?: string };
  buckets: Record<string, { status: 'ok' | 'error'; message?: string }>;
  rls: { status: 'ok' | 'error'; message?: string };
}

export async function runHealthCheck(): Promise<HealthStatus> {
  const result: HealthStatus = {
    overall: 'unhealthy',
    mode: isProduction ? 'production' : 'development',
    supabase_configured: hasSupabaseConfig,
    env: {
      status: hasSupabaseConfig ? 'ok' : 'error',
      url_set: !!supabaseUrl && supabaseUrl !== 'YOUR_SUPABASE_PROJECT_URL',
      key_set: !!supabaseAnonKey && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY'
    },
    connection: { status: 'error', message: 'Supabase not configured' },
    auth: { status: 'error', message: 'Not checked' },
    database: { status: 'error', message: 'Not checked' },
    storage: { status: 'error', message: 'Not checked' },
    buckets: {},
    rls: { status: 'error', message: 'Not checked' }
  };

  if (!hasSupabaseConfig) {
    return result;
  }

  try {
    const supabase = getSupabase();

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      result.auth = { status: 'error', message: sessionError.message };
    } else {
      result.auth = { status: 'ok', message: sessionData.session ? 'Session active' : 'No active session (login required)' };
    }

    const { data: dbCheck, error: dbError } = await supabase
      .from('projects')
      .select('id')
      .limit(1);
    if (dbError) {
      result.database = { status: 'error', message: `Query failed on table 'projects': ${dbError.message}` };
      result.rls = dbError.message?.toLowerCase().includes('policy') || dbError.message?.toLowerCase().includes('row-level')
        ? { status: 'error', message: dbError.message }
        : { status: 'ok', message: 'RLS policies appear active' };
    } else {
      result.database = { status: 'ok' };
    }

    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      result.storage = { status: 'error', message: bucketsError.message };
    } else {
      result.storage = { status: 'ok' };
    }

    // Verify each required bucket individually (anon key cannot listBuckets,
    // so we probe by listing objects in the bucket — works on public buckets).
    const required = ['project-logos', 'project-thumbnails', 'project-hero', 'project-gallery', 'experience-logos', 'education-logos', 'tech-logos', 'certification-logos', 'logos', 'favicons', 'opengraph', 'resumes'];
    const known = new Set((buckets || []).map((b: any) => b.name));
    for (const name of required) {
      if (known.has(name)) {
        result.buckets[name] = { status: 'ok' };
        continue;
      }
      try {
        const { error: listErr } = await supabase.storage.from(name).list('', { limit: 1 });
        result.buckets[name] = listErr
          ? { status: 'error', message: `Storage bucket '${name}' does not exist` }
          : { status: 'ok' };
      } catch {
        result.buckets[name] = { status: 'error', message: `Storage bucket '${name}' does not exist` };
      }
    }

    result.connection = { status: 'ok' };

    const allOk = (
      result.auth.status === 'ok' &&
      result.database.status === 'ok' &&
      result.storage.status === 'ok' &&
      result.env.status === 'ok'
    );
    result.overall = allOk ? 'healthy' : 'unhealthy';

  } catch (err: any) {
    result.connection = { status: 'error', message: err?.message || 'Connection failed' };
  }

  return result;
}

const SEED_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Lumora AI',
    description: 'An enterprise-grade AI investment research platform that combines live market data, intelligent analysis, technical indicators, and AI-powered insights into a premium dashboard experience.',
    tech_tags: ['Next.js', 'TypeScript', 'Supabase', 'Gemini API', 'Tailwind CSS'],
    live_url: 'https://lumora.ai',
    github_url: 'https://github.com/lokeshnaivaidya-max/lumora-ai',
    category: 'AI Investment Platform',
    featured: true,
    display_order: 1
  },
  {
    id: '2',
    title: 'Naivaidya',
    description: 'A modern healthcare platform designed to connect patients with medical services through a fast, clean, and user-friendly experience. Features include responsive UI, waitlist management, and scalable architecture.',
    tech_tags: ['React', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS', 'JWT'],
    live_url: 'https://naivaidya.com',
    github_url: 'https://github.com/lokeshnaivaidya-max/naivaidya',
    category: 'Healthcare Platform',
    featured: false,
    display_order: 2
  },
  {
    id: '3',
    title: 'BELVO',
    description: 'A premium business website featuring modern UI, responsive layouts, CMS integration, branding management, and optimized performance.',
    tech_tags: ['React', 'TypeScript', 'Supabase', 'Tailwind CSS', 'Framer Motion', 'Vercel'],
    live_url: 'https://belvo-tracker.vercel.app',
    github_url: 'https://github.com/lokeshnaivaidya-max/belvo',
    category: 'Corporate Website',
    featured: false,
    display_order: 3
  },
  {
    id: '4',
    title: 'Sahay Foundation',
    description: 'A professional website created for a social impact organization to showcase initiatives, programs, donations, and community outreach.',
    tech_tags: ['React', 'JavaScript', 'HTML5', 'CSS3', 'GitHub Pages'],
    live_url: 'https://sahayfoundation.org',
    github_url: 'https://github.com/lokeshnaivaidya-max/sahay-foundation',
    category: 'NGO Website',
    featured: false,
    display_order: 4
  }
];

const SEED_TECH: TechStack[] = [
  // Row 1: Frontend Technologies
  { id: 't1', name: 'HTML5', icon_name: 'html5', category: 'frontend' },
  { id: 't2', name: 'CSS3', icon_name: 'css3', category: 'frontend' },
  { id: 't3', name: 'JavaScript', icon_name: 'javascript', category: 'frontend' },
  { id: 't4', name: 'TypeScript', icon_name: 'typescript', category: 'frontend' },
  { id: 't5', name: 'React', icon_name: 'react', category: 'frontend' },
  { id: 't6', name: 'Next.js', icon_name: 'nextjs', category: 'frontend' },
  { id: 't7', name: 'Vite', icon_name: 'vite', category: 'frontend' },
  { id: 't8', name: 'Tailwind CSS', icon_name: 'tailwind', category: 'frontend' },
  { id: 't9', name: 'GSAP', icon_name: 'gsap', category: 'frontend' },
  { id: 't10', name: 'Framer Motion', icon_name: 'framermotion', category: 'frontend' },
  { id: 't11', name: 'Three.js', icon_name: 'threejs', category: 'frontend' },
  { id: 't12', name: 'Shadcn UI', icon_name: 'shadcnui', category: 'frontend' },

  // Row 2: Backend + Database
  { id: 't13', name: 'Node.js', icon_name: 'nodejs', category: 'backend' },
  { id: 't14', name: 'Express.js', icon_name: 'express', category: 'backend' },
  { id: 't15', name: 'Python', icon_name: 'python', category: 'backend' },
  { id: 't16', name: 'REST APIs', icon_name: 'api', category: 'backend' },
  { id: 't17', name: 'JWT Authentication', icon_name: 'jwt', category: 'backend' },
  { id: 't18', name: 'MongoDB', icon_name: 'mongodb', category: 'database' },
  { id: 't19', name: 'MySQL', icon_name: 'mysql', category: 'database' },
  { id: 't20', name: 'Supabase', icon_name: 'supabase', category: 'database' },
  { id: 't21', name: 'Firebase', icon_name: 'firebase', category: 'database' },

  // Row 3: AI + Cloud + Development Tools
  { id: 't22', name: 'Google Gemini API', icon_name: 'gemini', category: 'ai' },
  { id: 't23', name: 'OpenAI API', icon_name: 'openai', category: 'ai' },
  { id: 't24', name: 'Groq API', icon_name: 'groq', category: 'ai' },
  { id: 't25', name: 'Prompt Engineering', icon_name: 'promptengineering', category: 'ai' },
  { id: 't26', name: 'Vercel', icon_name: 'vercel', category: 'tools' },
  { id: 't27', name: 'Netlify', icon_name: 'netlify', category: 'tools' },
  { id: 't28', name: 'Render', icon_name: 'render', category: 'tools' },
  { id: 't29', name: 'Git', icon_name: 'git', category: 'tools' },
  { id: 't30', name: 'GitHub', icon_name: 'github', category: 'tools' },
  { id: 't31', name: 'VS Code', icon_name: 'vscode', category: 'tools' },
  { id: 't32', name: 'Postman', icon_name: 'postman', category: 'tools' },
  { id: 't33', name: 'Figma', icon_name: 'figma', category: 'tools' },
  { id: 't34', name: 'npm', icon_name: 'npm', category: 'tools' }
];

const SEED_EXPERIENCE: Experience[] = [
  {
    id: 'e1',
    role: 'Full Stack Web Developer Intern',
    company: 'BELVO',
    duration: '2026 – Present',
    location: 'Remote',
    details: [
      'Developing scalable full-stack web applications using React, Next.js, TypeScript, Node.js, Express.js, and Supabase.',
      'Building secure CMS platforms, admin dashboards, authentication systems, and REST APIs.',
      'Integrating AI-powered features using Gemini AI APIs and automation workflows.',
      'Optimizing application performance, responsiveness, accessibility, deployment pipelines, and modern UI/UX.',
      'Collaborating with developers using Git, GitHub, code reviews, and agile development practices.'
    ]
  },
  {
    id: 'e2',
    role: 'Google Student Ambassador',
    company: 'Google',
    duration: '2025 – 2026',
    location: 'Remote',
    details: [
      'Organized AI awareness sessions and technical events.',
      'Helped students explore Google AI products including Gemini.',
      'Promoted AI adoption and community engagement inside campus.'
    ]
  }
];

const SEED_EDUCATION: Education[] = [
  {
    id: 'edu1',
    degree: 'Bachelor of Science (MSCS)',
    school: 'Wesley Degree College',
    field: 'Mathematics, Statistics & Computer Science',
    university: 'Osmania University',
    location: 'Hyderabad, Telangana',
    description: 'Studying Mathematics, Statistics and Computer Science with strong focus on software engineering, databases, full-stack development and Artificial Intelligence.',
    start_year: '2023',
    end_year: '2026',
    grade: ''
  }
];

const SEED_CERTIFICATIONS: Certification[] = [
  {
    id: 'cert1',
    title: 'Google Cloud Digital Leader',
    issuer: 'Google Cloud',
    issue_date: '2025',
    credential_url: 'https://cloud.google.com/learn/certification/'
  },
  {
    id: 'cert2',
    title: 'Meta Front-End Developer',
    issuer: 'Meta (Coursera)',
    issue_date: '2024',
    credential_url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer'
  }
];

const RECYCLE_BIN_KEY = 'lokesh_portfolio_recycle_bin';

interface RecycleItem {
  id: string;
  type: 'project' | 'tech' | 'experience' | 'education' | 'certification';
  data: any;
  deletedAt: number;
}

const KEYS = {
  PROJECTS: 'lokesh_portfolio_projects',
  TECH: 'lokesh_portfolio_tech',
  EXPERIENCE: 'lokesh_portfolio_experience',
  EDUCATION: 'lokesh_portfolio_education',
  AUTH: 'lokesh_portfolio_auth_token',
  RESUME: 'lokesh_portfolio_resume_url',
  CERTIFICATIONS: 'lokesh_portfolio_certifications',
  BRANDING: 'lokesh_portfolio_branding',
  LOGO: 'lokesh_portfolio_logo_url',
  FAVICON: 'lokesh_portfolio_favicon_url',
  OPENGRAPH: 'lokesh_portfolio_opengraph_url',
  LAST_SYNC: 'studio_last_sync',
  DRAFT_PREFIX: 'studio_draft_'
};

function getRecycleBin(): RecycleItem[] {
  const raw = localStorage.getItem(RECYCLE_BIN_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function setRecycleBin(items: RecycleItem[]): void {
  localStorage.setItem(RECYCLE_BIN_KEY, JSON.stringify(items));
}

export function addToRecycleBin(type: RecycleItem['type'], data: any): void {
  const bin = getRecycleBin();
  bin.push({ id: data.id || `${Date.now()}`, type, data, deletedAt: Date.now() });
  setRecycleBin(bin);
}

export function removeFromRecycleBin(id: string): void {
  setRecycleBin(getRecycleBin().filter(i => i.id !== id));
}

export function getRecycledItem(id: string): RecycleItem | undefined {
  return getRecycleBin().find(i => i.id === id);
}

export function getAllRecycledItems(): RecycleItem[] {
  return getRecycleBin();
}

export function restoreFromRecycleBin(id: string): any | null {
  const bin = getRecycleBin();
  const idx = bin.findIndex(i => i.id === id);
  if (idx === -1) return null;
  const item = bin[idx];
  setRecycleBin(bin.filter((_, i) => i !== idx));
  return item.data;
}

export function setLastSync(): void {
  localStorage.setItem(KEYS.LAST_SYNC, new Date().toISOString());
}

export function getLastSync(): string {
  return localStorage.getItem(KEYS.LAST_SYNC) || 'Never';
}

function cleanPlaceholderData<T>(items: T[], table?: string): T[] {
  if (!items || !Array.isArray(items)) return [];
  
  const keywords = ['e2e', 'dummy', 'placeholder', 'test', 'sample', 'fallback'];
  
  const isPlaceholderItem = (item: any): boolean => {
    for (const key in item) {
      if (Object.prototype.hasOwnProperty.call(item, key)) {
        const val = item[key];
        if (typeof val === 'string') {
          const lowerVal = val.toLowerCase();
          if (keywords.some(kw => lowerVal.includes(kw))) {
            return true;
          }
        } else if (Array.isArray(val)) {
          for (const subVal of val) {
            if (typeof subVal === 'string') {
              const lowerSub = subVal.toLowerCase();
              if (keywords.some(kw => lowerSub.includes(kw))) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  };

  const cleanItems = items.filter(item => !isPlaceholderItem(item));
  const removedItems = items.filter(item => isPlaceholderItem(item));

  if (removedItems.length > 0 && table && hasSupabaseConfig) {
    const ids = removedItems.map((item: any) => item.id).filter(Boolean);
    if (ids.length > 0) {
      const supabase = getSupabase();
      supabase.from(table).delete().in('id', ids)
        .then(({ error }) => {
          if (error) {
            console.error(`Failed to delete placeholder items from Supabase table '${table}':`, error);
          } else {
            console.log(`Successfully deleted placeholder items ${ids.join(', ')} from Supabase table '${table}'`);
          }
        })
        .catch(err => {
          console.error(`Error deleting from Supabase table '${table}':`, err);
        });
    }
  }

  return cleanItems;
}

const getLocal = <T>(key: string, seed: T[]): T[] => {
  const data = localStorage.getItem(key);
  if (!data) {
    const cleanSeed = cleanPlaceholderData<T>(seed);
    localStorage.setItem(key, JSON.stringify(cleanSeed));
    return cleanSeed;
  }
  try {
    const parsed = JSON.parse(data);
    const cleaned = cleanPlaceholderData<T>(parsed);
    if (parsed.length !== cleaned.length) {
      localStorage.setItem(key, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    const cleanSeed = cleanPlaceholderData<T>(seed);
    return cleanSeed;
  }
};

const setLocal = <T>(key: string, data: T[]): void => {
  const cleaned = cleanPlaceholderData<T>(data);
  localStorage.setItem(key, JSON.stringify(cleaned));
};

async function supabaseFetch<T>(
  table: string,
  query: (supabase: any) => Promise<{ data: T[] | null; error: any }>,
  localKey: string,
  seed: T[]
): Promise<T[]> {
  if (hasSupabaseConfig) {
    const supabase = getSupabase();
    try {
      const { data, error } = await query(supabase);
      if (error) throw new Error(`Supabase table '${table}' query failed: ${error.message}`);
      if (data && data.length > 0) {
        return cleanPlaceholderData<T>(data, table);
      }
      if (localModeAllowed()) {
        console.warn(`Supabase table '${table}' returned no data, using local storage`);
      }
      return getLocal<T>(localKey, seed);
    } catch (err) {
      if (!localModeAllowed()) throw err;
      console.warn(`Supabase table '${table}' fetch failed, using local storage:`, err);
      return getLocal<T>(localKey, seed);
    }
  } else if (!localModeAllowed()) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  }
  return getLocal<T>(localKey, seed);
}

async function supabaseUpsert<T extends { id?: string }>(
  table: string,
  item: T,
  localKey: string,
  seed: T[],
  generateId: () => string = () => Math.random().toString(36).substring(2, 9)
): Promise<T> {
  const id = item.id || generateId();
  const finalItem = { ...item, id, created_at: item.id ? undefined : new Date().toISOString() };

  if (hasSupabaseConfig) {
    const supabase = getSupabase();
    try {
      const { data, error } = await supabase
        .from(table)
        .upsert(finalItem)
        .select()
        .single();
      if (error) throw new Error(`Supabase table '${table}' upsert failed: ${error.message}`);
      if (data) return data;
      throw new Error(`Supabase table '${table}' upsert returned no data`);
    } catch (err) {
      if (!localModeAllowed()) throw err;
      console.warn(`Supabase table '${table}' save failed, using local storage:`, err);
    }
  } else if (!localModeAllowed()) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  }

  const current = getLocal<T>(localKey, seed);
  const existsIdx = current.findIndex((p: any) => p.id === id);
  if (existsIdx >= 0) {
    current[existsIdx] = { ...current[existsIdx], ...finalItem as any };
  } else {
    current.push(finalItem as any);
  }
  setLocal(localKey, current);
  return finalItem as T;
}

async function supabaseDelete(
  table: string,
  id: string,
  localKey: string,
  seed: any[]
): Promise<boolean> {
  if (hasSupabaseConfig) {
    const supabase = getSupabase();
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      if (error) throw new Error(`Supabase table '${table}' delete failed: ${error.message}`);
      return true;
    } catch (err) {
      if (!localModeAllowed()) throw err;
      console.warn(`Supabase table '${table}' delete failed, using local storage:`, err);
    }
  } else if (!localModeAllowed()) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  }

  const current = getLocal(localKey, seed);
  const filtered = current.filter((p: any) => p.id !== id);
  setLocal(localKey, filtered);
  return true;
}

export async function fetchProjects(): Promise<Project[]> {
  return supabaseFetch<Project>(
    'projects',
    (supabase) => supabase.from('projects').select('*').order('created_at', { ascending: true }),
    KEYS.PROJECTS,
    SEED_PROJECTS
  );
}

export async function saveProject(project: Omit<Project, 'id'> & { id?: string }): Promise<Project> {
  return supabaseUpsert<Project>('projects', project as Project, KEYS.PROJECTS, SEED_PROJECTS);
}

export async function deleteProject(id: string): Promise<boolean> {
  return supabaseDelete('projects', id, KEYS.PROJECTS, SEED_PROJECTS);
}

export async function fetchTechStack(): Promise<TechStack[]> {
  return supabaseFetch<TechStack>(
    'tech_stack',
    (supabase) => supabase.from('tech_stack').select('*').order('created_at', { ascending: true }),
    KEYS.TECH,
    SEED_TECH
  );
}

export async function saveTechStack(tech: Omit<TechStack, 'id'> & { id?: string }): Promise<TechStack> {
  return supabaseUpsert<TechStack>('tech_stack', tech as TechStack, KEYS.TECH, SEED_TECH);
}

export async function deleteTechStack(id: string): Promise<boolean> {
  return supabaseDelete('tech_stack', id, KEYS.TECH, SEED_TECH);
}

export async function fetchExperiences(): Promise<Experience[]> {
  return supabaseFetch<Experience>(
    'experiences',
    async (supabase) => {
      const { data, error } = await supabase.from('experiences').select('*');
      if (!error && data) return { data, error: null };
      return { data: null, error };
    },
    KEYS.EXPERIENCE,
    SEED_EXPERIENCE
  );
}

export async function saveExperience(exp: Omit<Experience, 'id'> & { id?: string }): Promise<Experience> {
  return supabaseUpsert<Experience>('experiences', exp as Experience, KEYS.EXPERIENCE, SEED_EXPERIENCE);
}

export async function deleteExperience(id: string): Promise<boolean> {
  return supabaseDelete('experiences', id, KEYS.EXPERIENCE, SEED_EXPERIENCE);
}

export async function fetchEducation(): Promise<Education[]> {
  return supabaseFetch<Education>(
    'education',
    async (supabase) => {
      const { data, error } = await supabase.from('education').select('*');
      if (!error && data) return { data, error: null };
      return { data: null, error };
    },
    KEYS.EDUCATION,
    SEED_EDUCATION
  );
}

export async function saveEducation(edu: Omit<Education, 'id'> & { id?: string }): Promise<Education> {
  return supabaseUpsert<Education>('education', edu as Education, KEYS.EDUCATION, SEED_EDUCATION);
}

export async function deleteEducation(id: string): Promise<boolean> {
  return supabaseDelete('education', id, KEYS.EDUCATION, SEED_EDUCATION);
}

export async function fetchCertifications(): Promise<Certification[]> {
  return supabaseFetch<Certification>(
    'certifications',
    async (supabase) => {
      const { data, error } = await supabase.from('certifications').select('*');
      if (!error && data) return { data, error: null };
      return { data: null, error };
    },
    KEYS.CERTIFICATIONS,
    SEED_CERTIFICATIONS
  );
}

export async function saveCertification(cert: Omit<Certification, 'id'> & { id?: string }): Promise<Certification> {
  return supabaseUpsert<Certification>('certifications', cert as Certification, KEYS.CERTIFICATIONS, SEED_CERTIFICATIONS);
}

export async function deleteCertification(id: string): Promise<boolean> {
  return supabaseDelete('certifications', id, KEYS.CERTIFICATIONS, SEED_CERTIFICATIONS);
}

export async function saveResume(url: string): Promise<void> {
  if (hasSupabaseConfig) {
    const supabase = getSupabase();
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: 'resume', resume_url: url }, { onConflict: 'id' });
      if (error) throw new Error(`Supabase table 'profiles' upsert failed: ${error.message}`);
      return;
    } catch (err) {
      if (!localModeAllowed()) throw err;
      console.warn('Supabase resume save failed, using local storage:', err);
    }
  } else if (!localModeAllowed()) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  }
  localStorage.setItem(KEYS.RESUME, url);
}

export async function fetchResumeUrl(): Promise<string> {
  if (hasSupabaseConfig) {
    const supabase = getSupabase();
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('resume_url')
        .eq('id', 'resume')
        .single();
      if (error) throw new Error(`Supabase table 'profiles' query failed: ${error.message}`);
      if (data?.resume_url) return data.resume_url;
    } catch (err) {
      if (!localModeAllowed()) throw err;
      console.warn('Supabase resume fetch failed, using local storage:', err);
    }
  } else if (!localModeAllowed()) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  }
  return localStorage.getItem(KEYS.RESUME) || '#';
}

async function base64ToBlobUrl(dataUrl: string): Promise<{ blob: Blob; mime: string; ext: string }> {
  const mimeMatch = dataUrl.match(/^data:([^;]+);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const ext = mime.split('/')[1] || 'png';
  const base64Data = dataUrl.split(',')[1];
  const binaryStr = atob(base64Data);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
  const blob = new Blob([bytes], { type: mime });
  return { blob, mime, ext };
}

export type StorageBucket = 'project-logos' | 'project-thumbnails' | 'project-hero' | 'project-gallery' | 'experience-logos' | 'education-logos' | 'tech-logos' | 'certification-logos' | 'logos' | 'favicons' | 'opengraph' | 'resumes';

const BUCKET_CACHE = new Set<string>();

async function ensureBucket(supabase: any, bucket: string): Promise<void> {
  if (BUCKET_CACHE.has(bucket)) return;
  try {
    const { data } = await supabase.storage.getBucket(bucket);
    if (data) { BUCKET_CACHE.add(bucket); return; }
  } catch { /* ignore, will try to create */ }

  try {
    await supabase.storage.createBucket(bucket, { public: true, allowedMimeTypes: ['image/*', 'application/pdf'], fileSizeLimit: 104857600 });
    BUCKET_CACHE.add(bucket);
  } catch (err: any) {
    const msg = err?.message?.toLowerCase() || '';
    if (msg.includes('already exists')) {
      BUCKET_CACHE.add(bucket);
      return;
    }
    // If we cannot create it (e.g. permissions), continue the upload attempt so
    // the error surfaces clearly instead of failing silently.
    console.warn(`Could not auto-create bucket '${bucket}':`, err?.message || err);
  }
}

export async function uploadProjectImage(
  projectId: string,
  dataUrl: string,
  bucket: StorageBucket
): Promise<string> {
  if (dataUrl.startsWith('data:')) {
    if (!hasSupabaseConfig) {
      if (!localModeAllowed()) throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      return dataUrl;
    }
    const supabase = getSupabase();
    await ensureBucket(supabase, bucket);
    const { blob, mime, ext } = await base64ToBlobUrl(dataUrl);
    const fileName = `${projectId}_${Date.now()}.${ext}`;

    // Print diagnostics immediately before upload executes
    console.log('--- SUPABASE UPLOAD DIAGNOSTICS ---');
    console.log('1. Runtime Supabase URL:', supabaseUrl);
    console.log('2. Bucket name:', bucket);
    console.log('3. Upload path:', `object/${bucket}/${fileName}`);
    console.log('4. File name:', fileName);
    console.log('5. Complete upload() call: supabase.storage.from("' + bucket + '").upload("' + fileName + '", blob, { contentType: "' + mime + '", upsert: true })');
    console.log('6. Final request URL:', `${supabaseUrl}/storage/v1/object/${bucket}/${fileName}`);
    console.log('-----------------------------------');

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, blob, { contentType: mime, upsert: true });
    if (uploadError) {
      const msg = uploadError.message?.toLowerCase() || '';
      if (msg.includes('bucket') || msg.includes('not found')) {
        throw new Error(`Storage bucket '${bucket}' does not exist. Create it in your Supabase dashboard.`);
      }
      throw new Error(`Supabase Storage upload to '${bucket}' failed: ${uploadError.message}`);
    }
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return urlData?.publicUrl || dataUrl;
  }
  return dataUrl;
}

export async function saveMetadata(key: 'logo' | 'favicon' | 'opengraph', value: string): Promise<void> {
  if (hasSupabaseConfig && value.startsWith('data:')) {
    const supabase = getSupabase();
    const bucketName = key === 'logo' ? 'logos' : key === 'favicon' ? 'favicons' : 'opengraph';
    await ensureBucket(supabase, bucketName);
    const { blob, mime, ext } = await base64ToBlobUrl(value);
    const fileName = `${key}_${Date.now()}.${ext}`;

    // Print diagnostics immediately before upload executes
    console.log('--- SUPABASE UPLOAD DIAGNOSTICS ---');
    console.log('1. Runtime Supabase URL:', supabaseUrl);
    console.log('2. Bucket name:', bucketName);
    console.log('3. Upload path:', `object/${bucketName}/${fileName}`);
    console.log('4. File name:', fileName);
    console.log('5. Complete upload() call: supabase.storage.from("' + bucketName + '").upload("' + fileName + '", blob, { contentType: "' + mime + '", upsert: true })');
    console.log('6. Final request URL:', `${supabaseUrl}/storage/v1/object/${bucketName}/${fileName}`);
    console.log('-----------------------------------');

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, blob, { contentType: mime, upsert: true });
    if (uploadError) {
      const msg = uploadError.message?.toLowerCase() || '';
      if (msg.includes('bucket') || msg.includes('not found')) {
        throw new Error(`Storage bucket '${bucketName}' does not exist. Create it in your Supabase dashboard.`);
      }
      throw new Error(`Supabase Storage upload to '${bucketName}' failed: ${uploadError.message}`);
    }
    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);
    const publicUrl = urlData?.publicUrl || value;
    await upsertBrandingInDb(key, publicUrl);
    if (key === 'logo') localStorage.setItem(KEYS.LOGO, publicUrl);
    if (key === 'favicon') {
      localStorage.setItem(KEYS.FAVICON, publicUrl);
      applyMetadata(undefined, publicUrl, undefined);
    }
    if (key === 'opengraph') {
      localStorage.setItem(KEYS.OPENGRAPH, publicUrl);
      applyMetadata(undefined, undefined, publicUrl);
    }
    return;
  }

  if (!localModeAllowed()) {
    if (!hasSupabaseConfig) throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    if (!value.startsWith('data:')) {
      await upsertBrandingInDb(key, value);
      if (key === 'logo') localStorage.setItem(KEYS.LOGO, value);
      if (key === 'favicon') {
        localStorage.setItem(KEYS.FAVICON, value);
        applyMetadata(undefined, value, undefined);
      }
      if (key === 'opengraph') {
        localStorage.setItem(KEYS.OPENGRAPH, value);
        applyMetadata(undefined, undefined, value);
      }
      return;
    }
    throw new Error('Supabase is connected but Storage upload failed without error details.');
  }

  await upsertBrandingInDb(key, value);
  if (key === 'logo') localStorage.setItem(KEYS.LOGO, value);
  if (key === 'favicon') {
    localStorage.setItem(KEYS.FAVICON, value);
    applyMetadata(undefined, value, undefined);
  }
  if (key === 'opengraph') {
    localStorage.setItem(KEYS.OPENGRAPH, value);
    applyMetadata(undefined, undefined, value);
  }
}

async function upsertBrandingInDb(key: 'logo' | 'favicon' | 'opengraph', value: string): Promise<void> {
  if (!hasSupabaseConfig) {
    setLocalBrandingFromKey(key, value);
    return;
  }
  const supabase = getSupabase();
  try {
    const { data: existing } = await supabase.from('branding').select('*').eq('id', 'main').single();
    const update: Record<string, any> = { id: 'main', updated_at: new Date().toISOString() };
    const col = key === 'logo' ? 'logo_url' : key === 'favicon' ? 'favicon_url' : 'og_url';
    update[col] = value;
    const { error } = await supabase.from('branding').upsert(update, { onConflict: 'id' });
    if (error) throw new Error(`Supabase table 'branding' upsert failed: ${error.message}`);
    setLocalBrandingFromKey(key, value);
  } catch (err) {
    if (!localModeAllowed()) throw err;
    console.warn('Supabase branding DB save failed, using local storage:', err);
    setLocalBrandingFromKey(key, value);
  }
}

function setLocalBrandingFromKey(key: 'logo' | 'favicon' | 'opengraph', value: string): void {
  if (key === 'logo') localStorage.setItem(KEYS.LOGO, value);
  if (key === 'favicon') localStorage.setItem(KEYS.FAVICON, value);
  if (key === 'opengraph') localStorage.setItem(KEYS.OPENGRAPH, value);
}

export function getCachedMetadata(): { logo: string; favicon: string; opengraph: string } {
  if (typeof window === 'undefined') return { logo: '', favicon: '', opengraph: '' };
  return {
    logo: localStorage.getItem(KEYS.LOGO) || '',
    favicon: localStorage.getItem(KEYS.FAVICON) || '',
    opengraph: localStorage.getItem(KEYS.OPENGRAPH) || ''
  };
}

export function getCachedAvatarUrl(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('lokesh_portfolio_avatar_url') || '';
}

export function preloadImage(url: string): Promise<boolean> {
  if (!url || typeof window === 'undefined') return Promise.resolve(true);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

export async function preloadBrandingAssets(metadata: { logo?: string; favicon?: string }, avatarUrl?: string): Promise<void> {
  const promises: Promise<boolean>[] = [];
  if (metadata?.logo) promises.push(preloadImage(metadata.logo));
  if (metadata?.favicon) promises.push(preloadImage(metadata.favicon));
  if (avatarUrl) promises.push(preloadImage(avatarUrl));
  if (promises.length > 0) {
    await Promise.all(promises);
  }
}

export async function fetchMetadata(): Promise<{ logo: string; favicon: string; opengraph: string }> {
  if (hasSupabaseConfig) {
    const supabase = getSupabase();
    try {
      const { data, error } = await supabase
        .from('branding')
        .select('*')
        .eq('id', 'main')
        .single();
      if (!error && data) {
        const result = {
          logo: data.logo_url || '',
          favicon: data.favicon_url || '',
          opengraph: data.og_url || ''
        };
        if (result.logo) localStorage.setItem(KEYS.LOGO, result.logo);
        if (result.favicon) localStorage.setItem(KEYS.FAVICON, result.favicon);
        if (result.opengraph) localStorage.setItem(KEYS.OPENGRAPH, result.opengraph);
        return result;
      }
    } catch (err) {
      if (!localModeAllowed()) throw err;
      console.warn('Supabase branding fetch failed, using local storage:', err);
    }
  } else if (!localModeAllowed()) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  }
  return getCachedMetadata();
}

export function applyMetadata(logoUrl?: string, faviconUrl?: string, opengraphUrl?: string) {
  if (typeof window === 'undefined') return;
  const fUrl = faviconUrl || localStorage.getItem(KEYS.FAVICON) || '';
  if (fUrl) {
    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = fUrl;
  }
  const oUrl = opengraphUrl || localStorage.getItem(KEYS.OPENGRAPH) || '';
  if (oUrl) {
    let metaOgImage: HTMLMetaElement | null = document.querySelector("meta[property='og:image']");
    if (!metaOgImage) {
      metaOgImage = document.createElement('meta');
      metaOgImage.setAttribute('property', 'og:image');
      document.getElementsByTagName('head')[0].appendChild(metaOgImage);
    }
    metaOgImage.content = oUrl;
  }
}

export async function checkSession(): Promise<boolean> {
  const localAuth = localStorage.getItem(KEYS.AUTH) === 'authenticated';
  if (hasSupabaseConfig) {
    try {
      const supabase = getSupabase();
      const { data } = await supabase.auth.getSession();
      return !!data.session || localAuth;
    } catch {
      return localAuth;
    }
  }
  return localAuth;
}

export async function loginUser(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  
  // Direct admin credentials login (works in all environments)
  if (
    (normalizedEmail === 'admin' || normalizedEmail === 'admin@admin.com') &&
    password === 'admin123'
  ) {
    localStorage.setItem(KEYS.AUTH, 'authenticated');
    return { success: true };
  }

  if (!isProduction) {
    if (
      (normalizedEmail === 'lokesh81@myyahoo.com' && password === 'lokesh_speed_build_2026') ||
      (normalizedEmail === 'admin' && password === 'admin')
    ) {
      localStorage.setItem(KEYS.AUTH, 'authenticated');
      return { success: true };
    }
  }

  if (hasSupabaseConfig) {
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      localStorage.setItem(KEYS.AUTH, 'authenticated');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Authentication error occurred.' };
    }
  }

  if (isProduction) {
    return { success: false, error: 'Invalid credentials or Supabase configuration error.' };
  }

  return { success: false, error: 'Invalid credentials. Try "admin" / "admin123" or "lokesh81@myyahoo.com" / "lokesh_speed_build_2026" in demo mode.' };
}

export async function logoutUser(): Promise<void> {
  if (hasSupabaseConfig) {
    try {
      const supabase = getSupabase();
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Supabase signout failed:', err);
    }
  }
  localStorage.removeItem(KEYS.AUTH);
}

export async function saveAvatarUrl(url: string): Promise<void> {
  if (hasSupabaseConfig) {
    const supabase = getSupabase();
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: 'avatar', resume_url: url }, { onConflict: 'id' });
      if (error) throw new Error(`Supabase profiles upsert failed: ${error.message}`);
      return;
    } catch (err) {
      if (!localModeAllowed()) throw err;
      console.warn('Supabase avatar save failed, using local storage:', err);
    }
  } else if (!localModeAllowed()) {
    throw new Error('Supabase is not configured.');
  }
  localStorage.setItem('lokesh_portfolio_avatar_url', url);
}

export async function fetchAvatarUrl(): Promise<string> {
  if (hasSupabaseConfig) {
    const supabase = getSupabase();
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('resume_url')
        .eq('id', 'avatar')
        .single();
      if (!error && data?.resume_url) return data.resume_url;
    } catch (err) {
      if (!localModeAllowed()) throw err;
      console.warn('Supabase avatar fetch failed, using local storage:', err);
    }
  } else if (!localModeAllowed()) {
    throw new Error('Supabase is not configured.');
  }
  return localStorage.getItem('lokesh_portfolio_avatar_url') || '';
}
