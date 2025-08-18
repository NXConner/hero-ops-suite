import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, Button, ScrollView, Alert } from "react-native";
import { getPricing, setPricing } from "../services/api";

export default function PricingScreen() {
  const [pricing, setPricingState] = useState<
    Record<string, { item_code: string; unit: string; unit_cost: number }>
  >({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getPricing();
      setPricingState(data);
    })();
  }, []);

  const save = async () => {
    try {
      setBusy(true);
      await setPricing(pricing);
      Alert.alert("Saved", "Pricing updated");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to save pricing");
    } finally {
      setBusy(false);
    }
  };

  const updateField = (key: string, field: "unit" | "unit_cost", value: string) => {
    setPricingState((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: field === "unit_cost" ? Number(value) || 0 : value,
      },
    }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Pricing</Text>
      {Object.keys(pricing).length === 0 && <Text>Loading…</Text>}
      {Object.entries(pricing).map(([key, item]) => (
        <View key={key} style={styles.card}>
          <Text style={styles.itemTitle}>{item.item_code}</Text>
          <Text>Unit</Text>
          <TextInput
            value={item.unit}
            onChangeText={(t) => updateField(key, "unit", t)}
            style={styles.input}
          />
          <Text>Unit Cost</Text>
          <TextInput
            value={String(item.unit_cost)}
            onChangeText={(t) => updateField(key, "unit_cost", t)}
            style={styles.input}
            keyboardType="decimal-pad"
          />
        </View>
      ))}
      <Button title={busy ? "Saving…" : "Save"} onPress={save} disabled={busy} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 8 },
  card: { borderWidth: 1, borderColor: "#eee", borderRadius: 8, padding: 12, marginBottom: 12 },
  itemTitle: { fontWeight: "700", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 8, marginBottom: 8 },
});
