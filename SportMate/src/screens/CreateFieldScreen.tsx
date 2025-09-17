import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { useAuth } from '../hooks/useAuth';
import { fieldService } from '../services/field.service'; // Corrected import
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types'; // Assuming you have a types file for navigation

type CreateFieldScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateFieldScreen'>;

const CreateFieldScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<CreateFieldScreenNavigationProp>(); // Initialize navigation
  const [fieldName, setFieldName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [sport, setSport] = useState(''); // New state for sport
  const [price, setPrice] = useState(''); // Renamed from pricePerHour
  const [contactPhone, setContactPhone] = useState(''); // Renamed from contactPersonInfoNumber
  const [contactEmail, setContactEmail] = useState(''); // New state for contact email
  const [images, setImages] = useState(''); // Will accept a single URL string
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!fieldName || !description || !location || !sport || !price || !contactPhone || !contactEmail || !images) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }

    setIsLoading(true);
    try {
      // Corrected call to use fieldService.createField
      await fieldService.createField({
        name: fieldName,
        description,
        location,
        sport, // Added sport
        price: parseFloat(price), // Ensure price is a number
        contactPhone, // Renamed
        contactEmail, // Added
        images: [images.trim()], // Send as an array with a single URL
      });
      Alert.alert('Success', 'Field created successfully!');
      // Reset form
      setFieldName('');
      setDescription('');
      setLocation('');
      setSport(''); // Reset sport
      setPrice(''); // Reset price
      setContactPhone(''); // Reset contactPhone
      setContactEmail(''); // Reset contactEmail
      setImages(''); // Reset images
      navigation.navigate('Main', { screen: 'Home' }); // Navigate to the 'Home' tab within the 'Main' navigator
    } catch (error) {
      console.error('Error creating field:', error);
      Alert.alert('Error', 'Failed to create field. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user?.isAdmin) {
    return (
      <View style={styles.container}>
        <Text style={styles.adminMessage}>Only administrators can create fields.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create New Field</Text>
      <TextInput
        style={styles.input}
        placeholder="Field Name"
        value={fieldName}
        onChangeText={setFieldName}
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Sport Type (e.g., Football, Basketball)"
        value={sport}
        onChangeText={setSport}
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Price Per Hour"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Contact Phone Number"
        value={contactPhone}
        onChangeText={setContactPhone}
        keyboardType="phone-pad"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Contact Email"
        value={contactEmail}
        onChangeText={setContactEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Image URL"
        value={images}
        onChangeText={setImages}
        placeholderTextColor="#888"
      />
      <TouchableOpacity
        style={[styles.createButton, (isLoading || !fieldName || !description || !location || !sport || !price || !contactPhone || !contactEmail || !images) && styles.disabledCreateButton]}
        onPress={handleSubmit}
        disabled={isLoading || !fieldName || !description || !location || !sport || !price || !contactPhone || !contactEmail || !images}
      >
        <Text style={styles.createButtonText}>{isLoading ? 'Creating...' : 'Create Field'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    color: '#333',
  },
  adminMessage: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  disabledCreateButton: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateFieldScreen;
