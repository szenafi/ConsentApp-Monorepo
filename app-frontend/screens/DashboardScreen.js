import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  Image,
  StatusBar,
  Keyboard,
  Animated,
  Easing,
  Platform,
  Dimensions,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import {
  getConsentHistory,
  createPaymentSheet,
} from '../utils/api';
import ConsentCard from '../components/ConsentCard';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, DEFAULT_AVATAR } from '../constants';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useConsentNotificationContext } from '../hooks/useConsentNotifications';
import SafeLottieView from '../components/SafeLottieView';
import { useStripe } from '@stripe/stripe-react-native'; // ← Stripe

const SCREEN_WIDTH = Dimensions.get('window').width;
let confettiAnim;
try {
  // Correct relative path to animation asset
  confettiAnim = require('../assets/animations/confetti.json');
} catch {
  confettiAnim = null;
}

export default function DashboardScreen() {
  const { user, loading, logout, reloadUser } = useAuth(); // Ajout reloadUser ici !
  const router = useRouter();
  const params = useLocalSearchParams();
  const { setToast, setCelebrate } = useConsentNotificationContext();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [history, setHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [search, setSearch] = useState('');
  const [fabVisible, setFabVisible] = useState(true);
  const fabPulse = useState(new Animated.Value(1))[0];
  const [celebrationHandled, setCelebrationHandled] = useState(false);

  // 1. Redirection si non connecté
  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading]);

  useEffect(() => {
    if (!celebrationHandled && params.celebrate === '1') {
      const name = params.partnerName || 'ton partenaire';
      setCelebrate(true);
      setToast(`🎉 Demande de consentement envoyée avec succès à ${name} !`);
      setCelebrationHandled(true);
      router.replace('/dashboard');
    }
  }, [params, celebrationHandled]);

  // 2. Chargement des données
  const fetchData = useCallback(async () => {
    if (loading) return;
    setRefreshing(true);
    try {
      const histRes = await getConsentHistory();
      setHistory(Array.isArray(histRes) ? histRes : histRes.consents || []);
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Impossible de charger les données.');
    } finally {
      setRefreshing(false);
    }
  }, [loading]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // 3. Animation FAB
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fabPulse, { toValue: 1.1, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(fabPulse, { toValue: 1, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();
  }, [fabPulse]);

  // 4. Cacher FAB quand clavier
  useEffect(() => {
    const show = () => setFabVisible(false);
    const hide = () => setFabVisible(true);
    const subShow = Keyboard.addListener('keyboardDidShow', show);
    const subHide = Keyboard.addListener('keyboardDidHide', hide);
    return () => { subShow.remove(); subHide.remove(); };
  }, []);

  // 5. Achat de crédits (paiement Stripe) AVEC MISE À JOUR CRÉDITS
  const handleBuyCredits = async qty => {
    setShowBuyModal(false);
    try {
      const data = await createPaymentSheet(qty);
      const { error: initErr } = await initPaymentSheet({
        merchantDisplayName: 'ConsentApp',
        paymentIntentClientSecret: data.paymentIntent,
        customerEphemeralKeySecret: data.ephemeralKey,
        customerId: data.customer,
      });
      if (initErr) throw new Error(initErr.message);
      const { error: sheetErr } = await presentPaymentSheet();
      if (sheetErr) throw new Error(sheetErr.message);
      Alert.alert('Succès', 'Crédits achetés !');
      await reloadUser(); // ← Le user (crédits) se met à jour ici !
      fetchData();        // refresh l'historique si besoin
    } catch (e) {
      Alert.alert('Erreur', e.message || "Une erreur est survenue lors du paiement.");
    }
  };

  // 7. Déconnexion
  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (e) {
      Alert.alert('Erreur', "Déconnexion impossible");
    }
  };

  // 8. Filtre recherche
  const filteredHistory = history.filter(item => {
    if (!search) return true;
    const partner = item.partnerName || item.partnerEmail || '';
    return partner.toLowerCase().includes(search.toLowerCase());
  });

  // 9. Gestion du FAB (creation consentement) selon les crédits
  const handleFabPress = () => {
    if (!user || user.packQuantity < 1) {
      setShowBuyModal(true);
    } else {
      router.push('/consent-wizard');
    }
  };

  // 10. Loader global
  if (loading || !user) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: user.photoUrl || DEFAULT_AVATAR }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.welcome}>Salut,</Text>
          <Text style={styles.name}>{user.firstName || user.email}</Text>
          <Text style={styles.stats}>
            Score : <Text style={styles.bold}>{user.score ?? 0}</Text> |  
            Crédits : <Text style={styles.bold}>{user.packQuantity ?? 0}</Text>
          </Text>
        </View>
        {/* Réglages */}
        <TouchableOpacity style={styles.settingsBtn} onPress={() => setShowBuyModal(true)}>
          <Ionicons name="settings-outline" size={24} color="#555" />
        </TouchableOpacity>
        {/* Déconnexion */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>



      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={20} color="#aaa" style={{ marginHorizontal: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un partenaire..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Titre */}
      <Text style={styles.title}>Historique des consentements</Text>

      {/* Liste */}
      <FlatList
        data={filteredHistory}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <SafeLottieView
              source={confettiAnim}
              autoPlay
              loop
              style={styles.lottie}
              fallback={<Text style={styles.emptyText}>Aucun consentement.</Text>}
            />
          </View>
        )}
        renderItem={({ item }) => (
          <ConsentCard
            consent={item}
            userId={user.id}
            onAccept={fetchData}
            onRefuse={fetchData}
          />
        )}
      />

      {/* FAB */}
      {fabVisible && (
        <Animated.View
          style={[
            styles.fab,
            { transform: [{ scale: fabPulse }] },
            Platform.OS === 'ios' ? { bottom: 32 } : { bottom: 16 },
          ]}
        >
          <TouchableOpacity
            style={styles.fabButton}
            onPress={handleFabPress}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Modal Achat Crédit */}
      <Modal
        visible={showBuyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBuyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Acheter des crédits</Text>
            {[1, 5, 10].map(qty => (
              <TouchableOpacity
                key={qty}
                style={styles.modalButton}
                onPress={() => handleBuyCredits(qty)}
              >
                <Text style={styles.modalButtonText}>
                  {qty} crédit{qty > 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowBuyModal(false)}
            >
              <Text style={styles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  container: { flex: 1, backgroundColor: COLORS.background },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: '#f0f4ff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  avatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#fff' },
  userInfo: { flex: 1, marginLeft: 12 },
  welcome: { fontSize: 16, color: '#333' },
  name: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  stats: { fontSize: 14, color: '#666', marginTop: 4 },
  bold: { fontWeight: 'bold' },
  settingsBtn: { padding: 6 },
  logoutBtn: { padding: 6, marginLeft: 4 },

  /* Search */
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: SIZES.padding,
    backgroundColor: '#fff',
    borderRadius: SIZES.radius,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  /* Title */
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginHorizontal: SIZES.padding,
    marginBottom: 8,
    color: COLORS.text,
  },

  /* Empty state */
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SIZES.padding },
  emptyText: { fontSize: 16, color: COLORS.text },
  lottie: { width: 120, height: 120 },

  /* FAB */
  fab: { position: 'absolute', right: 24 },
  fabButton: {
    backgroundColor: COLORS.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },

  /* Modal */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: {
    backgroundColor: '#fff',
    padding: SIZES.padding * 2,
    borderRadius: SIZES.radius,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: SIZES.padding },
  modalButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    width: '100%',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  modalButtonText: { color: '#fff', fontWeight: 'bold' },
  modalCancel: { marginTop: 8 },
  modalCancelText: { color: COLORS.danger },
});
