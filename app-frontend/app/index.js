// app/index.js
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);

  // 1. On passe hasMounted à true juste après le mounting
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // 2. Une fois monté et loading terminé, on redirige
  useEffect(() => {
    if (hasMounted && !loading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [hasMounted, loading, user]);

  return null;
}
