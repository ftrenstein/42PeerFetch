import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { clearTokens } from '../../services/tokenManager';
import { getMe, getUserSkills, getUserProjects, type User, type Skill, type Projects } from '../../services/api';
import UserProfileView from '../../components/UserProfileView';

export default function MeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<User | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Projects[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const me = await getMe();
        if (!me) {
          // No token or refresh failed — go back to login
          await clearTokens();
          router.replace('/');
          return;
        }
        setUser(me);
        setSkills(getUserSkills(me));
        try {
          setProjects(await getUserProjects(me.id));
        } catch { }
      } catch (err: any) {
        const msg: string = err?.message || '';
        const isAuthError = msg.includes('expired') || msg.includes('not logged in') || msg.includes('denied');
        if (isAuthError) {
          await clearTokens();
          router.replace('/');
        } else {
          setError(msg || 'Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleLogout = async () => {
    await clearTokens();
    router.replace('/');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: insets.top }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {user && <UserProfileView user={user} skills={skills} projects={projects} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  logoutText: { color: '#FF3B30', fontSize: 15 },
  loader: { marginTop: 40 },
  error: { color: '#FF3B30', textAlign: 'center', margin: 20 },
});
