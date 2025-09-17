import React, { useState, useMemo } from 'react';
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
import { useAuth } from '../hooks/useAuth';
import { teammateService } from '../services/teammate.service';
import { format } from 'date-fns';
import { Calendar, LocaleConfig } from 'react-native-calendars';

/* --- Force English locale (same as FieldDetailsScreen) --- */
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

type TeammateRequestScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'TeammateRequest'>;
};

const TeammateRequestScreen: React.FC<TeammateRequestScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sport, setSport] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [requiredParticipants, setRequiredParticipants] = useState('');
  const [error, setError] = useState<string | null>(null);

  const markedDates = useMemo(() => {
    return {
      [date]: {
        selected: true,
        selectedColor: '#0066cc',
        selectedTextColor: '#fff',
      },
    };
  }, [date]);

  const handleCreateRequest = async () => {
    if (!user) {
      setError('You must be logged in to create a teammate request.');
      return;
    }

    if (!sport || !location || !date || !time || !requiredParticipants) {
      setError('Please fill in all fields');
      return;
    }

    const parsedRequiredParticipants = Number(requiredParticipants);
    if (isNaN(parsedRequiredParticipants) || parsedRequiredParticipants < 1) {
      setError('Please enter a valid number of required participants (minimum 1)');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const dateTime = `${date}T${time}:00.000Z`; // UTC ISO format

      await teammateService.createTeammateRequest({
        sport,
        location,
        dateTime,
        playersNeeded: parsedRequiredParticipants,
        description,
      });

      navigation.goBack();
    } catch (err) {
      console.error('Failed to create teammate request:', err);
      setError('Failed to create request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Teammate Request</Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

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
            firstDay={0}
            hideExtraDays={true}
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
          <Text style={styles.label}>Time (HH:mm)</Text>
          <TextInput
            style={styles.input}
            value={time}
            onChangeText={setTime}
            placeholder="e.g., 18:00"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Required Participants</Text>
          <TextInput
            style={styles.input}
            value={requiredParticipants}
            onChangeText={setRequiredParticipants}
            placeholder="Enter number of participants needed"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe what kind of teammates you're looking for..."
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={[styles.createButton, loading && styles.disabledButton]}
          onPress={handleCreateRequest}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>Create Request</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  createButton: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  calendar: {
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
});

export default TeammateRequestScreen;
