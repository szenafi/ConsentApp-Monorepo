import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Platform, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { COLORS, SIZES } from '../../constants';

interface DatePickerInputProps {
  value?: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
}

export default function DatePickerInput({ value, onChange, placeholder = 'Date de naissance' }: DatePickerInputProps) {
  const [show, setShow] = useState(false);

  const onChangeInternal = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate);
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
          display="default"
          onChange={onChangeInternal}
          maximumDate={new Date()}
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
