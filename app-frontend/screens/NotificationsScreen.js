import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNotifications } from '../context/NotificationContext';
import { COLORS } from '../constants';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
  const { notifications, loadNotifications, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    loadNotifications();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.message}>{item.message}</Text>
      <TouchableOpacity onPress={() => markAsRead(item.id)} style={styles.btn}>
        <Ionicons name="checkmark" size={20} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {notifications.length === 0 ? (
        <Text style={styles.empty}>Aucune notification non lue.</Text>
      ) : (
        <>
          <FlatList
            data={notifications}
            keyExtractor={(it) => it.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16 }}
          />
          <TouchableOpacity style={styles.allRead} onPress={markAllAsRead}>
            <Text style={styles.allReadText}>Tout marquer comme lu</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  message: { flex: 1, color: COLORS.text },
  btn: { padding: 6 },
  empty: { textAlign: 'center', marginTop: 40, color: '#64748b' },
  allRead: {
    margin: 16,
    padding: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
  allReadText: { color: '#fff', fontWeight: 'bold' },
});
