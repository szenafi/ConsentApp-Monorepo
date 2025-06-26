import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Text,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { ImagePickerAsset } from 'expo-image-picker';
import { COLORS, SIZES } from '../../constants';

interface PhotoUploaderProps {
  value?: ImagePickerAsset | null;
  onChange: (asset: ImagePickerAsset | null) => void;
}

export default function PhotoUploader({ value, onChange }: PhotoUploaderProps) {
  const [previewUri, setPreviewUri] = useState<string | null>(value?.uri ?? null);

  useEffect(() => {
    setPreviewUri(value?.uri ?? null);
  }, [value]);

  const pick = async (source: 'camera' | 'library') => {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) return;

    const pickerOptions: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    };

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(pickerOptions)
        : await ImagePicker.launchImageLibraryAsync(pickerOptions);

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const processed = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 600 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      const finalAsset: ImagePickerAsset = {
        ...asset,
        uri: processed.uri,
        fileName: asset.fileName || 'photo.jpg',
        type: 'image',
      };

      setPreviewUri(finalAsset.uri);
      onChange(finalAsset);
    }
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
        {previewUri ? (
          <Image source={{ uri: previewUri }} style={styles.image} />
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
  placeholder: {
    color: COLORS.text,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
});
