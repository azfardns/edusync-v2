import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { supabase } from '@/supabase/supabase';
import LecturerHomeTab from '@/screens/lecturer/tabs/LecturerHomeTab';
import LecturerCourseworksTab from '@/screens/lecturer/tabs/LecturerCourseworksTab';
import LecturerProfileTab from '@/screens/lecturer/tabs/LecturerProfileTab';

const Tab = createBottomTabNavigator();

const LecturerDashboard = () => {
  const [fullName, setFullName] = useState<string>('Lecturer');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');

        const { data, error } = await supabase
          .from('lecturers')
          .select('full_name')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (data) setFullName(data.full_name);
      } catch (error) {
        Alert.alert('Error', error.message || 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: '#f8f9fa' },
        tabBarLabelStyle: { fontSize: 12, color: '#333' },
        tabBarActiveTintColor: '#007bff',
      }}
    >
      <Tab.Screen
        name="Home"
        children={() => <LecturerHomeTab fullName={fullName} />}
        options={{ headerTitle: 'Lecturer Home' }}
      />
      <Tab.Screen
        name="Courseworks"
        children={() => <LecturerCourseworksTab fullName={fullName} />}
        options={{ headerTitle: 'Lecturer Courseworks' }}
      />
      <Tab.Screen
        name="Profile"
        children={() => <LecturerProfileTab fullName={fullName} />}
        options={{ headerTitle: 'Lecturer Profile' }}
      />
    </Tab.Navigator>
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
  },
});

export default LecturerDashboard;