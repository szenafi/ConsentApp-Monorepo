import React, { useState } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Text, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { COLORS, SIZES } from '../../constants';

interface ImagePickerInputProps {
  value?: string | null;
  onChange: (uri: string) => void;
}

export default function ImagePickerInput({ value, onChange }: ImagePickerInputProps) {
  const [imageUri, setImageUri] = useState<string | null>(value ?? null);

  const handlePress = () => {
    Alert.alert('Photo de profil', 'Sélectionner une source', [
      { text: 'Caméra', onPress: pickCamera },
      { text: 'Galerie', onPress: pickLibrary },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const pickLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      // Utilise la valeur compatible avec toutes les versions d'Expo
      mediaTypes: ImagePicker.MediaTypeOptions.Images,

      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      const uri = await processImage(result.assets[0].uri);
      setImageUri(uri);
      onChange(uri);
    }
  };

  const pickCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,

      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      const uri = await processImage(result.assets[0].uri);
      setImageUri(uri);
      onChange(uri);
    }
  };

  const processImage = async (uri: string): Promise<string> => {
    const manip = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 600 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manip.uri;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.preview} onPress={handlePress}>
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

