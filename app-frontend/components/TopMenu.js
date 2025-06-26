import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants';

export default function TopMenu() {
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <View style={styles.container} pointerEvents="box-none">
      <TouchableOpacity style={styles.iconBtn} onPress={() => setVisible(true)}>
        <Ionicons name="person-circle-outline" size={36} color={COLORS.primary} />
      </TouchableOpacity>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity style={styles.overlay} onPress={() => setVisible(false)} activeOpacity={1} />
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem} onPress={() => { setVisible(false); router.push('/profile'); }}>
            <Ionicons name="person-outline" size={22} color={COLORS.primary} />
            <Text style={styles.menuText}>Profil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => { setVisible(false); router.push('/notifications'); }}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.primary} />
            <Text style={styles.menuText}>Notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => { setVisible(false); logout(); router.replace('/login'); }}>
            <Ionicons name="log-out-outline" size={22} color={COLORS.danger || '#FF3B30'} />
            <Text style={[styles.menuText, { color: COLORS.danger || '#FF3B30' }]}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 36,
    right: 24,
    zIndex: 200,
  },
  iconBtn: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 2,
    elevation: 2,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  menu: {
    position: 'absolute',
    top: 60,
    right: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.text,
  },
}); 