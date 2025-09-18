import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Field } from '../types';
import { useAuth } from '../hooks/useAuth';
import { eventService } from '../services/event.service';
import { fieldService } from '../services/field.service';
import { format } from 'date-fns';
import { Picker } from '@react-native-picker/picker'; // Keep Picker

// Removed Calendar and LocaleConfig as it's causing crashes

type EventCreationScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'EventCreation'>;
};

const EventCreationScreen: React.FC<EventCreationScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [sport, setSport] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const fetchedFieldsResponse = await fieldService.getFields(1, 1000);
        setFields(fetchedFieldsResponse.data);
        if (fetchedFieldsResponse.data.length > 0) {
          setSelectedFieldId(fetchedFieldsResponse.data[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch fields:', err);
        setError('Failed to load fields for selection.');
      }
    };
    fetchFields();
  }, []);

  const handleCreateEvent = async () => {
    if (!user) {
      setError('You must be logged in to create an event.');
      return;
    }

    if (!name || !sport || !location || !date || !time || !maxParticipants || !selectedFieldId) {
      setError('Please fill in all fields and select a field');
      return;
    }

    const parsedMaxParticipants = Number(maxParticipants);
    if (isNaN(parsedMaxParticipants) || parsedMaxParticipants < 2) {
      setError('Please enter a valid number of participants (minimum 2)');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const dateTime = `${date}T${time}:00.000Z`;

      await eventService.createEvent({
        title: name,
        sport,
        location,
        fieldId: selectedFieldId,
        dateTime,
        maxParticipants: parsedMaxParticipants,
        description,
      });

      console.log('Event created successfully:', {
        title: name,
        sport,
        location,
        fieldId: selectedFieldId,
        dateTime,
        maxParticipants: parsedMaxParticipants,
        description,
      });

      navigation.goBack();

    } catch (err: any) {
      console.error('Failed to create event:', err);
      setError(err.message || 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Removed markedDates as Calendar is removed
  // const markedDates = useMemo(() => {
  //   return {
  //     [date]: {
  //       selected: true,
  //       selectedColor: '#0066cc',
  //       selectedTextColor: '#fff',
  //     },
  //   };
  // }, [date]);

  const formFields = [
    { key: 'name', label: 'Event Name', placeholder: 'Enter event name', value: name, setter: setName },
    { key: 'sport', label: 'Sport', placeholder: 'e.g., Soccer, Basketball, Tennis', value: sport, setter: setSport },
    { key: 'location', label: 'Location', placeholder: 'Enter location', value: location, setter: setLocation },
    { key: 'field', label: 'Field' },
    { key: 'date', label: 'Date', placeholder: 'YYYY-MM-DD', value: date, setter: setDate, type: 'text' }, // Changed to TextInput
    { key: 'time', label: 'Time', placeholder: 'HH:MM', value: time, setter: setTime },
    { key: 'maxParticipants', label: 'Maximum Participants', placeholder: 'Enter maximum number of participants', value: maxParticipants, setter: setMaxParticipants, keyboardType: 'numeric' },
    { key: 'description', 'label': 'Description', placeholder: 'Describe your event...', value: description, setter: setDescription, multiline: true },
  ];

  const renderItem = useCallback(({ item }: { item: any }) => {
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{item.label}</Text>
        {item.key === 'field' ? (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedFieldId}
              onValueChange={(itemValue: string | null) => setSelectedFieldId(itemValue)}
              style={styles.picker}
            >
              {fields.map((fieldItem) => (
                <Picker.Item key={fieldItem.id} label={fieldItem.name} value={fieldItem.id} />
              ))}
            </Picker>
          </View>
        ) : (
          <TextInput
            style={[styles.input, item.multiline && styles.textArea]}
            value={item.value}
            onChangeText={item.setter}
            placeholder={item.placeholder}
            keyboardType={item.keyboardType || 'default'}
            multiline={item.multiline}
            numberOfLines={item.multiline ? 4 : 1}
          />
        )}
      </View>
    );
  }, [selectedFieldId, fields, date, name, sport, location, time, maxParticipants, description]); // Updated dependencies

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <FlatList
        data={formFields}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Create Event</Text>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </>
        }
        ListFooterComponent={
          <TouchableOpacity
            style={[styles.createButton, loading && styles.disabledButton]}
            onPress={handleCreateEvent}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Create Event</Text>
            )}
          </TouchableOpacity>
        }
        contentContainerStyle={styles.content}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  content: { padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 16, fontWeight: '500', marginBottom: 5, color: '#333' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  createButton: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: { backgroundColor: '#ccc' },
  createButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 10 },
  // Removed calendar style
  // calendar: { borderRadius: 10, marginTop: 10, elevation: 2 },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: { height: 50, width: '100%' },
});

export default EventCreationScreen;
