import React from 'react';

import {SafeAreaProvider} from 'react-native-safe-area-context';
import Navigator from './navigators/Navigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <Navigator />
    </SafeAreaProvider>
  );
}
