import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { generatePdfReport } from '../utils/pdfReport';
import { estimateCosts } from '../utils/costEstimator';
import { Overlay } from '../types/overlay';

const demoOverlay: Overlay = {
  scan_id: 'demo',
  timestamp: new Date().toISOString(),
  dimensions: { perimeter_ft: 142.5, area_sqft: 1200, bbox_ft: [60, 20] },
  cracks: [{ id: 'c1', length_ft: 100, severity: 'moderate', coordinates: [] }],
  potholes: [{ id: 'p1', area_sqft: 5, center: { x: 0, y: 0, z: 0 }, depth_in: 2 }],
  distress_zones: [{ id: 'd1', type: 'gatoring', area_sqft: 20, polygon: [] }],
  slope_analysis: { pooling_area_sqft: 50, risk_zones: [], slope_vectors: [] },
  recommendations: ['Seal cracks', 'Patch pothole']
};

const demoPricing = {
  CRACK_SEAL: { item_code: 'CRACK_SEAL', unit: 'ft' as const, unit_cost: 1.5 },
  POTHOLE_PATCH: { item_code: 'POTHOLE_PATCH', unit: 'sqft' as const, unit_cost: 12 },
  GATOR_REPAIR: { item_code: 'GATOR_REPAIR', unit: 'sqft' as const, unit_cost: 6.5 },
  REGRADING: { item_code: 'REGRADING', unit: 'sqft' as const, unit_cost: 4 }
};

export default function ReportScreen() {
  const [busy, setBusy] = useState(false);

  const handleGenerate = async () => {
    try {
      setBusy(true);
      const estimate = estimateCosts(demoOverlay, demoPricing);
      const { uri } = await generatePdfReport({ overlay: demoOverlay, estimate, siteName: 'Demo Site' });
      Alert.alert('PDF generated', uri);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to generate PDF');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Report</Text>
      <Button title={busy ? 'Generating…' : 'Generate PDF'} onPress={handleGenerate} disabled={busy} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
});