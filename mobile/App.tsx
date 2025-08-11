import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CaptureScreen from './src/screens/CaptureScreen';
import ScansScreen from './src/screens/ScansScreen';
import ViewerScreen from './src/screens/ViewerScreen';
import EstimateScreen from './src/screens/EstimateScreen';
import ReportScreen from './src/screens/ReportScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Capture">
          <Stack.Screen name="Capture" component={CaptureScreen} />
          <Stack.Screen name="Scans" component={ScansScreen} />
          <Stack.Screen name="Viewer" component={ViewerScreen} />
          <Stack.Screen name="Estimate" component={EstimateScreen} />
          <Stack.Screen name="Report" component={ReportScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}