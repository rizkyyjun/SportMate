import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Event } from '../types';
import { eventService } from '../services/event.service';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';

type EventDetailsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'EventDetails'>;
  route: { params: { eventId: string } };
};

const EventDetailsScreen: React.FC<EventDetailsScreenProps> = ({ navigation, route }) => {
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isParticipating, setIsParticipating] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const fetchedEvent = await eventService.getEventById(route.params.eventId);
        setEvent(fetchedEvent);
        if (user) {
          setIsParticipating(
            fetchedEvent.participants.some(p => p.userId === user.id && p.isAttending)
          );
        }
      } catch (err) {
        console.error('Failed to fetch event details:', err);
        setError('Failed to load event details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [route.params.eventId, user]);

  const handleJoinEvent = async () => {
    if (!user) {
      Alert.alert('Login Required', 'You need to be logged in to join an event.');
      return;
    }
    if (!event) return;

    try {
      setLoading(true);
      await eventService.joinEvent(event.id);
      setIsParticipating(true);
      Alert.alert('Success', 'You have joined the event!');
      // Optionally navigate to chat room or refresh event details
    } catch (err) {
      console.error('Failed to join event:', err);
      Alert.alert('Error', 'Failed to join event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveEvent = async () => {
    if (!user) {
      Alert.alert('Login Required', 'You need to be logged in to leave an event.');
      return;
    }
    if (!event) return;

    try {
      setLoading(true);
      await eventService.leaveEvent(event.id);
      setIsParticipating(false);
      Alert.alert('Success', 'You have left the event.');
      // Optionally refresh event details
    } catch (err) {
      console.error('Failed to leave event:', err);
      Alert.alert('Error', 'Failed to leave event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToChat = () => {
    if (event?.chatRoomId) {
      navigation.navigate('ChatRoom', { roomId: event.chatRoomId, title: event.name });
    } else {
      Alert.alert('Chat Not Available', 'This event does not have an active chat room yet.');
    }
  };

  if (loading || !event) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{event.name}</Text>
        <Text style={styles.sport}>{event.sport}</Text>
        <Text style={styles.location}>{event.location}</Text>
        <Text style={styles.dateTime}>
          {format(new Date(event.date), 'PPP')} at {event.time}
        </Text>
        <Text style={styles.participants}>
          Participants: {event.participants.length}/{event.maxParticipants}
        </Text>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{event.description}</Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {user && (
          <View style={styles.buttonContainer}>
            {isParticipating ? (
              <>
                <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveEvent}>
                  <Text style={styles.buttonText}>Leave Event</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.chatButton} onPress={handleNavigateToChat}>
                  <Text style={styles.buttonText}>Go to Chat</Text>
                </TouchableOpacity>
              </>
            ) : (
              user.id !== event.organizerId && (
                <TouchableOpacity
                  style={[
                    styles.joinButton,
                    event.participants.length >= event.maxParticipants && styles.disabledButton,
                  ]}
                  onPress={handleJoinEvent}
                  disabled={event.participants.length >= event.maxParticipants}
                >
                  <Text style={styles.buttonText}>Join Event</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  sport: {
    fontSize: 18,
    color: '#0066cc',
    marginBottom: 5,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  dateTime: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  participants: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  buttonContainer: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  joinButton: {
    backgroundColor: '#009900',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  leaveButton: {
    backgroundColor: '#cc0000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  chatButton: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default EventDetailsScreen;
