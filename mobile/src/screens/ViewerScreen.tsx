import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import OverlayViewer3D from '../components/OverlayViewer3D';

export default function ViewerScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>3D Viewer</Text>
      <OverlayViewer3D />
      <View style={{ height: 16 }} />
      <Button title="Estimate" onPress={() => navigation.navigate('Estimate')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
});