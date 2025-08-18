import React from "react";
import { View, Text, StyleSheet, Button, FlatList } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAnalyticsSummary, getPrioritized } from "../services/api";

export default function AnalyticsScreen() {
  const qc = useQueryClient();
  const summary = useQuery({ queryKey: ["analytics"], queryFn: getAnalyticsSummary });
  const prioritized = useQuery({ queryKey: ["analytics_prioritized"], queryFn: getPrioritized });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analytics</Text>
      {summary.data && (
        <View>
          <Text>Sites: {summary.data.totals?.sites ?? 0}</Text>
          <Text>Cracks (ft): {summary.data.totals?.cracks_ft ?? 0}</Text>
          <Text>Potholes (sqft): {summary.data.totals?.potholes_sqft ?? 0}</Text>
          <Text>Gator (sqft): {summary.data.totals?.gator_sqft ?? 0}</Text>
          <Text>Pooling (sqft): {summary.data.totals?.pooling_sqft ?? 0}</Text>
          <Text>Score: {summary.data.totals?.score ?? 0}</Text>
        </View>
      )}
      <View style={{ height: 12 }} />
      <Text style={styles.subtitle}>Prioritized</Text>
      <FlatList
        data={prioritized.data?.rows || []}
        keyExtractor={(item) => item.scan.scan_id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={{ flex: 1 }}>{item.scan.scan_id}</Text>
            <Text>Score: {item.priority.toFixed(1)}</Text>
          </View>
        )}
      />
      <Button
        title="Refresh"
        onPress={() => {
          qc.invalidateQueries({ queryKey: ["analytics"] });
          qc.invalidateQueries({ queryKey: ["analytics_prioritized"] });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 8 },
  subtitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
});
