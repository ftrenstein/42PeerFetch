import { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';

export default function CallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.code) {
      console.log('Callback received with code:', params.code);
      setTimeout(() => {
        router.replace('/profile');
      }, 1000);
    }
  }, [params.code]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Обработка авторизации...</Text>
    </View>
  );
}
