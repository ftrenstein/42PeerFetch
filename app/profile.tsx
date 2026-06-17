import { View, Text, StyleSheet, TextInput, Button, Image, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { getMe, searchUserByLogin, getUserById, getUserSkills, getUserProjects, type User, type Skill, type Projects } from '../services/api';
import { RadarChart } from 'react-native-gifted-charts/dist/RadarChart';

export default function ProfileScreen() {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Projects[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [projectFilter, setProjectFilter] = useState<'all' | 'finished' | 'failed'>('all');

  useEffect(() => {
    const loadCurrentUser = async () => {
      setLoading(true);
      const me = await getMe();
      if (me) {
        setUser(me);
        setSkills(getUserSkills(me));
      }
      setLoading(false);
    };
    loadCurrentUser();
  }, []);

  const handleSearch = async () => {
    if (!login.trim()) {
      setError('Enter login');
      return;
    }

    setLoading(true);
    setError('');
    setUser(null);
    setSkills([]);
    setProjects([]);

    try {
      const foundUser = await searchUserByLogin(login.trim().toLowerCase());
      if (!foundUser) {
        setError('User not found');
        setLoading(false);
        return;
      }


      const fullUser = await getUserById(foundUser.id);
      setUser(fullUser);

      if (fullUser) {
        setSkills(getUserSkills(fullUser));
        console.log('Full user data 2:', skills);
      }

      const userProjects = await getUserProjects(foundUser.id);
      setProjects(userProjects);
    } catch (err: any) {
      const errorMsg = err?.message || 'Search error';
      setError(errorMsg);
      console.error('Full error:', err);
    } finally {
      setLoading(false);
    }
  };

    const clearSearch = () => {
    setLogin('');
    setUser(null);
    setSkills([]);
    setProjects([]);
    setError('');
    setProjectFilter('all');
  }

  const filteredProjects = projects.filter((p) => {
    if (projectFilter === 'all') return true;
    return p.status === projectFilter;
  });

  return (
    
    <ScrollView style={styles.container}>
      {/* Search Section */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.input}
          placeholder="Enter user login"
          value={login}
          onChangeText={setLogin}
          editable={!loading}
        />
        <Button title="Search" onPress={handleSearch} disabled={loading} />
      </View>

      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}

      {error && <Text style={styles.error}>{error}</Text>}

      {user && (
        <>
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileLeft}>
              {user.image?.link && <Image source={{ uri: user.image.link }} style={styles.avatar} />}
              <Text style={styles.username}>{user.login}</Text>
              <Text style={styles.name}>{user.first_name} {user.last_name}</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Lvl {user.level.toFixed(2)}</Text>
              </View>
              {user.cursus && <Text style={styles.cursus}>{user.cursus}</Text>}
            </View>

            <View style={styles.profileRight}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{user.email}</Text>
              </View>
              {user.phone && user.phone !== 'hidden' && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Phone</Text>
                  <Text style={styles.value}>{user.phone}</Text>
                </View>
              )}
              {user.mobile && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Mobile</Text>
                  <Text style={styles.value}>{user.mobile}</Text>
                </View>
              )}
              <View style={styles.infoRow}>
                <Text style={styles.label}>Wallet</Text>
                <Text style={styles.value}>{user.wallet} pts</Text>
              </View>
              {user.location && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Location</Text>
                  <Text style={styles.value}>{user.location}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Skills */}
          {skills.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills</Text>
              <RadarChart
                data={skills.slice(0, 15).map(s => s.level)}
                labels={skills.slice(0, 15).map(s =>
                  s.name.length > 10 ? s.name.slice(0, 9) + '…' : s.name
                )}
                chartSize={260}
                chartContainerProps={{ width: 370, height: 370, shiftX: 55, shiftY: 55 }}
                labelsPositionOffset={2}
                gridConfig={{ stroke: '#ddd', strokeWidth: 1 }}
                polygonConfig={{ fill: '#007AFF', opacity: 0.25, stroke: '#007AFF', strokeWidth: 2 }}
                labelConfig={{ fontSize: 10, stroke: '#333' }}
                dataLabels={skills.slice(0, 15).map(s => s.level.toFixed(2))}
                dataLabelsConfig={{ stroke: '#0450a2' }}
                dataLabelsPositionOffset={0}
                hideAsterLines
              />
            </View>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Projects</Text>
              <View style={styles.filterButtons}>
                {(['all', 'finished', 'failed'] as const).map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterButton,
                      projectFilter === filter && styles.filterButtonActive,
                    ]}
                    onPress={() => setProjectFilter(filter)}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        projectFilter === filter && styles.filterButtonTextActive,
                      ]}
                    >
                      {filter === 'all' ? 'All' : filter === 'finished' ? 'Finished' : 'Failed'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <View key={project.id} style={styles.projectItem}>
                    <Text style={styles.projectName}>{project.project.name}</Text>
                    <View style={styles.projectInfo}>
                      <Text
                        style={[
                          styles.projectStatus,
                          project.status === 'finished'
                            ? styles.statusFinished
                            : styles.statusFailed,
                        ]}
                      >
                        {/* {project.status === 'finished' ? '✓ Finished' : '✗ Failed'} */}
                      </Text>
                      {project.final_mark !== null && (
                        <Text style={styles.projectMark}>Mark: {project.final_mark}</Text>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No projects in this category</Text> 
              )}
            </View>
          )} 

          {/* Back Button */}
          {/* <View style={styles.backButtonContainer}>
            <Button title="← Back to Search" onPress={() => clearSearch()} />
            <Button title="Logout" onPress={() => router.back()} />

          </View> */}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchSection: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  loader: {
    marginTop: 20,
  },
  error: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  profileCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 16,
  },
  profileLeft: {
    alignItems: 'center',
    width: 110,
  },
  profileRight: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  username: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 6,
  },
  levelBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cursus: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'column',
  },
  label: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 13,
    color: '#333',
  },
  skillItem: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  skillName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  skillLevel: {
    fontSize: 14,
    color: '#666',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  percentage: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 13,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  projectItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  projectName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  projectInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  projectStatus: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusFinished: {
    color: '#34C759',
  },
  statusFailed: {
    color: '#FF3B30',
  },
  projectMark: {
    fontSize: 13,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 16,
  },
  backButtonContainer: {
    padding: 16,
    marginBottom: 20,
  },
});
