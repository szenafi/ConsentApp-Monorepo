import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import PartnerSelector from '../components/PartnerSelector';
import ConsentCard from '../components/ConsentCard';
import { COLORS, SIZES } from '../constants';
import { api } from '../utils/api';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

const steps = [
  'PARTNER',
  'PREVIEW',
];

export default function ConsentWizard() {
  const [step, setStep] = useState(0);
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [biometryValidated, setBiometryValidated] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { user } = useAuth();

  const handleNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  // Étape 1 : Validation biométrique locale
  const handleBiometricAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) throw new Error("Aucun capteur biométrique détecté.");
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) throw new Error("Aucune empreinte digitale enregistrée.");

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Validez avec votre empreinte digitale",
      });
      if (result.success) {
        setBiometryValidated(true);
      } else {
        throw new Error("Validation biométrique annulée ou échouée.");
      }
    } catch (e) {
      setError(e.message);
      setBiometryValidated(false);
    }
    setLoading(false);
  };

  // Étape 2 : Création du consentement (uniquement si biométrie OK)
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const consentData = {
        partnerEmail: partner.email,
        consentData: {
          message: `Je consens à avoir une relation sexuelle avec ${partner.firstName || partner.email}`,
        },
      };
      await api.post('/consent', consentData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.replace('/dashboard');
      }, 1800);
    } catch (error) {
      // Patch : on logue toute la réponse serveur pour debug + message enrichi
      console.log('Consentement - erreur serveur:', error.response?.data);
      setError(
        error.response?.data?.message
          ? error.response.data.message +
            (error.response.data.error ? `\n${error.response.data.error}` : '')
          : 'Erreur lors de la création du consentement'
      );
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {step === 0 ? (
        <PartnerSelector value={partner} onSelect={setPartner} onNext={handleNext} />
      ) : (
        <View style={styles.previewContainer}>
          <Text style={styles.title}>Consentement sexuel</Text>
          {/* Card designer ergonomique et moderne */}
          <ConsentCard
            consent={{
              user: { firstName: 'Moi', photoUrl: user?.photoUrl || '' },
              partner:
                partner && typeof partner === 'object'
                  ? partner
                  : { firstName: '', photoUrl: '' },
              // Pour l'aperçu avant signature, on souhaite uniquement afficher la citation
              message: '',
              createdAt: new Date().toISOString(),
              status: 'DRAFT',
            }}
            userId={user?.id ?? -1}
          />

          {/* -------- PATCH BIOMÉTRIQUE -------- */}
          {!biometryValidated ? (
            <TouchableOpacity style={styles.button} onPress={handleBiometricAuth} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'Vérification...' : 'Signer avec mon empreinte digitale'}</Text>
            </TouchableOpacity>
          ) : (
            <>
              <Text style={{ color: 'green', marginVertical: 10, fontFamily: 'Poppins-Bold', textAlign: 'center' }}>
                {`✅ C’est fait ! Ta signature biométrique est enregistrée.`}
              </Text>
              <Text style={{ marginBottom: 10, fontFamily: 'Poppins-Regular', textAlign: 'center' }}>
                {`🚀 Envoie maintenant ta demande à ${partner?.firstName || partner?.email || 'ton partenaire'} pour finaliser ensemble ce moment d’engagement mutuel.`}
              </Text>
              <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Envoi...' : `Envoyer la demande à ${partner?.firstName || partner?.email || 'ton partenaire'}`}</Text>
              </TouchableOpacity>
            </>
          )}
          {error && <Text style={{ color: 'red', marginVertical: 10 }}>{error}</Text>}
          {/* -------- FIN PATCH BIOMÉTRIQUE -------- */}

        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: SIZES.fontLarge,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.padding * 2,
  },
  label: {
    fontSize: SIZES.fontMedium,
    color: COLORS.text,
    marginBottom: 4,
  },
  partner: {
    fontSize: SIZES.fontMedium,
    color: COLORS.text,
    marginBottom: SIZES.padding,
  },
  message: {
    fontSize: SIZES.fontMedium,
    color: COLORS.text,
    marginBottom: SIZES.padding,
    textAlign: 'center',
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: SIZES.radius,
    marginTop: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: SIZES.fontMedium,
    fontFamily: 'Poppins-Bold',
  },
});
