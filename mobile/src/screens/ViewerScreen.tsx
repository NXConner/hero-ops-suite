import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, ActivityIndicator } from "react-native";
import OverlayViewer3D from "../components/OverlayViewer3D";
import { getScan } from "../services/api";

export default function ViewerScreen({ navigation, route }: any) {
  const [data, setData] = useState<{ scan: any; overlay: any } | null>(route?.params || null);
  const [loading, setLoading] = useState(!route?.params);

  useEffect(() => {
    (async () => {
      if (!data?.scan?.scan_id && route?.params?.scan_id) {
        setLoading(true);
        const resp = await getScan(route.params.scan_id);
        setData(resp as any);
        setLoading(false);
      }
    })();
  }, [route?.params?.scan_id]);

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator />
      </View>
    );
  }

  const scan = data?.scan;
  const overlay = data?.overlay;
  const meshUrl = scan?.mesh_url;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>3D Viewer</Text>
      <OverlayViewer3D meshUrl={meshUrl} overlay={overlay} />
      {overlay && (
        <View style={{ marginTop: 12 }}>
          <Text>
            Cracks: {overlay.cracks?.length || 0} | Potholes: {overlay.potholes?.length || 0} |
            Zones: {overlay.distress_zones?.length || 0}
          </Text>
        </View>
      )}
      <View style={{ height: 16 }} />
      <Button title="Estimate" onPress={() => navigation.navigate("Estimate", { overlay })} />
      <View style={{ height: 8 }} />
      <Button title="Report" onPress={() => navigation.navigate("Report", { overlay })} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 8 },
});
