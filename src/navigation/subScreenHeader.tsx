import { View } from 'react-native';

import { HeaderBackButton } from '@/components/molecules/HeaderBackButton';
import { ScreenHeaderTitle } from '@/components/molecules/ScreenHeaderTitle';

export function SubScreenHeaderBack() {
  return (
    <View className="h-11 justify-center">
      <HeaderBackButton />
    </View>
  );
}

export function createSubScreenHeaderTitle(title: string) {
  return function SubScreenHeaderTitleSlot() {
    return (
      <View className="h-11 flex-1 justify-center pr-4">
        <ScreenHeaderTitle title={title} />
      </View>
    );
  };
}
