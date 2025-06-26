// ✅ Fichier : app-frontend/screens/NotificationsScreen.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.empty}>Les notifications sont désactivées.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  empty: { textAlign: 'center', marginTop: 40, color: '#64748b' },
});
