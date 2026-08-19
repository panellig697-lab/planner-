export interface Person {
  id: string;
  name: string;
  role: string;
  email: string | null;
  phone: string | null;
  relationship: string | null;
  notes: string;
  last_contacted: string | null;
  next_follow_up: string | null;
  company_id: string[];
}

export interface Company {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  opportunity: string;
  problems_identified: string;
  solutions_offered: string;
  pipeline_stage: string | null;
  deal_value: number | null;
  revenue_note: string;
  source: string | null;
  last_contacted: string | null;
  area: string | null;
}

export interface Project {
  id: string;
  name: string;
  purpose: string;
  status: string | null;
  area: string | null;
  client_person_id: string[];
  client_company_id: string[];
  revenue_potential: number | null;
  target_date: string | null;
  notes: string;
}

export interface Task {
  id: string;
  task: string;
  priority: string | null;
  deadline: string | null;
  status: string | null;
  next_action: string;
  project_id: string[];
  person_id: string[];
  company_id: string[];
}

export interface Idea {
  id: string;
  idea: string;
  category: string | null;
  description: string;
  potential_value: string | null;
  status: string | null;
  related_project_ids: string[];
}

export interface Knowledge {
  id: string;
  title: string;
  category: string | null;
  source: string | null;
  summary: string;
  tags: string[];
  related_project_ids: string[];
}

export interface CreativeWork {
  id: string;
  name: string;
  discipline: string | null;
  status: string | null;
  category: string | null;
  featured: boolean;
  description: string;
  url: string | null;
  related_project_ids: string[];
}

export interface AppState {
  people: Person[];
  companies: Company[];
  projects: Project[];
  tasks: Task[];
  ideas: Idea[];
  knowledge: Knowledge[];
  creative: CreativeWork[];
}

export const EMPTY_STATE: AppState = {
  people: [],
  companies: [],
  projects: [],
  tasks: [],
  ideas: [],
  knowledge: [],
  creative: [],
};
