import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { COLORS, SIZES } from '../constants';

function pad(n) { return n < 10 ? '0' + n : n; }

// Génère une liste de dates (7 prochains jours)
function getDateOptions() {
  const arr = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    arr.push({
      date: d,
      label: d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    });
  }
  return arr;
}

// Génère une liste d'heures (8h à 22h, toutes les 15 min)
function getTimeOptions() {
  const arr = [];
  for (let h = 8; h <= 22; h++) {
    for (let m = 0; m < 60; m += 15) {
      arr.push({
        hour: h,
        minute: m,
        label: pad(h) + ':' + pad(m)
      });
    }
  }
  return arr;
}

export default function DateTimePickerComponent({ value, onChange, onNext, onBack }) {
  const [showDate, setShowDate] = React.useState(false);
  const [showTime, setShowTime] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(value ? new Date(value) : null);
  const [selectedTime, setSelectedTime] = React.useState(null);

  const handleDatePick = (date) => {
    setSelectedDate(date);
    setShowDate(false);
    setTimeout(() => setShowTime(true), 200);
  };

  const handleTimePick = (time) => {
    setSelectedTime(time);
    setShowTime(false);
    // Combine date + heure
    if (selectedDate && time) {
      const d = new Date(selectedDate);
      d.setHours(time.hour, time.minute, 0, 0);
      onChange(d.toISOString());
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Date et heure (optionnel)</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowDate(true)}>
        <Text style={styles.inputText}>{value ? new Date(value).toLocaleString('fr-FR') : 'Sélectionner une date/heure'}</Text>
      </TouchableOpacity>
      <Modal visible={showDate} transparent animationType="fade" onRequestClose={() => setShowDate(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choisir une date</Text>
            <FlatList
              data={getDateOptions()}
              keyExtractor={item => item.date.toISOString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => handleDatePick(item.date)}>
                  <Text style={styles.modalItemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowDate(false)}>
              <Text style={styles.modalBtnCancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={showTime} transparent animationType="fade" onRequestClose={() => setShowTime(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choisir une heure</Text>
            <FlatList
              data={getTimeOptions()}
              keyExtractor={item => item.label}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => handleTimePick(item)}>
                  <Text style={styles.modalItemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
              numColumns={4}
              scrollEnabled={true}
            />
            <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowTime(false)}>
              <Text style={styles.modalBtnCancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={styles.navRow}>
        <TouchableOpacity onPress={onBack} style={styles.navButton}><Text style={styles.navText}>Retour</Text></TouchableOpacity>
        <TouchableOpacity onPress={onNext} style={styles.navButton}><Text style={styles.navText}>Suivant</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.padding * 2,
  },
  label: {
    fontFamily: 'Poppins-Bold',
    fontSize: SIZES.fontMedium,
    color: COLORS.text,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: SIZES.radius,
    marginBottom: 12,
    alignItems: 'center',
  },
  inputText: {
    color: COLORS.text,
    fontSize: 15,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
  },
  navText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: 340,
    maxHeight: '80%',
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 16,
    color: COLORS.primary,
  },
  modalItem: {
    padding: 10,
    margin: 4,
    borderRadius: 6,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    minWidth: 60,
  },
  modalItemText: {
    color: COLORS.text,
    fontSize: 15,
  },
  modalBtnCancel: {
    marginTop: 12,
    backgroundColor: COLORS.secondary,
    padding: 10,
    borderRadius: 8,
    width: 120,
    alignItems: 'center',
  },
  modalBtnCancelText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
