import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { CONFIG, setApiBaseUrl } from '../config';

export default function SettingsScreen() {
  const [apiBase, setApiBase] = useState(CONFIG.API_BASE_URL);

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginTop: 6 },
});