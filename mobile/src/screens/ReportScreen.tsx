import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button, Alert } from "react-native";
import { generatePdfReport } from "../utils/pdfReport";
import { estimateCosts } from "../utils/costEstimator";
import { Overlay } from "../types/overlay";
import { getBranding, getPricing } from "../services/api";

export default function ReportScreen({ route }: any) {
  const [busy, setBusy] = useState(false);
  const [brand, setBrand] = useState<
    { companyName: string; primary: string; footerDisclaimer: string } | undefined
  >();
  const [pricing, setPricing] = useState<Record<
    string,
    { item_code: string; unit: string; unit_cost: number }
  > | null>(null);
  const overlay: Overlay | undefined = route?.params?.overlay;

  useEffect(() => {
    (async () => {
      try {
        const [b, p] = await Promise.all([getBranding(), getPricing()]);
        setBrand(b);
        setPricing(p);
      } catch (_e) {
        /* ignore */
      }
    })();
  }, []);

  const handleGenerate = async () => {
    if (!overlay) {
      Alert.alert("No overlay", "Open a scan with analysis results first.");
      return;
    }
    try {
      setBusy(true);
      const estimate = estimateCosts(overlay, pricing || ({} as any));
      const { uri } = await generatePdfReport({ overlay, estimate, siteName: "Site", brand });
      Alert.alert("PDF generated", uri);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to generate PDF");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Report</Text>
      {!overlay && <Text>No overlay loaded. Open a scan first.</Text>}
      {overlay && (
        <>
          <Text>
            Cracks: {overlay.cracks?.length || 0} | Potholes: {overlay.potholes?.length || 0}
          </Text>
          <Button
            title={busy ? "Generating…" : "Generate PDF"}
            onPress={handleGenerate}
            disabled={busy || !pricing}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 8 },
});
