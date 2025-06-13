import React from 'react';
import LottieView from 'lottie-react-native';
import { View, StyleSheet } from 'react-native';

export default function HeroAnimation() {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/animations/hero.json')}
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
