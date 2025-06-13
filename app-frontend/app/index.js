import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';

export default function Index() {
  // On vérifie à la fois l'objet utilisateur et un éventuel token stocké
  // pour rediriger correctement les utilisateurs déjà authentifiés.

  const { user, loading, onboardingDone, authToken } = useAuth();
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);

  // 1. On passe hasMounted à true juste après le mounting
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // 2. Une fois monté et loading terminé, on redirige
  useEffect(() => {
    if (hasMounted && !loading) {
      if (!onboardingDone) {
        router.replace('/onboarding');
      } else if (user || authToken) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [hasMounted, loading, user, authToken, onboardingDone]);

  return null;
}
