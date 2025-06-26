import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants';

const TYPES = [
  { key: 'default', label: 'Général', emoji: '🤝' },
  { key: 'medical', label: 'Médical', emoji: '🩺' },
  { key: 'photo', label: 'Photo', emoji: '📸' },
  { key: 'sortie', label: 'Sortie', emoji: '🎉' },
  { key: 'autre', label: 'Autre', emoji: '✨' },
];

export default function ConsentTypeSelector({ value, onSelect, emoji, onEmojiChange, onNext, onBack }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Type de consentement</Text>
      <View style={styles.typesRow}>
        {TYPES.map(type => (
          <TouchableOpacity
            key={type.key}
            style={[styles.typeButton, value === type.key && styles.selected]}
            onPress={() => {
              onSelect(type.key);
              onEmojiChange(type.emoji);
            }}
          >
            <Text style={styles.emoji}>{type.emoji}</Text>
            <Text style={styles.typeLabel}>{type.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.navRow}>
        <TouchableOpacity onPress={onBack} style={styles.navButton}><Text style={styles.navText}>Retour</Text></TouchableOpacity>
        <TouchableOpacity onPress={onNext} style={styles.navButton}><Text style={styles.navText}>Suivant</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.padding * 2,
  },
  label: {
    fontFamily: 'Poppins-Bold',
    fontSize: SIZES.fontMedium,
    color: COLORS.text,
    marginBottom: 10,
  },
  typesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  typeButton: {
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: COLORS.primary,
    backgroundColor: '#e0e7ff',
  },
  emoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 13,
    color: '#22223b',
    fontWeight: 'bold',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
  },
  navText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
