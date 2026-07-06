import { User, Skill, Projects, APIUser, mapAPIUserToUser } from './types/users';
import { getValidToken } from './tokenManager';
export type { User, Skill, Projects };

/**
 * DATA FLOW
 *
 * 1. searchUserByLogin(login)
 *    GET /v2/users?filter[login]=xxx
 *    Returns a LIGHT user — cursus_users is present but skills[] is EMPTY.
 *    Used only to get the user's numeric id.
 *
 * 2. getUserById(id)
 *    GET /v2/users/:id
 *    Returns the FULL user — cursus_users[].skills is populated.
 *    This is the source of truth for level, cursus name, and skills.
 *
 * 3. getUserSkills(fullUser)
 *    No API call. Extracts skills from the cursus_users array
 *    already fetched in step 2. Picks the cursus with the most skills
 *    (usually "42cursus", not "Piscine").
 *
 * 4. getUserProjects(id)
 *    GET /v2/users/:id/projects_users
 *    Separate endpoint — projects are not included in step 2.
 */

function apiError(status: number): Error {
  if (status === 401) return new Error('Session expired. Please log in again.');
  if (status === 403) return new Error('Access denied.');
  if (status === 404) return new Error('User not found.');
  if (status >= 500) return new Error('Server error. Try again later.');
  return new Error(`Request failed (${status})`);
}

function networkError(error: unknown): Error {
  const msg = (error as any)?.message || '';
  if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('fetch')) {
    return new Error('Network error. Check your connection.');
  }
  return error instanceof Error ? error : new Error(String(error));
}

// Returns the currently authenticated user (OAuth token owner).
// Returns null if not logged in (no token stored). Throws on API/network errors.
export async function getMe(): Promise<User | null> {
  try {
    const token = await getValidToken();
    if (!token) return null;
    const response = await fetch('https://api.intra.42.fr/v2/me', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw apiError(response.status);
    const apiUser: APIUser = await response.json();
    return mapAPIUserToUser(apiUser);
  } catch (error) {
    throw networkError(error);
  }
}

export async function searchUserByLogin(login: string): Promise<User | null> {
  try {
    const token = await getValidToken();
    if (!token) throw new Error('Not logged in.');

    const response = await fetch(
      `https://api.intra.42.fr/v2/users?filter[login]=${encodeURIComponent(login)}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    if (!response.ok) throw apiError(response.status);

    const users: APIUser[] = await response.json();
    return users.length > 0 ? mapAPIUserToUser(users[0]) : null;
  } catch (error) {
    throw networkError(error);
  }
}

export async function getUserById(id: number): Promise<User | null> {
  try {
    const token = await getValidToken();
    if (!token) throw new Error('Not logged in.');

    const response = await fetch(
      `https://api.intra.42.fr/v2/users/${id}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    if (!response.ok) throw apiError(response.status);

    const apiUser: APIUser = await response.json();
    return mapAPIUserToUser(apiUser);
  } catch (error) {
    throw networkError(error);
  }
}

// Skills live inside cursus_users (already in the getUserById response).
// We pick the cursus with the most skills — that's "42cursus", not "Piscine".
export function getUserSkills(user: User): Skill[] {
  const cursusArray = user.cursus_users || [];
  const richest = cursusArray.reduce(
    (best, cur) => (cur.skills.length > best.skills.length ? cur : best),
    cursusArray[0]
  );
  return richest?.skills ?? [];
}

export async function getUserProjects(id: number): Promise<Projects[]> {
  try {
    const token = await getValidToken();
    if (!token) throw new Error('Not logged in.');

    const response = await fetch(
      `https://api.intra.42.fr/v2/users/${id}/projects_users`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    if (!response.ok) throw apiError(response.status);

    const projects: Projects[] = await response.json();
    return projects;
  } catch (error) {
    throw networkError(error);
  }
}
