// API Response types from 42 intra
export interface CursusUser {
  id: number;
  level: number;
  grade: string | null;
  cursus: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface APIUser {
  id: number;
  login: string;
  first_name: string;
  last_name: string;
  email: string;
  displayname: string;
  image: {
    link: string;
  };
  phone: string | null;
  wallet: number;
  correction_point: number;
  location: string | null;
  cursus_users: CursusUser[];
}

// App domain types
export interface User {
  id: number;
  login: string;
  first_name: string;
  last_name: string;
  email: string;
  displayname: string;
  image: {
    link: string;
  };
  phone: string | null;
  wallet: number;
  correction_point: number;
  location: string | null;
  level: number;
  cursus: string;
}

export interface Skill {
  id: number;
  name: string;
  level: number;
  percentage: number;
}

export interface Project {
  id: number;
  name: string;
  slug: string;
}

export interface ProjectUser {
  id: number;
  status: 'finished' | 'failed' | 'in_progress';
  final_mark: number | null;
  marked: boolean;
  project: Project;
  created_at: string;
}

// Transform API response to app model
export function mapAPIUserToUser(apiUser: APIUser): User {
  const primaryCursus = apiUser.cursus_users?.[0];

  return {
    ...apiUser,
    level: primaryCursus?.level || 0,
    cursus: primaryCursus?.cursus?.name || 'Unknown',
  };
}
