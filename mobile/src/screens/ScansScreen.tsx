import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function ScansScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scans</Text>
      <Text>No scans yet.</Text>
      <View style={{ height: 8 }} />
      <Button title="Open Viewer" onPress={() => navigation.navigate('Viewer')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
});