import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Placeholder for a 3D viewer (upgrade with expo-three and GLTFLoader)
export default function OverlayViewer3D() {
  return (
    <View style={styles.container}>
      <Text>3D Viewer Placeholder</Text>
      <Text>Load GLB/GLTF mesh and overlay vectors here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
});