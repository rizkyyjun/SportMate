import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
  FlatList,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Event } from '../types';
import { eventService } from '../services/event.service';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect

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
  const [isJoining, setIsJoining] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);

  const fetchEventDetails = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedEvent = await eventService.getEventById(route.params.eventId);
      setEvent(fetchedEvent);
      if (user && fetchedEvent.organizer) {
        const isUserOrganizer = fetchedEvent.organizer.id === user.id;
        setIsOrganizer(isUserOrganizer);
        const userIsParticipating = fetchedEvent.participants.some(p => p.user.id === user.id && p.isAttending);
        setIsParticipating(userIsParticipating || isUserOrganizer);
      }
    } catch (err) {
      console.error('Failed to fetch event details:', err);
      setError('Failed to load event details. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [route.params.eventId, user]); // Dependencies for useCallback

  useFocusEffect(
    useCallback(() => {
      console.log('EventDetailsScreen focused, fetching details...');
      fetchEventDetails();
      return () => {
        console.log('EventDetailsScreen unfocused.');
      };
    }, [fetchEventDetails])
  );

  const handleJoinEvent = async () => {
    if (!user) {
      Alert.alert('Login Required', 'You need to be logged in to join an event.');
      return;
    }
    if (!event) return;

    try {
      setIsJoining(true);
      await eventService.joinEvent(event.id);
      Alert.alert('Success', 'You have joined the event!');
      await fetchEventDetails(); // Re-fetch event details to update state
    } catch (err) {
      console.error('Failed to join event:', err);
      Alert.alert('Error', 'Failed to join event. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveEvent = async () => {
    if (!user) {
      Alert.alert('Login Required', 'You need to be logged in to leave an event.');
      return;
    }
    if (!event) return;

    Alert.alert(
      'Leave Event',
      'Are you sure you want to leave this event?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Leave',
          onPress: async () => {
            try {
              setLoading(true);
              await eventService.leaveEvent(event.id);
              setIsParticipating(false);
              Alert.alert('Success', 'You have left the event.');
              await fetchEventDetails(); // Re-fetch event details to update state
            } catch (err) {
              console.error('Failed to leave event:', err);
              Alert.alert('Error', 'Failed to leave event. Please try again.');
            } finally {
              setLoading(false);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const handleNavigateToChat = () => {
    if (event?.chatRoom) {
      navigation.navigate('ChatRoom', { roomId: event.chatRoom.id, title: event.name });
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

        {event.organizer && (
          <View style={styles.organizerInfo}>
            <Text style={styles.sectionTitle}>Organizer</Text>
            <Text style={styles.organizerName}>{event.organizer.name}</Text>
            <Text style={styles.organizerEmail}>{event.organizer.email}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{event.description}</Text>

        <Text style={styles.sectionTitle}>Participants</Text>
        {event.participants.length > 0 ? (
          <FlatList
            data={event.participants}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.participantContainer}>
                <Image
                  source={{ uri: item.user.profilePicture }}
                  style={styles.participantImage}
                />
                <Text style={styles.participantName}>{item.user.name}</Text>
              </View>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.participantsList}
          />
        ) : (
          <Text style={styles.noParticipantsText}>No participants yet.</Text>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}

        {user && (
          <View style={styles.buttonContainer}>
            {isParticipating ? (
              <>
                {!isOrganizer && (
                  <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveEvent}>
                    <Text style={styles.buttonText}>Leave Event</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.chatButton} onPress={handleNavigateToChat}>
                  <Text style={styles.buttonText}>Go to Chat</Text>
                </TouchableOpacity>
              </>
            ) : (
              user.id !== event.organizerId && (
                <TouchableOpacity
                  style={[
                    styles.joinButton,
                    (event.participants.length >= event.maxParticipants || isJoining) && styles.disabledButton,
                  ]}
                  onPress={handleJoinEvent}
                  disabled={event.participants.length >= event.maxParticipants || isJoining}
                >
                  <Text style={styles.buttonText}>{isJoining ? 'Joining...' : 'Join Event'}</Text>
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
  organizerInfo: {
    marginTop: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  organizerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  organizerEmail: {
    fontSize: 14,
    color: '#666',
  },
  participantsList: {
    paddingVertical: 10,
  },
  participantContainer: {
    marginRight: 15,
    alignItems: 'center',
  },
  participantImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 5,
  },
  participantName: {
    fontSize: 14,
    color: '#333',
  },
  noParticipantsText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default EventDetailsScreen;
