import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { supabase } from '@/supabase/supabase';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  StudentDashboard: undefined;
  LecturerDashboard: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user found');

      // Check user role
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('role')
        .eq('id', data.user.id);

      if (studentError) {
        throw studentError;
      }

      // If student data exists and has exactly one row, user is a student
      if (studentData && studentData.length === 1) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'StudentDashboard' }],
        });
        return;
      }

      // If not a student, check if lecturer
      const { data: lecturerData, error: lecturerError } = await supabase
        .from('lecturers')
        .select('role')
        .eq('id', data.user.id);

      if (lecturerError) {
        throw lecturerError;
      }

      if (lecturerData && lecturerData.length === 1) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'LecturerDashboard' }],
        });
        return;
      }

      // If we get here, the user exists in auth but not in our role tables
      throw new Error('User account exists but role not found. Please contact support.');
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Error', error.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>EduSync Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} disabled={loading} />
      <Button title="Forgot Password?" onPress={() => navigation.navigate('ForgotPassword')} />
      <Button title="Register" onPress={() => navigation.navigate('Register')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, marginBottom: 15, borderRadius: 10, backgroundColor: '#fff', fontSize: 16 },
});

export default LoginScreen;