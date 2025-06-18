import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants';
import zxcvbn from 'zxcvbn';

interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function PasswordInput({ value, onChangeText, placeholder = 'Mot de passe' }: PasswordInputProps) {
  const [secure, setSecure] = useState(true);
  const strength = zxcvbn(value || '');
  const score = strength.score;
  const strengthLabel = ['Très faible', 'Faible', 'Moyen', 'Bon', 'Excellent'][score];
  const strengthColor = ['#ff3b30', '#ff9500', '#ffcc00', '#34c759', COLORS.primary][score];

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secure}
      />
      <TouchableOpacity onPress={() => setSecure((s) => !s)} style={styles.iconContainer}>
        <Ionicons name={secure ? 'eye-off' : 'eye'} size={22} color={COLORS.text} />
      </TouchableOpacity>
      {value.length > 0 && (
        <View style={styles.strengthWrapper}>
          <View style={[styles.strengthBar, { backgroundColor: strengthColor, width: `${(score + 1) * 20}%` }]} />
          <Text style={[styles.strengthText, { color: strengthColor }]}>{strengthLabel}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: SIZES.padding,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: SIZES.radius,
    fontSize: SIZES.fontSmall,
    fontFamily: 'Poppins-Regular',
    paddingRight: 40,
  },
  iconContainer: {
    position: 'absolute',
    right: 10,
    top: 12,
  },
  strengthWrapper: {
    marginTop: 6,
  },
  strengthBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  strengthText: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
});
