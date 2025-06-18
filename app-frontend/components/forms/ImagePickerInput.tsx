import React, { useState } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SIZES } from '../../constants';

interface ImagePickerInputProps {
  value?: string | null;
  onChange: (uri: string) => void;
}

export default function ImagePickerInput({ value, onChange }: ImagePickerInputProps) {
  const [imageUri, setImageUri] = useState<string | null>(value ?? null);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      onChange(uri);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.preview} onPress={pickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text style={styles.placeholder}>Choisir une photo</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  preview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: 120,
    height: 120,
  },
  placeholder: { color: COLORS.text },
});
