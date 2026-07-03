import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { searchUserByLogin, getUserById, getUserSkills, getUserProjects, type User, type Skill, type Projects } from '../../services/api';
import UserProfileView from '../../components/UserProfileView';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [login, setLogin] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Projects[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!login.trim()) { setError('Enter login'); return; }

    setLoading(true);
    setError('');
    setUser(null);
    setSkills([]);
    setProjects([]);

    let resolvedId: number | null = null;

    try {
      const foundUser = await searchUserByLogin(login.trim().toLowerCase());
      if (!foundUser) {
        setError('User not found');
        setLoading(false);
        return;
      }
      resolvedId = foundUser.id;
      const fullUser = await getUserById(foundUser.id);
      setUser(fullUser);
      if (fullUser) setSkills(getUserSkills(fullUser));
    } catch (err: any) {
      setError(err?.message || 'Search error');
      setLoading(false);
      return;
    }

    try {
      if (resolvedId !== null) {
        setProjects(await getUserProjects(resolvedId));
      }
    } catch {}

    setLoading(false);
  };

  const canSearch = login.trim().length > 0 && !loading;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: insets.top }}>
      <View style={styles.searchSection}>
        <TextInput
          style={styles.input}
          placeholder="Enter user login"
          value={login}
          onChangeText={setLogin}
          editable={!loading}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          style={[styles.searchButton, !canSearch && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={!canSearch}
        >
          <Text style={styles.searchButtonText}>Search</Text>
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
  searchSection: { padding: 16, backgroundColor: '#f9f9f9', gap: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, fontSize: 16 },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonDisabled: { backgroundColor: '#a0c4ff' },
  searchButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  loader: { marginTop: 20 },
  error: { color: '#FF3B30', marginTop: 10, textAlign: 'center', paddingHorizontal: 16 },
});
