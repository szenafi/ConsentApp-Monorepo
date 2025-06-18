import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { COLORS } from '../../constants';

export default function ConsentToast({ message, onHide }) {
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.delay(3500),
      Animated.timing(slideAnim, { toValue: 100, duration: 300, useNativeDriver: true }),
    ]).start(() => onHide && onHide());
  }, [slideAnim, onHide]);

  return (
    <Animated.View style={[styles.toast, { transform: [{ translateY: slideAnim }] }] }>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  text: { color: COLORS.text, textAlign: 'center' },
});
