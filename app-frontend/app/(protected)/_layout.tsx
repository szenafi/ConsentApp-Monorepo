// app/(protected)/_layout.tsx
import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedLayout() {
  const { user, loading, onboardingDone } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    // si onboarding non fait et on n’est pas sur l’écran onboarding
    if (!onboardingDone && segments[0] !== 'onboarding') {
      router.replace('/onboarding');
    }
    // si pas de user
    else if (!user) {
      router.replace('/login');
    }
  }, [user, loading, onboardingDone, segments]);

  // jusqu’à ce que loading soit false et user non-null, on ne montre rien
  if (loading || !user) return null;
  return <Slot />;
}
