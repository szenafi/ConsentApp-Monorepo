import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SIZES } from '../../constants';

interface DateInputProps {
  value?: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
}

export default function DateInput({ value, onChange, placeholder = 'Date de naissance' }: DateInputProps) {
  const [show, setShow] = useState(false);

  const handleChange = (_: any, selected?: Date) => {
    setShow(false);
    if (selected) {
      onChange(selected);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.input} onPress={() => setShow(true)}>
        <Text style={styles.text}>{value ? value.toLocaleDateString() : placeholder}</Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          onChange={handleChange}
        />
      )}
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
