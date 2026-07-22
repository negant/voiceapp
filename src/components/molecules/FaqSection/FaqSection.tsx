import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { FaqSectionProps } from '@/components/molecules/FaqSection/FaqSection.types';
import {
  LOCAL_MAX_AUDIO_DURATION_SEC,
  resolvePlanMaxDurationSec,
} from '@/constants/audioLimits';
import { useSupportedFormatsLabel } from '@/hooks/useSupportedFormatsLabel';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useCredits } from '@/providers/CreditsProvider';
import { cn } from '@/lib/cn';
import { formatAiDurationSeconds } from '@/utils/creditsEconomy';
import { formatDurationLimitLabel } from '@/utils/formatDurationLimit';

const FAQ_KEYS = [
  'faq.q1',
  'faq.q2',
  'faq.q3',
  'faq.q4',
  'faq.q5',
  'faq.q6',
  'faq.q7',
  'faq.q8',
  'faq.q9',
  'faq.q10',
] as const;

export function FaqSection({ className }: FaqSectionProps) {
  const { t, locale } = useTranslation();
  const { isDark } = useTheme();
  const supportedFormatsLabel = useSupportedFormatsLabel();
  const { accountPlan } = useCredits();
  const freeMaxDuration = t('common.durationLimitSeconds', {
    count: formatAiDurationSeconds(
      resolvePlanMaxDurationSec('free'),
      locale,
    ),
  });
  const premiumMaxDuration = formatDurationLimitLabel(
    LOCAL_MAX_AUDIO_DURATION_SEC,
    locale,
    t,
  );
  const planMaxDuration =
    accountPlan === 'free'
      ? freeMaxDuration
      : formatDurationLimitLabel(
          resolvePlanMaxDurationSec(accountPlan),
          locale,
          t,
        );
  const [expandedKey, setExpandedKey] = useState<string | null>(FAQ_KEYS[0]);
  const iconColor = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <>
      <Text
        className={cn(
          'mb-2 text-lg font-semibold text-foreground dark:text-foreground-dark',
          className,
        )}>
        {t('guide.faqTitle')}
      </Text>
      <Text className="mb-4 text-sm leading-6 text-foreground-muted dark:text-foreground-muted-dark">
        {t('faq.intro')}
      </Text>

      {FAQ_KEYS.map(key => {
        const expanded = expandedKey === key;
        const title = t(`${key}Title`);
        return (
          <View
            key={key}
            className="mb-3 overflow-hidden rounded-2xl border border-border bg-surface dark:border-border-dark dark:bg-surface-dark">
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              accessibilityLabel={
                expanded
                  ? t('faq.collapseItem', { question: title })
                  : t('faq.expandItem', { question: title })
              }
              onPress={() => setExpandedKey(current => (current === key ? null : key))}
              className="flex-row items-center justify-between px-4 py-4 active:opacity-80">
              <Text className="mr-3 flex-1 text-base font-semibold text-foreground dark:text-foreground-dark">
                {title}
              </Text>
              {expanded ? (
                <ChevronUp size={20} color={iconColor} />
              ) : (
                <ChevronDown size={20} color={iconColor} />
              )}
            </Pressable>
            {expanded ? (
              <Text className="px-4 pb-4 text-sm leading-6 text-foreground-muted dark:text-foreground-muted-dark">
                {t(
                  `${key}Answer`,
                  key === 'faq.q2'
                    ? { formats: supportedFormatsLabel }
                    : key === 'faq.q7'
                      ? {
                          freeMaxDuration: freeMaxDuration,
                          premiumMaxDuration: premiumMaxDuration,
                          planMaxDuration: planMaxDuration,
                        }
                      : key === 'faq.q3'
                        ? {
                            freeMaxDuration: freeMaxDuration,
                            premiumMaxDuration: premiumMaxDuration,
                          }
                        : undefined,
                )}
              </Text>
            ) : null}
          </View>
        );
      })}
    </>
  );
}
