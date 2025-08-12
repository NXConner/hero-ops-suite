import React, { useMemo } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { estimateCosts } from "../utils/costEstimator";
import { Overlay } from "../types/overlay";
import { demoOverlay as defaultOverlay } from "../data/demoOverlay";

const demoPricing = {
  CRACK_SEAL: { item_code: "CRACK_SEAL", unit: "ft" as const, unit_cost: 1.5 },
  POTHOLE_PATCH: { item_code: "POTHOLE_PATCH", unit: "sqft" as const, unit_cost: 12 },
  GATOR_REPAIR: { item_code: "GATOR_REPAIR", unit: "sqft" as const, unit_cost: 6.5 },
  REGRADING: { item_code: "REGRADING", unit: "sqft" as const, unit_cost: 4 },
};

export default function EstimateScreen({ route }: any) {
  const overlay: Overlay = route?.params?.overlay || defaultOverlay;
  const estimate = useMemo(() => estimateCosts(overlay, demoPricing), [overlay]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estimate</Text>
      <FlatList
        data={estimate.lines}
        keyExtractor={(item) => item.item_code}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.cell}>{item.description}</Text>
            <Text style={styles.cell}>
              {item.quantity.toFixed(1)} {item.unit}
            </Text>
            <Text style={styles.cell}>${item.total.toFixed(2)}</Text>
          </View>
        )}
        ListFooterComponent={() => (
          <View>
            <View style={styles.row}>
              <Text style={styles.cell}>Mobilization</Text>
              <Text style={styles.cell}></Text>
              <Text style={styles.cell}>${estimate.mobilization.toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.cell}>Contingency</Text>
              <Text style={styles.cell}></Text>
              <Text style={styles.cell}>{(estimate.contingencyPercent * 100).toFixed(0)}%</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.cellBold}>Total</Text>
              <Text style={styles.cell}></Text>
              <Text style={styles.cellBold}>${estimate.total.toFixed(2)}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 8 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  cell: { flex: 1, paddingRight: 8 },
  cellBold: { flex: 1, paddingRight: 8, fontWeight: "700" },
});
