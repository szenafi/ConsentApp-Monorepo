// ✅ Fichier 1 : DatePickerInput.tsx
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { COLORS, SIZES } from '../../constants';

interface DatePickerInputProps {
  value?: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
}

export default function DatePickerInput({ value, onChange, placeholder = 'Date de naissance' }: DatePickerInputProps) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.input} onPress={() => setOpen(true)}>
        <Text style={styles.text}>{value ? value.toLocaleDateString() : placeholder}</Text>
      </TouchableOpacity>
      <DatePicker
        modal
        open={open}
        date={value || new Date()}
        mode="date"
        maximumDate={new Date()}
        onConfirm={(date) => {
          setOpen(false);
          onChange(date);
        }}
        onCancel={() => setOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.padding,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  text: {
    fontFamily: 'Poppins-Regular',
    fontSize: SIZES.fontSmall,
    color: COLORS.text,
  },
});