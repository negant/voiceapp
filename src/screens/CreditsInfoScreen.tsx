import { Coins, Crown } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { Button } from '@/components/atoms/Button';
import { Screen } from '@/components';
import { resolvePremiumIncludedStartedMinutes } from '@/config/credits';
import { env } from '@/config/env';
import {
  LOCAL_MAX_AUDIO_DURATION_SEC,
  resolvePlanMaxDurationSec,
} from '@/constants/audioLimits';
import { useScreenTitle } from '@/hooks/useScreenTitle';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import type { RootStackScreenProps } from '@/navigation/types';
import { useCredits } from '@/providers/CreditsProvider';
import { formatCreditsBalance } from '@/utils/formatCreditsBalance';
import {
  calculateAiMinutesAffordableFromCredits,
  formatAiDurationMinutes,
  formatAiDurationSeconds,
  formatStartedMinutesAsHours,
  formatUsdPrice,
} from '@/utils/creditsEconomy';
import { formatDurationLimitLabel } from '@/utils/formatDurationLimit';

const SECTION_ICON_SIZE = 20;

function PlanFeatureList({ features }: { features: string[] }) {
  return (
    <View className="mt-3 gap-2">
      {features.map(feature => (
        <View key={feature} className="flex-row items-start gap-2">
          <Text className="text-sm font-semibold leading-5 text-amber-700 dark:text-amber-300">
            •
          </Text>
          <Text className="flex-1 text-sm leading-5 text-foreground-muted dark:text-foreground-muted-dark">
            {feature}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function CreditsInfoScreen(_props: RootStackScreenProps<'CreditsInfo'>) {
  const { t, locale } = useTranslation();
  const { isDark } = useTheme();
  const {
    balance,
    creditsPerStartedMinute,
    isPremium,
    setAccountPlan,
    refreshBalance,
  } = useCredits();
  useScreenTitle('nav.yourAccount');

  useFocusEffect(
    useCallback(() => {
      refreshBalance().catch(() => undefined);
    }, [refreshBalance]),
  );

  const premiumPriceUsd = env.premiumPriceUsd;
  const premiumCredits = env.premiumCredits;
  const premiumGratisCredits = env.premiumGratisCredits;
  const premiumIncludedMinutes = useMemo(
    () =>
      resolvePremiumIncludedStartedMinutes(
        premiumCredits,
        premiumGratisCredits,
      ),
    [premiumCredits, premiumGratisCredits],
  );

  const accentColor = isDark ? '#FCD34D' : '#D97706';
  const formattedBalance = formatCreditsBalance(balance, locale);
  const affordableMinutes = calculateAiMinutesAffordableFromCredits(
    balance,
    creditsPerStartedMinute,
  );
  const formattedAffordableMinutes = formatAiDurationMinutes(
    affordableMinutes,
    locale,
  );
  const formattedPremiumMinutes = formatAiDurationMinutes(
    premiumIncludedMinutes,
    locale,
  );
  const formattedPremiumHours = formatStartedMinutesAsHours(
    premiumIncludedMinutes,
    locale,
  );
  const formattedPremiumBase = formatAiDurationMinutes(premiumCredits, locale);
  const formattedPremiumBonus = formatAiDurationMinutes(
    premiumGratisCredits,
    locale,
  );
  const formattedPremiumBonusMinutes = formatAiDurationMinutes(
    premiumGratisCredits,
    locale,
  );
  const formattedPrice = formatUsdPrice(premiumPriceUsd, locale);
  const freeMaxDurationSec = resolvePlanMaxDurationSec('free');
  // Free plan: always seconds so short caps never render as "0 min".
  const freeMaxDurationLabel = t('common.durationLimitSeconds', {
    count: formatAiDurationSeconds(freeMaxDurationSec, locale),
  });
  const premiumMaxDurationLabel = formatDurationLimitLabel(
    LOCAL_MAX_AUDIO_DURATION_SEC,
    locale,
    t,
  );
  const showPremiumBonus = premiumGratisCredits > 0;

  const freePlanFeatures = useMemo(
    () => [
      t('credits.planFeatureWelcome'),
      t('credits.planFeatureFreeCreditsExpiry'),
      t('credits.planFeatureMaxFile', { maxDuration: freeMaxDurationLabel }),
      t('credits.planFeatureCustomBasicEffects'),
      t('credits.planFeatureOneCredit'),
    ],
    [freeMaxDurationLabel, t],
  );

  const premiumPackFeature = showPremiumBonus
    ? t('credits.planFeatureCreditsPack', {
        base: formattedPremiumBase,
        bonus: formattedPremiumBonus,
        minutes: formattedPremiumMinutes,
        hours: formattedPremiumHours,
      })
    : t('credits.planFeatureCreditsPackSimple', {
        minutes: formattedPremiumMinutes,
        hours: formattedPremiumHours,
      });

  const premiumPlanFeatures = useMemo(
    () => [
      ...(isPremium
        ? [
            t('credits.planFeatureCreditsLeft', {
              minutes: formattedAffordableMinutes,
            }),
          ]
        : [premiumPackFeature]),
      t('credits.planFeatureCreditsRenewMonthly'),
      t('credits.planFeatureMaxFile', { maxDuration: premiumMaxDurationLabel }),
      t('credits.planFeatureCombineEffects'),
      t('credits.planFeatureOneCredit'),
    ],
    [
      formattedAffordableMinutes,
      isPremium,
      premiumMaxDurationLabel,
      premiumPackFeature,
      t,
    ],
  );

  const handleBuyPremium = async () => {
    // Provider applies Premium pack via API (or local fallback) — do not add credits twice.
    await setAccountPlan('premium');
  };

  return (
    <Screen scrollable>
      <View className="mb-4 mt-2 rounded-2xl border border-amber-500/35 bg-surface p-4 dark:border-amber-400/40 dark:bg-surface-dark">
        <View className="mb-3 flex-row items-center gap-2">
          <Coins size={SECTION_ICON_SIZE} color={accentColor} />
          <Text className="text-lg font-semibold text-foreground dark:text-foreground-dark">
            {t('credits.balanceTitle')}
          </Text>
        </View>
        <Text className="text-3xl font-bold text-amber-700 dark:text-amber-300">
          {t('credits.balanceValue', { formatted: formattedBalance })}
        </Text>
        <Text className="mt-2 text-sm text-foreground-muted dark:text-foreground-muted-dark">
          {t('credits.balanceMinutes', {
            minutes: formattedAffordableMinutes,
          })}
        </Text>
      </View>

      <View className="mb-4 rounded-2xl border border-amber-500/35 bg-surface p-4 dark:border-amber-400/40 dark:bg-surface-dark">
        <View className="mb-3 flex-row items-center gap-2">
          <Crown size={SECTION_ICON_SIZE} color={accentColor} />
          <Text className="text-lg font-semibold text-foreground dark:text-foreground-dark">
            {t('credits.accountPlanTitle')}
          </Text>
        </View>
        <Text className="text-3xl font-bold text-amber-700 dark:text-amber-300">
          {isPremium
            ? t('credits.planNamePremium')
            : t('credits.planNameFree')}
        </Text>
        <PlanFeatureList
          features={isPremium ? premiumPlanFeatures : freePlanFeatures}
        />

        {!isPremium ? (
          <View className="mt-5 border-t border-amber-500/25 pt-5 dark:border-amber-400/30">
            <Text className="text-lg font-semibold text-foreground dark:text-foreground-dark">
              {t('credits.premiumUpgradeTitle')}
            </Text>
            {showPremiumBonus ? (
              <Text className="mt-1 text-sm font-semibold text-amber-700 dark:text-amber-300">
                {t('credits.premiumBonusHighlight', {
                  bonus: formattedPremiumBonus,
                  bonusMinutes: formattedPremiumBonusMinutes,
                })}
              </Text>
            ) : null}
            <Text className="mt-1 text-3xl font-bold text-amber-700 dark:text-amber-300">
              {t('credits.premiumPrice', { price: formattedPrice })}
            </Text>
            <PlanFeatureList features={premiumPlanFeatures} />
            <Button
              title={t('credits.buyPremium')}
              onPress={() => {
                handleBuyPremium().catch(() => undefined);
              }}
              className="mt-4 min-h-12"
            />
          </View>
        ) : null}
      </View>

      <View className="mb-4 rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
        <Text className="mb-2 text-lg font-semibold text-foreground dark:text-foreground-dark">
          {t('credits.billingTitle')}
        </Text>
        <Text className="text-sm leading-6 text-foreground-muted dark:text-foreground-muted-dark">
          {t('credits.billingBody')}
        </Text>
      </View>
    </Screen>
  );
}
