import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const slides = [
  {
    title: 'Bienvenue sur ConsentApp',
    description: 'Gérez vos consentements en toute simplicité et sécurité.',
    image: 'https://img.icons8.com/color/96/consent.png',
  },
  {
    title: 'Créez et suivez vos demandes',
    description: 'Envoyez, recevez et archivez vos consentements avec vos contacts.',
    image: 'https://img.icons8.com/color/96/contract-job.png',
  },
  {
    title: 'Sécurité et confidentialité',
    description: 'Toutes vos données sont protégées et chiffrées.',
    image: 'https://img.icons8.com/color/96/lock--v1.png',
  },
];

export default function OnboardingScreen({ navigation }) {
  const [current, setCurrent] = useState(0);
  const { completeOnboarding } = useAuth();

  const nextSlide = async () => {
    if (current < slides.length - 1) setCurrent(current + 1);
    else {
      await completeOnboarding();
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: slides[current].image }} style={styles.image} />
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
  image: {
    width: width * 0.5,
    height: width * 0.5,
    marginBottom: 32,
    resizeMode: 'contain',
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
