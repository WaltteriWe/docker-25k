import {createRef} from 'react';
import {NavigationContainerRef} from '@react-navigation/native';

// Create a navigation reference that can be accessed from any component
export const navigationRef = createRef<NavigationContainerRef<any>>();

// Add guard clauses to prevent errors when navigationRef isn't ready
export function resetToLogin() {
  if (navigationRef.current) {
    navigationRef.current.reset({
      index: 0,
      routes: [{name: 'Login'}],
    });
  } else {
    console.error('Navigation reference not ready for resetToLogin');
  }
}

export function resetToMain() {
  if (navigationRef.current) {
    navigationRef.current.reset({
      index: 0,
      routes: [{name: 'Main'}],
    });
  } else {
    console.error('Navigation reference not ready for resetToMain');
  }
}

export function navigateTo(name: string, params?: object) {
  if (navigationRef.current) {
    navigationRef.current.navigate(name, params);
  } else {
    console.error(`Navigation reference not ready for navigate to ${name}`);
  }
}
