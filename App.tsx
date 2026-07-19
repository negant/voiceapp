import './global.css';

import { useState } from 'react';
import { StatusBar } from 'react-native';

import { LaunchScreen } from '@/components/organisms/LaunchScreen';
import { useDatabase } from '@/hooks/useDatabase';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { AppNavigator } from '@/navigation/AppNavigator';
import { AppProviders } from '@/providers/AppProviders';

function AppStatusBar({ isDark }: { isDark: boolean }) {
  return (
    <StatusBar
      barStyle={isDark ? 'light-content' : 'dark-content'}
      backgroundColor="transparent"
      translucent
    />
  );
}

function AppContent() {
  const { isReady, isLoading } = useDatabase();
  const { isDark, isHydrated: isThemeHydrated } = useTheme();
  const { isHydrated: isLocaleHydrated } = useTranslation();
  const [launchComplete, setLaunchComplete] = useState(false);

  const isAppReady =
    !isLoading && isReady && isThemeHydrated && isLocaleHydrated;

  if (!launchComplete) {
    return (
      <>
        <AppStatusBar isDark={isDark} />
        <LaunchScreen
          isAppReady={isAppReady}
          onFinish={() => setLaunchComplete(true)}
        />
      </>
    );
  }

  return (
    <>
      <AppStatusBar isDark={isDark} />
      <AppNavigator />
    </>
  );
}

function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}

export default App;
