import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

export default function BottomTabs() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.bar}>
      <TouchableOpacity
        style={styles.tab}
        onPress={() => router.replace('/profile')}
      >
        <Text style={styles.icon}>👤</Text>
        <Text style={[styles.label, pathname === '/profile' && styles.active]}>Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tab}
        onPress={() => router.replace('/search')}
      >
        <Text style={styles.icon}>🔍</Text>
        <Text style={[styles.label, pathname === '/search' && styles.active]}>Search</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    gap: 2,
  },
  icon: { fontSize: 20 },
  label: { fontSize: 11, color: '#8E8E93' },
  active: { color: '#007AFF', fontWeight: '600' },
});
