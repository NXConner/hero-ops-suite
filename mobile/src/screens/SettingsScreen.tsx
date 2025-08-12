import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert } from 'react-native';
import { CONFIG, setApiBaseUrl } from '../config';
import { getBranding, setBranding } from '../services/api';

export default function SettingsScreen({ navigation }: any) {
  const [apiBase, setApiBase] = useState(CONFIG.API_BASE_URL);
  const [branding, setBrandingState] = useState({ companyName: '', primary: '#0b6bcb', footerDisclaimer: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const b = await getBranding();
        setBrandingState(b);
      } catch {}
    })();
  }, []);

  const saveBranding = async () => {
    try {
      setBusy(true);
      await setBranding(branding);
      Alert.alert('Saved', 'Branding updated');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save branding');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text>API Base URL</Text>
      <TextInput
        style={styles.input}
        value={apiBase}
        onChangeText={setApiBase}
        onBlur={() => setApiBaseUrl(apiBase)}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View style={{ height: 16 }} />
      <Text style={styles.subtitle}>Branding</Text>
      <Text>Company Name</Text>
      <TextInput style={styles.input} value={branding.companyName} onChangeText={(t) => setBrandingState({ ...branding, companyName: t })} />
      <Text>Primary Color</Text>
      <TextInput style={styles.input} value={branding.primary} onChangeText={(t) => setBrandingState({ ...branding, primary: t })} />
      <Text>Footer Disclaimer</Text>
      <TextInput style={styles.input} value={branding.footerDisclaimer} onChangeText={(t) => setBrandingState({ ...branding, footerDisclaimer: t })} />
      <Button title={busy ? 'Saving…' : 'Save Branding'} onPress={saveBranding} disabled={busy} />

      <View style={{ height: 16 }} />
      <Button title="Pricing" onPress={() => navigation.navigate('Pricing')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  subtitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginTop: 6, marginBottom: 8 },
});