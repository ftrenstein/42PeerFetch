import * as SecureStore from 'expo-secure-store';
import { User, Skill, Projects, APIUser, mapAPIUserToUser } from './types/users';
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
 * 4. getUserProjects(id)  [currently disabled]
 *    GET /v2/users/:id/projects_users
 *    Separate endpoint — projects are not included in step 2.
 */

// Returns the currently authenticated user (OAuth token owner).
export async function getMe(): Promise<User | null> {
  try {
    const token = await SecureStore.getItemAsync('access_token');
    if (!token) return null;
    const response = await fetch('https://api.intra.42.fr/v2/me', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const apiUser: APIUser = await response.json();
    return mapAPIUserToUser(apiUser);
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

export async function searchUserByLogin(login: string): Promise<User | null> {
  console.log('🚀 SEARCH STARTED FOR:', login);
  try {
    const token = await SecureStore.getItemAsync('access_token');
    console.log('🔑 Token:', token ? 'Found' : 'NOT FOUND');
    if (!token) {
      throw new Error('Access token not found');
    }

    console.log('📡 Fetching from API...');
    const response = await fetch(
      `https://api.intra.42.fr/v2/users?filter[login]=${login}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    console.log('📊 API Status:', response.status);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const users: APIUser[] = await response.json();
    console.log('\n\n🔍 ======================== SEARCH USER ========================');
    console.log('User found:', users[0]?.login);
    console.log(JSON.stringify(users[0], null, 2));
    console.log('================================================================\n\n');
    return users.length > 0 ? mapAPIUserToUser(users[0]) : null;
  } catch (error) {
    console.error('❌ Error searching user:', error);
    throw error;
  }
}

export async function getUserById(id: number): Promise<User | null> {
  try {
    const token = await SecureStore.getItemAsync('access_token');
    if (!token) {
      throw new Error('Access token not found');
    }

    const response = await fetch(
      `https://api.intra.42.fr/v2/users/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const apiUser: APIUser = await response.json();
    const user = mapAPIUserToUser(apiUser);
    console.log('User transformed:', {
      login: user.login,
      level: user.level,
      cursus: user.cursus,
    });
    return user;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
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
    const token = await SecureStore.getItemAsync('access_token');
    if (!token) {
      throw new Error('Access token not found');
    }

    const response = await fetch(
      `https://api.intra.42.fr/v2/users/${id}/projects_users`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const projects: Projects[] = await response.json();
    console.log('=== PROJECTS RESPONSE ===');
    console.log(JSON.stringify(projects, null, 2));
    return projects;
  } catch (error) {
    console.error('Error fetching user projects:', error);
    throw error;
  }
}
