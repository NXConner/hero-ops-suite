import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAnalyticsSummary } from '../services/api';

export default function AnalyticsScreen() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['analytics'], queryFn: getAnalyticsSummary });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analytics</Text>
      {q.isLoading && <Text>Loading…</Text>}
      {q.data && (
        <View>
          <Text>Sites: {q.data.totals?.sites ?? 0}</Text>
          <Text>Cracks (ft): {q.data.totals?.cracks_ft ?? 0}</Text>
          <Text>Potholes (sqft): {q.data.totals?.potholes_sqft ?? 0}</Text>
          <Text>Gator (sqft): {q.data.totals?.gator_sqft ?? 0}</Text>
          <Text>Pooling (sqft): {q.data.totals?.pooling_sqft ?? 0}</Text>
          <Text>Score: {q.data.totals?.score ?? 0}</Text>
        </View>
      )}
      <Button title="Refresh" onPress={() => qc.invalidateQueries({ queryKey: ['analytics'] })} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
});