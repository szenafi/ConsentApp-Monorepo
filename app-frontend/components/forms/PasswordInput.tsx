import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants';

interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function PasswordInput({ value, onChangeText, placeholder = 'Mot de passe' }: PasswordInputProps) {
  const [secure, setSecure] = useState(true);
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
});
