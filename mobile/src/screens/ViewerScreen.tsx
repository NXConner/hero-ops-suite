import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import OverlayViewer3D from '../components/OverlayViewer3D';

export default function ViewerScreen({ navigation, route }: any) {
  const overlay = route?.params?.overlay;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>3D Viewer</Text>
      <OverlayViewer3D />
      {overlay && (
        <View style={{ marginTop: 12 }}>
          <Text>Cracks: {overlay.cracks?.length || 0} | Potholes: {overlay.potholes?.length || 0} | Zones: {overlay.distress_zones?.length || 0}</Text>
        </View>
      )}
      <View style={{ height: 16 }} />
      <Button title="Estimate" onPress={() => navigation.navigate('Estimate', { overlay })} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
});