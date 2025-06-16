// app/_layout.tsx
// @ts-ignore
import { AuthProvider } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';
import { Slot } from 'expo-router';
import ConsentToast from '../components/notifications/ConsentToast';

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Slot />
        <ConsentToast />
      </NotificationProvider>
    </AuthProvider>
  );
}
