import { useLayoutEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

import { SubScreenHeader } from '@/components/molecules/SubScreenHeader';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/i18n/types';

/**
 * Sub-screens replace the native stack header with a JS header.
 * Native headerLeft/headerRight back controls break on iOS 26 Liquid Glass
 * (UI shows a non-functional "…" instead of a working chevron).
 */
export function useScreenTitle(titleKey: TranslationKey) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const title = t(titleKey);

  useLayoutEffect(() => {
    navigation.setOptions({
      title,
      header: () => <SubScreenHeader title={title} />,
    });
  }, [navigation, title]);
}
