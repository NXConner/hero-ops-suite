import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { CONFIG } from '../config';

export default function CaptureScreen({ navigation }: any) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Capture & Measure</Text>
      <Text style={styles.text}>Use your preferred scanning app to capture a GLB/GLTF mesh and photos.</Text>
      <Text style={styles.text}>Then upload to the backend; analysis will return an overlay JSON.</Text>

      <Button title="View Scans" onPress={() => navigation.navigate('Scans')} />
      <View style={{ height: 8 }} />
      <Button title="Settings" onPress={() => navigation.navigate('Settings')} />

      <View style={{ marginTop: 16 }}>
        <Text style={styles.hint}>API Base: {CONFIG.API_BASE_URL}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  text: { marginBottom: 8 },
  hint: { color: '#666' },
});