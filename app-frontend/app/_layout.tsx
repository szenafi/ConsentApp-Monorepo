// app/_layout.tsx
// @ts-ignore
import { AuthProvider } from '../context/AuthContext';
import { NotificationSettingsProvider } from '../context/NotificationSettingsContext';
import { ConsentNotificationProvider } from '../hooks/useConsentNotifications';
import ConsentStatusWatcher from '../hooks/useConsentStatusWatcher';
import { Slot } from 'expo-router';

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationSettingsProvider>
        <ConsentNotificationProvider>
          <ConsentStatusWatcher>
            <Slot />
          </ConsentStatusWatcher>
        </ConsentNotificationProvider>
      </NotificationSettingsProvider>
    </AuthProvider>
  );
}
