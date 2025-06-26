import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_AVATAR } from '../constants';

export default function ProfileScreen() {
  const { logout, user } = useAuth();

  return (
    <View style={styles.container}>
      <Image source={{ uri: user?.photoUrl || DEFAULT_AVATAR }} style={styles.avatar} />
      <Text style={styles.name}>{user?.firstName || user?.email || 'Profil'}</Text>
      <Text style={styles.email}>{user?.email || ''}</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Modifier le profil</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={logout}>
        <Text style={styles.buttonText}>Déconnexion</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
  },
});
