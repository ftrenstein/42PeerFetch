import { View, ActivityIndicator } from 'react-native';

export default function CallbackScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}
