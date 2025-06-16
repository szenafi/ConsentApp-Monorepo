import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';

export function showConsentToast(message: string, type: 'info' | 'success' | 'error' = 'info') {
  Toast.show({ type, text1: message, position: 'bottom' });
}

export default function ConsentToast() {
  return <Toast config={toastConfig} />;
}

const toastConfig = {
  info: ({ text1 }: any) => (
    <View style={[styles.base, styles.info]}>
      <Text style={styles.text}>{text1}</Text>
    </View>
  ),
  success: ({ text1 }: any) => (
    <View style={[styles.base, styles.success]}>
      <Text style={styles.text}>{text1}</Text>
    </View>
  ),
  error: ({ text1 }: any) => (
    <View style={[styles.base, styles.error]}>
      <Text style={styles.text}>{text1}</Text>
    </View>
  ),
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  text: { color: '#222', fontSize: 15, fontWeight: '600' },
  info: { backgroundColor: '#e0e7ff' },
  success: { backgroundColor: '#d1fae5' },
  error: { backgroundColor: '#fee2e2' },
});
