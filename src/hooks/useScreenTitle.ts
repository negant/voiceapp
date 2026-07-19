import { useLayoutEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/i18n/types';
import {
  createSubScreenHeaderTitle,
  SubScreenHeaderBack,
} from '@/navigation/subScreenHeader';

export function useScreenTitle(titleKey: TranslationKey) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const title = t(titleKey);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackVisible: false,
      headerTitle: '',
      headerTitleAlign: 'left',
      headerLeftContainerStyle: { flex: 1 },
      headerLeft: createSubScreenHeaderTitle(title),
      headerRight: SubScreenHeaderBack,
    });
  }, [navigation, title]);
}
