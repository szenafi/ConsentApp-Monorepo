// app/_layout.tsx
// @ts-ignore
import { AuthProvider } from '../context/AuthContext';
import { Slot } from 'expo-router';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
