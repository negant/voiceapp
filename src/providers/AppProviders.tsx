import type { ReactNode } from 'react';
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import { DatabaseProvider } from '@/providers/DatabaseProvider';
import { AppAlertProvider } from '@/providers/AppAlertProvider';
import { AiServiceStatusProvider } from '@/providers/AiServiceStatusProvider';
import { CreditsProvider } from '@/providers/CreditsProvider';
import { LocaleProvider } from '@/providers/LocaleProvider';
import { ProcessedRecordingsCountProvider } from '@/providers/ProcessedRecordingsCountProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <DatabaseProvider>
        <LocaleProvider>
          <ThemeProvider>
            <AppAlertProvider>
              <CreditsProvider>
                <AiServiceStatusProvider>
                  <ProcessedRecordingsCountProvider>
                    {children}
                  </ProcessedRecordingsCountProvider>
                </AiServiceStatusProvider>
              </CreditsProvider>
            </AppAlertProvider>
          </ThemeProvider>
        </LocaleProvider>
      </DatabaseProvider>
    </SafeAreaProvider>
  );
}
