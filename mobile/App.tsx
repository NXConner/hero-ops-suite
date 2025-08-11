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
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import PricingScreen from './src/screens/PricingScreen';
import LoginScreen from './src/screens/LoginScreen';
import { CONFIG } from './src/config';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

export default function App() {
  const initial = CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY ? 'Login' : 'Capture';
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initial}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Capture" component={CaptureScreen} />
          <Stack.Screen name="Scans" component={ScansScreen} />
          <Stack.Screen name="Viewer" component={ViewerScreen} />
          <Stack.Screen name="Estimate" component={EstimateScreen} />
          <Stack.Screen name="Report" component={ReportScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Analytics" component={AnalyticsScreen} />
          <Stack.Screen name="Pricing" component={PricingScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}