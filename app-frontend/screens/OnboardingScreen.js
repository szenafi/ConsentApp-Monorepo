import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import SafeLottieView from '../components/SafeLottieView';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

let heroAnim;
let confettiAnim;
try {
  heroAnim = require('../assets/animations/hero.json');
} catch {
  heroAnim = null;
}
try {
  confettiAnim = require('../assets/animations/confetti.json');
} catch {
  confettiAnim = null;
}

const slides = [
  {
    title: 'Créez votre demande',
    description: 'Sélectionnez votre partenaire et définissez les conditions.',
    lottie: heroAnim,
  },
  {
    title: 'Validez avec la biométrie',
    description: 'Confirmez votre identité grâce à votre empreinte digitale.',
    icon: 'finger-print',
  },
  {
    title: 'Consentement confirmé',
    description: 'Recevez une preuve sécurisée et notifiez votre partenaire.',
    lottie: confettiAnim,
  },
];

export default function OnboardingScreen() {
  const [current, setCurrent] = useState(0);
  const router = useRouter();
  const { completeOnboarding, authToken, user } = useAuth();

  const renderIllustration = () => {
    const slide = slides[current];
    if (slide.lottie) {
      return (
        <SafeLottieView
          source={slide.lottie}
          autoPlay
          loop
          style={styles.lottie}
          fallback={
            <Ionicons
              name="image-outline"
              size={width * 0.5}
              color="#3B82F6"
              style={styles.icon}
            />
          }
        />
      );
    }
    if (slide.icon) {
      return <Ionicons name={slide.icon} size={width * 0.5} color="#3B82F6" style={styles.icon} />;
    }
    return null;
  };

  const nextSlide = async () => {
    if (current < slides.length - 1) setCurrent(current + 1);
    else {
      await completeOnboarding();
      if (authToken || user) router.replace('/dashboard');
      else router.replace('/login');
    }
  };

  return (
    <View style={styles.container}>
      {renderIllustration()}
      <Text style={styles.title}>{slides[current].title}</Text>
      <Text style={styles.description}>{slides[current].description}</Text>
      <TouchableOpacity style={styles.button} onPress={nextSlide}>
        <Text style={styles.buttonText}>{current < slides.length - 1 ? 'Suivant' : 'Commencer'}</Text>
      </TouchableOpacity>
      <View style={styles.dotsContainer}>
        {slides.map((_, idx) => (
          <View key={idx} style={[styles.dot, idx === current && styles.activeDot]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 24,
  },
  lottie: {
    width: width * 0.6,
    height: width * 0.6,
    marginBottom: 32,
  },
  icon: {
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 36,
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 24,
    marginBottom: 32,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 6,
  },
  activeDot: {
    backgroundColor: '#3B82F6',
  },
});
