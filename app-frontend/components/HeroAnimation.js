import React from 'react';
import SafeLottieView from './SafeLottieView';
import { View, StyleSheet } from 'react-native';

export default function HeroAnimation() {
  let heroAnim;
  try {
    heroAnim = require('../assets/animations/hero.json');
  } catch {
    heroAnim = null;
  }

  return (
    <View style={styles.container}>
      <SafeLottieView
        source={heroAnim}
        autoPlay
        loop
        style={styles.animation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 12,
  },
  animation: {
    width: 120,
    height: 120,
  },
});
