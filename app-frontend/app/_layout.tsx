// app/_layout.tsx
// @ts-ignore
import { AuthProvider } from '../context/AuthContext';
import { Slot } from 'expo-router';
import ConsentToast from '../components/notifications/ConsentToast';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
      <ConsentToast />
    </AuthProvider>
  );
}
