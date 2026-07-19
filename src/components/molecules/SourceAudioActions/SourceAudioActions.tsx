import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { FileAudio, Mic } from 'lucide-react-native';

import type { SourceAudioActionsProps } from '@/components/molecules/SourceAudioActions/SourceAudioActions.types';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';

export function SourceAudioActions({
  onLoadFile,
  onRecord,
  loadLoading = false,
  loadDisabled = false,
  recordDisabled = false,
  className,
}: SourceAudioActionsProps) {
  const { t } = useTranslation();
  const loadBlocked = loadDisabled || loadLoading;
  const recordBlocked = recordDisabled;

  const tileClassName =
    'min-h-[124px] flex-1 rounded-2xl border px-3 py-5 active:opacity-90 border-brand bg-brand dark:border-brand-dark dark:bg-brand-dark';

  return (
    <View className={cn('flex-row gap-3', className)}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('voiceStudio.loadFile')}
        disabled={loadBlocked}
        onPress={onLoadFile}
        className={cn(tileClassName, loadBlocked && 'opacity-50')}>
        <View className="flex-1 items-center justify-center">
          {loadLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <FileAudio size={26} color="#FFFFFF" />
              </View>
              <Text className="text-center text-base font-bold text-white">
                {t('voiceStudio.loadFileActionTitle')}
              </Text>
              <Text className="mt-1 text-center text-xs leading-4 text-white/85">
                {t('voiceStudio.loadFileActionHint')}
              </Text>
            </>
          )}
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('voiceStudio.recordAudio')}
        disabled={recordBlocked}
        onPress={onRecord}
        className={cn(tileClassName, recordBlocked && 'opacity-50')}>
        <View className="flex-1 items-center justify-center">
          <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-white/20">
            <Mic size={26} color="#FFFFFF" />
          </View>
          <Text className="text-center text-base font-bold text-white">
            {t('voiceStudio.recordAudioActionTitle')}
          </Text>
          <Text className="mt-1 text-center text-xs leading-4 text-white/85">
            {t('voiceStudio.recordAudioActionHint')}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
