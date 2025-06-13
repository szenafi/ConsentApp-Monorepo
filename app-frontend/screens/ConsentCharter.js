import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SIZES } from '../constants';

export default function ConsentCharter() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Charte du Consentement</Text>
      <Text style={styles.text}>
        1. Le consentement sexuel est un accord mutuel, libre et éclairé.
        {'\n\n'}2. Chaque partenaire doit valider le consentement via son empreinte digitale.
        {'\n\n'}3. Le consentement peut être retiré à tout moment, sans justification.
        {'\n\n'}4. Aucun consentement n'est valable sous la contrainte, la menace ou l'ivresse.
        {'\n\n'}5. Le respect et la bienveillance sont fondamentaux.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: COLORS.background, padding: SIZES.padding, justifyContent: 'center' },
  title: { fontFamily: 'Poppins-Bold', fontSize: 22, marginBottom: 24, textAlign: 'center' },
  text: { fontSize: 17, color: COLORS.text, lineHeight: 28 },
});
