import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function ConsentModal({ visible, message, onClose, onAction }: {
  visible: boolean;
  message: string;
  onClose: () => void;
  onAction: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity style={styles.action} onPress={onAction}>
            <Text style={styles.actionText}>Ouvrir</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.close} onPress={onClose}>
            <Text style={styles.closeText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  container: { backgroundColor: '#fff', padding: 24, borderRadius: 20, width: '80%' },
  message: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
  action: { backgroundColor: '#6366f1', borderRadius: 14, padding: 12, marginBottom: 12 },
  actionText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  close: { padding: 8 },
  closeText: { color: '#6366f1', textAlign: 'center' },
});
