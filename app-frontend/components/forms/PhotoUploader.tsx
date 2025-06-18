import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Text, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { COLORS, SIZES } from '../../constants';

interface PhotoUploaderProps {
  value?: string | null;
  onChange: (uri: string) => void;
}

export default function PhotoUploader({ value, onChange }: PhotoUploaderProps) {
  const [imageUri, setImageUri] = useState<string | null>(value ?? null);

  // keep local preview in sync when parent resets the value
  useEffect(() => {
    setImageUri(value ?? null);
  }, [value]);

  const pick = async (source: 'camera' | 'library') => {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const pickerOptions = {
      mediaTypes:
        // Expo SDK 54 renamed MediaTypeOptions to MediaType
        (ImagePicker as any).MediaType?.Images ??
        ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1] as [number, number],
      quality: 0.8,
    };
    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(pickerOptions)
        : await ImagePicker.launchImageLibraryAsync(pickerOptions);

    if (!result.canceled) {
      const uri = await processImage(result.assets[0].uri);
      setImageUri(uri);
      onChange(uri);
    }
  };

  const processImage = async (uri: string): Promise<string> => {
    const manip = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 600 } }], {
      compress: 0.8,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    return manip.uri;
  };

  const handlePress = () => {
    Alert.alert('Photo de profil', 'Sélectionner une source', [
      { text: 'Caméra', onPress: () => pick('camera') },
      { text: 'Galerie', onPress: () => pick('library') },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.preview} onPress={handlePress}>
        {imageUri ? <Image source={{ uri: imageUri }} style={styles.image} /> : <Text style={styles.placeholder}>Choisir une photo</Text>}
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
