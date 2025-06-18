import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants';

export default function ConsentModal({ visible, message, onAccept, onRefuse, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.modalBox}>
          <Text style={styles.text}>{message}</Text>
          <View style={styles.actions}>
            {onAccept && (
              <TouchableOpacity style={[styles.btn, styles.accept]} onPress={onAccept}>
                <Text style={styles.btnText}>Accepter</Text>
              </TouchableOpacity>
            )}
            {onRefuse && (
              <TouchableOpacity style={[styles.btn, styles.refuse]} onPress={onRefuse}>
                <Text style={styles.btnText}>Refuser</Text>
              </TouchableOpacity>
            )}
          </View>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>Fermer</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '85%',
  },
  text: { textAlign: 'center', color: COLORS.text, marginBottom: 20 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  accept: {
    backgroundColor: COLORS.success,
  },
  refuse: {
    backgroundColor: COLORS.danger,
  },
  btnText: { color: '#fff', fontWeight: 'bold' },
  closeBtn: { marginTop: 10, alignSelf: 'center' },
  closeText: { color: COLORS.text },
});
