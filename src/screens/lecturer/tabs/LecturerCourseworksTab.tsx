import React from 'react';
import { View, Text, StyleSheet, Alert, Button } from 'react-native';
import { supabase } from '@/supabase/supabase';
import { useNavigation } from '@react-navigation/native';

const LecturerCourseworksTab = ({ fullName }: { fullName: string }) => {
  const navigation = useNavigation();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello {fullName}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Sign Out" onPress={handleSignOut} color="#dc3545" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  text: {
    fontSize: 24,
    color: '#333',
    marginBottom: 20,
  },
  buttonContainer: {
    marginBottom: 10,
    width: '100%',
  },
});

export default LecturerCourseworksTab;