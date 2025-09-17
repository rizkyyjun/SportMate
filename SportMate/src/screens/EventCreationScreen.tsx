import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Field } from '../types';
import { useAuth } from '../hooks/useAuth';
import { eventService } from '../services/event.service';
import { fieldService } from '../services/field.service';
import { format } from 'date-fns';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Picker } from '@react-native-picker/picker';

/* --- Force English locale for Calendar --- */
LocaleConfig.locales['en'] = {
  monthNames: [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ],
  monthNamesShort: [
    'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'
  ],
  dayNames: [
    'Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'
  ],
  dayNamesShort: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
};
LocaleConfig.defaultLocale = 'en';

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
        const fetchedFieldsResponse = await fieldService.getFields(1, 1000); // Fetch all fields for the picker
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

      const dateTime = `${date}T${time}:00.000Z`; // ISO format

      await eventService.createEvent({
        title: name,
        sport,
        location, // Add location here
        fieldId: selectedFieldId,
        dateTime,
        maxParticipants: parsedMaxParticipants,
        description,
      });

      navigation.goBack();
    } catch (err) {
      console.error('Failed to create event:', err);
      setError('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const markedDates = useMemo(() => {
    return {
      [date]: {
        selected: true,
        selectedColor: '#0066cc',
      },
    };
  }, [date]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Event</Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Event Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter event name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Sport</Text>
          <TextInput
            style={styles.input}
            value={sport}
            onChangeText={setSport}
            placeholder="e.g., Soccer, Basketball, Tennis"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Enter location"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Field</Text>
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
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date</Text>
          <Calendar
            current={date}
            minDate={format(new Date(), 'yyyy-MM-dd')}
            onDayPress={(day) => {
              setDate(day.dateString);
              setError(null);
            }}
            markedDates={markedDates}
            monthFormat={'MMMM yyyy'}
            hideExtraDays={true}
            disableAllTouchEventsForDisabledDays={false}
            theme={{
              backgroundColor: '#fff',
              calendarBackground: '#fff',
              textSectionTitleColor: '#000',
              selectedDayBackgroundColor: '#0066cc',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#0066cc',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9d9d9',
              dotColor: '#0066cc',
              arrowColor: '#0066cc',
              disabledArrowColor: '#d9d9d9',
            }}
            style={styles.calendar}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Time</Text>
          <TextInput
            style={styles.input}
            value={time}
            onChangeText={setTime}
            placeholder="HH:MM"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Maximum Participants</Text>
          <TextInput
            style={styles.input}
            value={maxParticipants}
            onChangeText={setMaxParticipants}
            placeholder="Enter maximum number of participants"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your event..."
            multiline
            numberOfLines={4}
          />
        </View>

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
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20 },
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
  calendar: { borderRadius: 10, marginTop: 10, elevation: 2 },
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
