import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants';
import { api } from '../utils/api';

export default function ConsentHistory() {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await api.get('/api/consent/history');
        setConsents(res.data || []);
      } catch {
        setConsents([]);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  if (loading) return <Text style={styles.loading}>Chargement…</Text>;

  if (!consents.length) return <Text style={styles.empty}>Aucun consentement enregistré.</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historique des consentements</Text>
      <FlatList
        data={consents}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.partner}>
              Partenaire : {typeof item.partnerName === 'string' && item.partnerName ? item.partnerName : (typeof item.partnerEmail === 'string' && item.partnerEmail ? item.partnerEmail : 'N/A')}
            </Text>
            <Text style={styles.date}>
              Date : {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}
            </Text>
            <Text style={styles.status}>
              Statut : {typeof item.status === 'string' ? (item.status === 'SIGNED' ? 'Signé' : item.status === 'PENDING' ? 'En attente' : item.status === 'REFUSED' ? 'Refusé' : item.status) : 'N/A'}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SIZES.padding },
  title: { fontFamily: 'Poppins-Bold', fontSize: 22, marginBottom: 24, textAlign: 'center' },
  loading: { textAlign: 'center', marginTop: 40, color: COLORS.text },
  empty: { textAlign: 'center', marginTop: 40, color: COLORS.text },
  item: { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 18, elevation: 2 },
  partner: { fontSize: 16, color: COLORS.text, marginBottom: 6 },
  date: { fontSize: 15, color: COLORS.text, marginBottom: 6 },
  status: { fontSize: 15, color: COLORS.text, fontWeight: 'bold' },
});
