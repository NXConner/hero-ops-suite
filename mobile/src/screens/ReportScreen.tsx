import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { generatePdfReport } from '../utils/pdfReport';
import { estimateCosts } from '../utils/costEstimator';
import { Overlay } from '../types/overlay';
import { demoOverlay as defaultOverlay } from '../data/demoOverlay';
import { getBranding } from '../services/api';

export default function ReportScreen({ route }: any) {
  const [busy, setBusy] = useState(false);
  const [brand, setBrand] = useState<{ companyName: string; primary: string; footerDisclaimer: string } | undefined>();
  const overlay: Overlay = route?.params?.overlay || defaultOverlay;

  useEffect(() => {
    (async () => {
      try {
        const b = await getBranding();
        setBrand(b);
      } catch (_e) { /* ignore */ }
    })();
  }, []);

  const handleGenerate = async () => {
    try {
      setBusy(true);
      const estimate = estimateCosts(overlay, {
        CRACK_SEAL: { item_code: 'CRACK_SEAL', unit: 'ft', unit_cost: 1.5 },
        POTHOLE_PATCH: { item_code: 'POTHOLE_PATCH', unit: 'sqft', unit_cost: 12 },
        GATOR_REPAIR: { item_code: 'GATOR_REPAIR', unit: 'sqft', unit_cost: 6.5 },
        REGRADING: { item_code: 'REGRADING', unit: 'sqft', unit_cost: 4 }
      });
      const { uri } = await generatePdfReport({ overlay, estimate, siteName: 'Demo Site', brand });
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
      <Text>Cracks: {overlay.cracks?.length || 0} | Potholes: {overlay.potholes?.length || 0}</Text>
      <Button title={busy ? 'Generating…' : 'Generate PDF'} onPress={handleGenerate} disabled={busy} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
});