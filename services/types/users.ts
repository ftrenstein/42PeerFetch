// API Response types from 42 intra

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
  campus: { id: number; name: string; country: string }[];
  campus_users: { campus_id: number; is_primary: boolean }[];
  cursus_users: CursusUser[];
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

export interface CursusUser {
  id: number;
  begin_at: string;
  end_at: string | null;
  grade: string | null;
  level: number;
  skills: Skill[];
  cursus_id: number;
  cursus: {
    id: number;
    created_at: string;
    name: string;
    slug: string;
    kind: string;
  };
  has_coalition: boolean;
  updated_at: string | null;
  blackholed_at: string | null;
  created_at: string;
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

export interface Projects {
  id: number;
  occurrence: number;
  final_mark: number | null;
  status: "waiting_for_correction" | "finished" | "in_progress";
  validated?: boolean | null;
  current_team_id: number;
  project: Project;
  cursus_ids: number[];
  marked_at: string | null;
  marked: boolean;
}

export interface User extends APIUser {
  level: number;
  cursus: string;
  mobile?: string;
}

// Transform API response to app model.
// Picks the cursus with the highest level (= "42cursus", not "Piscine").
export function mapAPIUserToUser(apiUser: APIUser): User {
  const cursusArray = apiUser.cursus_users || [];
  const mainCursus = cursusArray.reduce(
    (best, cur) => (cur.level > best.level ? cur : best),
    cursusArray[0]
  );

  return {
    ...apiUser,
    level: mainCursus?.level || 0,
    cursus: mainCursus?.cursus?.name || 'Unknown',
  };
}
