import * as SecureStore from 'expo-secure-store';
import { User, Skill, ProjectUser, APIUser, mapAPIUserToUser } from './types/users';


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

export async function getUserSkills(id: number): Promise<Skill[]> {
  try {
    const token = await SecureStore.getItemAsync('access_token');
    if (!token) {
      throw new Error('Access token not found');
    }

    const response = await fetch(
      `https://api.intra.42.fr/v2/users/${id}/skills`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const skills: Skill[] = await response.json();
    console.log('=== SKILLS RESPONSE ===');
    console.log(JSON.stringify(skills, null, 2));
    return skills;
  } catch (error) {
    console.error('Error fetching user skills:', error);
    throw error;
  }
}

export async function getUserProjects(id: number): Promise<ProjectUser[]> {
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
    const projects: ProjectUser[] = await response.json();
    console.log('=== PROJECTS RESPONSE ===');
    console.log(JSON.stringify(projects, null, 2));
    return projects;
  } catch (error) {
    console.error('Error fetching user projects:', error);
    throw error;
  }
}
