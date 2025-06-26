import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants';

const SUGGESTIONS = [
  'Je consens à…',
  'Avec plaisir pour…',
  'Je donne mon accord pour…',
  'Je confirme que…',
];

export default function MessageInput({ value, onChange, onNext, onBack }) {
  const [showSuggestions, setShowSuggestions] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Message personnalisé</Text>
      {showSuggestions && (
        <View style={styles.suggestionsRow}>
          {SUGGESTIONS.map((s, idx) => (
            <TouchableOpacity key={idx} style={styles.suggestion} onPress={() => { onChange(s); setShowSuggestions(false); }}>
              <Text style={styles.suggestionText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <TextInput
        style={styles.input}
        placeholder="Rédige ton message…"
        value={value}
        onChangeText={onChange}
        multiline
        numberOfLines={4}
        onFocus={() => setShowSuggestions(false)}
      />
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
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  suggestion: {
    backgroundColor: '#e0e7ff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  suggestionText: {
    color: COLORS.primary,
    fontSize: 13,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: SIZES.radius,
    fontFamily: 'Poppins-Regular',
    fontSize: SIZES.fontSmall,
    marginBottom: 12,
    minHeight: 80,
    textAlignVertical: 'top',
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
