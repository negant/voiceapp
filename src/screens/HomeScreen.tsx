import { VoiceStudioPanel, Screen } from '@/components';
import type { RootStackScreenProps } from '@/navigation/types';

export function HomeScreen(_props: RootStackScreenProps<'Home'>) {
  return (
    <Screen padded={false} className="flex-1">
      <VoiceStudioPanel className="flex-1" />
    </Screen>
  );
}
