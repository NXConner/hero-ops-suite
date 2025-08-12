import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert } from 'react-native';
import { signIn, signUp } from '../services/supabase';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const doSignIn = async () => {
    try {
      setBusy(true);
      await signIn(email, password);
      Alert.alert('Signed in');
      navigation.replace('Capture');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Sign in failed');
    } finally {
      setBusy(false);
    }
  };

  const doSignUp = async () => {
    try {
      setBusy(true);
      await signUp(email, password);
      Alert.alert('Account created. Check your email if confirmation is required.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Sign up failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>
      <Text>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" />
      <Text>Password</Text>
      <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
      <Button title={busy ? 'Signing in…' : 'Sign in'} onPress={doSignIn} disabled={busy} />
      <View style={{ height: 8 }} />
      <Button title="Sign up" onPress={doSignUp} disabled={busy} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginVertical: 6 },
});