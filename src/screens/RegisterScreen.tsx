import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '@/supabase/supabase';
import { useNavigation } from '@react-navigation/native';

const RegisterScreen = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [role, setRole] = useState<'student' | 'lecturer'>('student');
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation();

  const handleRegister = async () => {
    setLoading(true);
    
    try {
      // Validate inputs
      if (!email || !password || !fullName) {
        throw new Error('Please fill in all fields');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const cleanEmail = email.toLowerCase().trim();
      const cleanFullName = fullName.trim();

      console.log('Starting registration process...');

      // Step 1: Create auth user (without metadata to avoid trigger conflicts)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        
        if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
          throw new Error('This email is already registered. Please try logging in instead.');
        }
        
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Failed to create user account. Please try again.');
      }

      console.log('Auth user created successfully:', authData.user.id);

      // Step 2: Create user profile manually
      const userData = {
        id: authData.user.id,
        email: cleanEmail,
        full_name: cleanFullName,
        role: role,
        created_at: new Date().toISOString(),
      };

      console.log('Creating user profile...');

      // Insert into appropriate table
      let profileError;
      if (role === 'student') {
        const { error } = await supabase
          .from('students')
          .insert([userData]);
        profileError = error;
      } else {
        const { error } = await supabase
          .from('lecturers')
          .insert([userData]);
        profileError = error;
      }

      if (profileError) {
        console.error('Profile creation error:', profileError);
        
        // Clean up: delete the auth user if profile creation fails
        try {
          await supabase.auth.signOut();
        } catch (cleanupError) {
          console.error('Failed to clean up auth user:', cleanupError);
        }
        
        if (profileError.message.includes('duplicate key')) {
          throw new Error('This email is already registered. Please try logging in.');
        }
        
        throw new Error(`Failed to create user profile: ${profileError.message}`);
      }

      console.log('User profile created successfully');

      // Success!
      Alert.alert(
        'Registration Successful!',
        'Your account has been created successfully. You can now log in.',
        [
          {
            text: 'Go to Login',
            onPress: () => {
              // Clear form
              setEmail('');
              setPassword('');
              setFullName('');
              setRole('student');
              navigation.navigate('Login');
            }
          }
        ]
      );
      
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert(
        'Registration Failed',
        error.message || 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Your Account</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
        autoCapitalize="words"
        editable={!loading}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password (minimum 6 characters)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        editable={!loading}
      />
      
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>I am a:</Text>
        <Picker
          selectedValue={role}
          style={styles.picker}
          onValueChange={(itemValue) => setRole(itemValue)}
          enabled={!loading}
        >
          <Picker.Item label="Student" value="student" />
          <Picker.Item label="Lecturer" value="lecturer" />
        </Picker>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          title={loading ? 'Creating Account...' : 'Register'} 
          onPress={handleRegister} 
          disabled={loading || !email || !password || !fullName}
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Already have an account? Login" 
          onPress={() => navigation.navigate('Login')} 
          color="#666"
          disabled={loading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20,
    backgroundColor: '#f8f9fa'
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 30, 
    textAlign: 'center',
    color: '#333'
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    padding: 15, 
    marginBottom: 15, 
    borderRadius: 10,
    backgroundColor: '#fff',
    fontSize: 16
  },
  pickerContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
    marginLeft: 15,
    color: '#333',
    fontWeight: '500'
  },
  picker: { 
    height: 50,
    marginBottom: 5,
  },
  buttonContainer: {
    marginBottom: 10,
  }
});

export default RegisterScreen;