import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { RadarChart } from 'react-native-gifted-charts/dist/RadarChart';
import { type User, type Skill, type Projects } from '../services/api';

interface Props {
  user: User;
  skills: Skill[];
  projects: Projects[];
}

export default function UserProfileView({ user, skills, projects }: Props) {
  const [projectFilter, setProjectFilter] = useState<'all' | 'finished' | 'failed'>('all');

  const filteredProjects = projects.filter(p => {
    if (projectFilter === 'all') return true;
    return p.status === projectFilter;
  });

  const primaryCampusId = user.campus_users?.find(cu => cu.is_primary)?.campus_id;
  const campus = user.campus?.find(c => c.id === primaryCampusId) ?? user.campus?.[0];

  return (
    <>
      <View style={styles.profileCard}>
        <View style={styles.profileLeft}>
          {user.image?.link && (
            <Image source={{ uri: user.image.link }} style={styles.avatar} />
          )}
          <Text style={styles.username}>{user.login}</Text>
          <Text style={styles.name}>{user.first_name} {user.last_name}</Text>
          <View style={styles.levelIndicator}>
            <View style={styles.levelLabelRow}>
              <Text style={styles.levelText}>Level {Math.floor(user.level)}</Text>
              <Text style={styles.levelNext}>{Math.round((user.level % 1) * 100)}%</Text>
            </View>
            <View style={styles.levelBarBg}>
              <View style={[styles.levelBarFill, { width: `${(user.level % 1) * 100}%` }]} />
            </View>
          </View>
          {user.cursus && <Text style={styles.cursus}>{user.cursus}</Text>}
        </View>

        <View style={styles.profileRight}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>
          {user.phone !== 'hidden' && user.phone && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{user.phone}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Wallet</Text>
            <Text style={styles.value}>{user.wallet} pts</Text>
          </View>
          {campus && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Campus</Text>
              <Text style={styles.value}>{campus.name}</Text>
            </View>
          )}
        </View>
      </View>

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
            dataLabelsPositionOffset={-0.5}
            hideAsterLines
          />
        </View>
      )}

      {projects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projects</Text>
          <View style={styles.filterButtons}>
            {(['all', 'finished', 'failed'] as const).map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterButton, projectFilter === filter && styles.filterButtonActive]}
                onPress={() => setProjectFilter(filter)}
              >
                <Text style={[styles.filterButtonText, projectFilter === filter && styles.filterButtonTextActive]}>
                  {filter === 'all' ? 'All' : filter === 'finished' ? 'Finished' : 'Failed'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <View key={project.id} style={styles.projectItem}>
                <Text style={styles.projectName}>{project.project.name}</Text>
                {project.final_mark !== null && (
                  <Text style={styles.projectMark}>Mark: {project.final_mark}</Text>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No projects in this category</Text>
          )}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 16,
  },
  profileLeft: { alignItems: 'center', width: 110 },
  profileRight: { flex: 1, justifyContent: 'center', gap: 6 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 8 },
  username: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginBottom: 2 },
  name: { fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 6 },
  levelIndicator: { width: '100%', marginTop: 6 },
  levelLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  levelText: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  levelNext: { fontSize: 11, color: '#007AFF' },
  levelBarBg: { height: 6, backgroundColor: '#e0e0e0', borderRadius: 3, overflow: 'hidden' },
  levelBarFill: { height: '100%', backgroundColor: '#007AFF', borderRadius: 3 },
  cursus: { fontSize: 13, color: '#666', marginTop: 4 },
  section: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#333' },
  infoRow: { flexDirection: 'column' },
  label: { fontSize: 11, color: '#999', fontWeight: '500', textTransform: 'uppercase' },
  value: { fontSize: 13, color: '#333' },
  filterButtons: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  filterButtonActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  filterButtonText: { fontSize: 13, color: '#666' },
  filterButtonTextActive: { color: '#fff', fontWeight: '600' },
  projectItem: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, marginBottom: 10 },
  projectName: { fontSize: 15, fontWeight: '600', color: '#333' },
  projectMark: { fontSize: 13, color: '#666', marginTop: 4 },
  emptyText: { textAlign: 'center', color: '#999', paddingVertical: 16 },
});
