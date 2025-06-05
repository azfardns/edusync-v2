import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '@/supabase/supabase';
import { useNavigation } from '@react-navigation/native';

const StudentProfileTab = ({ fullName, studentId }: { fullName: string; studentId: string }) => {
  const navigation = useNavigation();
  const [faculty, setFaculty] = useState<string>('');
  const [program, setProgram] = useState<string>('');
  const [courses, setCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Mock data for dropdowns (replace with actual data from your institution)
  const faculties = ['Science', 'Engineering', 'Arts', 'Business'];
  const programs = ['Computer Science', 'Mechanical Engineering', 'Literature', 'Finance'];
  const availableCourses = ['Math 101', 'Physics 201', 'CS 301', 'History 101'];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('faculty, program, courses')
          .eq('id', studentId)
          .single();

        if (error) throw error;
        if (data) {
          setFaculty(data.faculty || '');
          setProgram(data.program || '');
          setCourses(data.courses || []);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch profile details');
      }
    };
    fetchProfile();
  }, [studentId]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('students')
        .update({ faculty, program, courses })
        .eq('id', studentId);

      if (error) throw error;
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

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
      <View style={styles.formContainer}>
        <Text style={styles.label}>Faculty</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={faculty}
            onValueChange={setFaculty}
            style={styles.picker}
            enabled={!loading}
          >
            <Picker.Item label="Select Faculty" value="" />
            {faculties.map((f) => (
              <Picker.Item key={f} label={f} value={f} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Program</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={program}
            onValueChange={setProgram}
            style={styles.picker}
            enabled={!loading}
          >
            <Picker.Item label="Select Program" value="" />
            {programs.map((p) => (
              <Picker.Item key={p} label={p} value={p} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Courses</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={courses}
            onValueChange={(value) => {
              if (value && !courses.includes(value)) {
                setCourses([...courses, value]);
              }
            }}
            style={styles.picker}
            enabled={!loading}
            mode="dropdown"
          >
            <Picker.Item label="Select Courses" value="" />
            {availableCourses.map((c) => (
              <Picker.Item key={c} label={c} value={c} />
            ))}
          </Picker>
        </View>
        <Text style={styles.selectedCourses}>
          Selected: {courses.length ? courses.join(', ') : 'None'}
        </Text>
        <Button
          title="Clear Courses"
          onPress={() => setCourses([])}
          disabled={loading || !courses.length}
        />
        <View style={styles.buttonContainer}>
          <Button
            title={loading ? 'Saving...' : 'Save Profile'}
            onPress={handleSaveProfile}
            disabled={loading}
          />
        </View>
      </View>
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
  formContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
    fontWeight: '500',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
  },
  picker: {
    height: 50,
  },
  selectedCourses: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  buttonContainer: {
    marginBottom: 10,
    width: '100%',
  },
});

export default StudentProfileTab;