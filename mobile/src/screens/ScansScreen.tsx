import React from "react";
import { View, Text, Button, StyleSheet, FlatList, Alert } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listScans, createScan, getScan } from "../services/api";
import { enqueue } from "../services/offlineQueue";

export default function ScansScreen({ navigation }: any) {
  const qc = useQueryClient();
  const scansQuery = useQuery({ queryKey: ["scans"], queryFn: listScans });

  const create = useMutation({
    mutationFn: async () => {
      const { scan_id } = await createScan({});
      return scan_id;
    },
    onSuccess: async (scan_id) => {
      await qc.invalidateQueries({ queryKey: ["scans"] });
      Alert.alert("Scan created", `${scan_id}`);
    },
    onError: (e: any) => Alert.alert("Error", e.message || "Failed to create scan"),
  });

  const openScan = async (scan_id: string) => {
    const data = await getScan(scan_id);
    navigation.navigate("Report", { scan: data.scan, overlay: data.overlay });
  };

  const openViewer = async (scan_id: string) => {
    const data = await getScan(scan_id);
    navigation.navigate("Viewer", { scan: data.scan, overlay: data.overlay });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scans</Text>
      <Button
        title={create.isPending ? "Creating…" : "Create Scan"}
        onPress={() => create.mutate()}
        disabled={create.isPending}
      />
      <FlatList
        style={{ marginTop: 12 }}
        data={scansQuery.data?.scans || []}
        keyExtractor={(item) => item.scan_id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{item.scan_id}</Text>
              <Text>{new Date(item.timestamp).toLocaleString()}</Text>
            </View>
            <View style={{ gap: 6 }}>
              <Button title="Viewer" onPress={() => openViewer(item.scan_id)} />
              <Button title="Open" onPress={() => openScan(item.scan_id)} />
            </View>
          </View>
        )}
        ListEmptyComponent={() => <Text style={{ marginTop: 12 }}>No scans yet.</Text>}
        refreshing={scansQuery.isFetching}
        onRefresh={() => qc.invalidateQueries({ queryKey: ["scans"] })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 8 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  itemTitle: { fontWeight: "600" },
});
