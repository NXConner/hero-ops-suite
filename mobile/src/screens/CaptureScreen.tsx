import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { CONFIG } from '../config';
import { uploadMeshToSupabase } from '../services/supabase';
import { createScan, updateScan } from '../services/api';

export default function CaptureScreen({ navigation }: any) {
  const [busy, setBusy] = useState(false);

  const pickAndUploadMesh = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['model/gltf-binary', 'application/octet-stream'] });
      if (result.canceled || !result.assets?.[0]) return;
      setBusy(true);
      const asset = result.assets[0];
      const { scan_id } = await createScan({});
      // Upload to Supabase if configured
      let meshUrl: string | undefined;
      try {
        meshUrl = await uploadMeshToSupabase(asset.uri, `${scan_id}.glb`);
      } catch (e) {
        // Supabase not configured; skip upload
      }
      if (meshUrl) {
        await updateScan(scan_id, { mesh_url: meshUrl });
      }
      Alert.alert('Scan created', scan_id);
      navigation.navigate('Scans');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create scan');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Capture & Measure</Text>
      <Text style={styles.text}>Use your preferred scanning app to capture a GLB/GLTF mesh and photos.</Text>
      <Text style={styles.text}>Then upload to the backend; analysis will return an overlay JSON.</Text>

      <Button title={busy ? 'Uploading…' : 'Pick Mesh & Create Scan'} onPress={pickAndUploadMesh} disabled={busy} />
      <View style={{ height: 8 }} />
      <Button title="View Scans" onPress={() => navigation.navigate('Scans')} />
      <View style={{ height: 8 }} />
      <Button title="Settings" onPress={() => navigation.navigate('Settings')} />
      <View style={{ height: 8 }} />
      <Button title="Analytics" onPress={() => navigation.navigate('Analytics')} />

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