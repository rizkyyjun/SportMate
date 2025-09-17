import React, { useState } from 'react'; // Removed useEffect
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Event } from '../types';
import { useAuth } from '../hooks/useAuth';
import { eventService } from '../services/event.service';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
import { useCallback } from 'react'; // Import useCallback

type EventListScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Main'>;
};

const EventListScreen: React.FC<EventListScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const fetchedEventsResponse = await eventService.getEvents(); // Default page and limit will be used
      setEvents(fetchedEventsResponse.data);
    } catch (err) {
      setError('Failed to load events');
      console.error('Error loading events:', err); // Add more specific error logging
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies, as it only fetches events

  useFocusEffect(
    useCallback(() => {
      loadEvents();
      return () => {
        // Optional cleanup if needed when screen loses focus
      };
    }, [loadEvents]) // Depend on loadEvents
  );

  const handleCreateEvent = () => {
    navigation.navigate('EventCreation');
  };

  const handleEventPress = (event: Event) => {
    navigation.navigate('EventDetails', { eventId: event.id });
  };

  const renderItem = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => handleEventPress(item)}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.sport}>{item.sport}</Text>
      </View>

      <Text style={styles.location}>{item.location}</Text>
      <Text style={styles.dateTime}>
        {item.date} at {item.time}
      </Text>
      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.participants}>
          {item.participants.length}/{item.maxParticipants} participants
        </Text>
        {item.organizerId === user?.id && (
          <Text style={styles.organizer}>You're the organizer</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0066cc" style={styles.loader} />
      ) : (
        <>
          <FlatList
            data={events}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
          />
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateEvent}
          >
            <Text style={styles.createButtonText}>Create Event</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 10,
    paddingBottom: 80, // Space for create button
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  sport: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '500',
  },
  location: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  dateTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  participants: {
    fontSize: 14,
    color: '#009900',
    fontWeight: '500',
  },
  organizer: {
    fontSize: 14,
    color: '#0066cc',
    fontStyle: 'italic',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  createButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EventListScreen;
