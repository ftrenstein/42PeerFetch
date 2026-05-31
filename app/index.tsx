import { View, Text, StyleSheet, Button } from 'react-native';
import useAuth from '../hooks/useAuth';

export default function SearchScreen() {
  const { promptAsync } = useAuth();

  return (
    <View style={styles.container}>
      <Text>Screen 1 - Login </Text>
      <Button title="Login with 42 API" onPress={() => promptAsync()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
