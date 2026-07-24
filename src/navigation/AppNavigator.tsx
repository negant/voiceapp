import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View } from 'react-native';

import { AppHeaderTitle, HeaderActions } from '@/components';
import { useTheme } from '@/hooks/useTheme';
import {
  darkNavigationTheme,
  lightNavigationTheme,
} from '@/navigation/navigationTheme';
import type { RootStackParamList } from '@/navigation/types';
import {
  CreditsInfoScreen,
  DetailsScreen,
  GuideScreen,
  HomeScreen,
  LanguageSettingsScreen,
  SettingsScreen,
  YourRecordingsScreen,
} from '@/screens';

const Stack = createNativeStackNavigator<RootStackParamList>();

function HomeHeaderActions() {
  return (
    <View className="h-11 justify-center">
      <HeaderActions />
    </View>
  );
}

function HomeHeaderTitle() {
  return (
    <View className="h-11 justify-center">
      <AppHeaderTitle />
    </View>
  );
}

export function AppNavigator() {
  const { isDark } = useTheme();

  return (
    <NavigationContainer theme={isDark ? darkNavigationTheme : lightNavigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShadowVisible: false,
        }}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerTitle: HomeHeaderTitle,
            headerTitleAlign: 'left',
            headerRight: HomeHeaderActions,
            headerBackVisible: false,
          }}
        />
        <Stack.Screen name="Guide" component={GuideScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} />
        <Stack.Screen name="YourRecordings" component={YourRecordingsScreen} />
        <Stack.Screen name="CreditsInfo" component={CreditsInfoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
