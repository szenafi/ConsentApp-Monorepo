import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SIZES, DEFAULT_AVATAR } from '../constants';
import { searchUsers } from '../utils/api';

export default function PartnerSelector({ value, onSelect, onNext }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!search) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await searchUsers(search);
        setResults(res);
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Choisir un partenaire</Text>
      <TextInput
        style={styles.input}
        placeholder="Recherche par nom ou email"
        value={search}
        onChangeText={setSearch}
      />
      {loading && <ActivityIndicator />}
      <FlatList
        data={results}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.contactRow, value?.id === item.id && styles.selected]}
            onPress={() => {
              onSelect(item);
              setTimeout(onNext, 350);
            }}
          >
            <Image
              source={{ uri: item.photoUrl || DEFAULT_AVATAR }}
              style={styles.avatar}
            />
            <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
            <Text style={styles.email}>{item.email}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={!loading && search ? <Text>Aucun partenaire trouvé.</Text> : null}
      />
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
    padding: 12,
    borderRadius: SIZES.radius,
    marginBottom: 12,
    fontFamily: 'Poppins-Regular',
    fontSize: SIZES.fontSmall,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#f9fafb',
  },
  selected: {
    backgroundColor: COLORS.primary,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#22223b',
    flex: 1,
  },
  email: {
    fontSize: 13,
    color: '#64748b',
  },
});
