import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { TeammateRequest, TeammateParticipant, ParticipantStatus } from '../types';
import { useAuth } from '../hooks/useAuth';
import { teammateService } from '../services/teammate.service';
import { format } from 'date-fns';

type TeammateDetailsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'TeammateDetails'>;
  route: { params: { requestId: string } };
};

const TeammateDetailsScreen: React.FC<TeammateDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const { user } = useAuth();
  const [request, setRequest] = useState<TeammateRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRequestDetails();
  }, [route.params.requestId, user]);

  const loadRequestDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedRequest = await teammateService.getTeammateRequestById(route.params.requestId);
      setRequest(fetchedRequest);
    } catch (err) {
      console.error('Failed to load request details:', err);
      setError('Failed to load request details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async () => {
    if (!user) {
      setError('You must be logged in to join a teammate request.');
      return;
    }
    if (!request) return;

    try {
      setJoining(true);
      setError(null);
      await teammateService.joinTeammateRequest(request.id);
      await loadRequestDetails(); // Reload details to update participants
    } catch (err: any) { // Added 'any' type for err to access properties
      console.error('Failed to join request:', err);
      // Attempt to extract specific error message from backend
      const errorMessage = err.response?.data?.message || 'Failed to join request. Please try again.';
      setError(errorMessage);
    } finally {
      setJoining(false);
    }
  };

  const handleApproveParticipant = async (participantId: string) => {
    if (!request) return;
    try {
      setError(null);
      await teammateService.updateTeammateParticipantStatus(
        request.id,
        participantId,
        ParticipantStatus.APPROVED
      );
      await loadRequestDetails(); // Reload details
    } catch (err) {
      console.error('Failed to approve participant:', err);
      setError('Failed to approve participant.');
    }
  };

  const handleRejectParticipant = async (participantId: string) => {
    if (!request) return;
    try {
      setError(null);
      await teammateService.updateTeammateParticipantStatus(
        request.id,
        participantId,
        ParticipantStatus.REJECTED
      );
      await loadRequestDetails(); // Reload details
    } catch (err) {
      console.error('Failed to reject participant:', err);
      setError('Failed to reject participant.');
    }
  };

  const handleNavigateToChat = () => {
    if (request?.chatRoomId) {
      navigation.navigate('ChatRoom', { roomId: request.chatRoomId, title: request.sport });
    } else {
      setError('Chat not available for this request yet.');
    }
  };

  const getParticipantStatusStyle = (status: ParticipantStatus) => {
    switch (status) {
      case ParticipantStatus.PENDING:
        return styles.participantStatusPending;
      case ParticipantStatus.APPROVED:
        return styles.participantStatusApproved;
      case ParticipantStatus.REJECTED:
        return styles.participantStatusRejected;
      default:
        return {}; // Default empty style
    }
  };

  if (loading || !request) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  const isCreator = user?.id === request.creator?.id; // Changed from request.creatorId to request.creator?.id
  const userParticipant = request.participants.find(p => p.userId === user?.id);
  const isParticipant = !!userParticipant;
  const spotsLeft = request.requiredParticipants - request.participants.filter(p => p.status === ParticipantStatus.APPROVED).length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {error && <Text style={styles.errorText}>{error}</Text>}
        <View style={styles.header}>
          <Text style={styles.sport}>{request.sport}</Text>
          <Text style={styles.spots}>{spotsLeft} spots left</Text>
        </View>

        <Text style={styles.location}>{request.location}</Text>
        <Text style={styles.dateTime}>
          {format(new Date(request.date), 'PPP')} at {request.time}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{request.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Participants</Text>
          {request.participants.length === 0 ? (
            <Text>No participants yet.</Text>
          ) : (
            request.participants.map((participant) => (
                <View key={participant.id} style={styles.participant}>
                <View>
                  <Text style={styles.participantName}>
                    User {participant.user?.name || participant.userId}{' '}
                    <Text style={getParticipantStatusStyle(participant.status)}>
                      {participant.status.charAt(0).toUpperCase() + participant.status.slice(1)}
                    </Text>
                  </Text>
                  {participant.user?.email && (
                    <Text style={styles.participantEmail}>Email: {participant.user.email}</Text>
                  )}
                  {participant.message && (
                    <Text style={styles.participantMessage}>{participant.message}</Text>
                  )}
                </View>
                {isCreator && participant.status === ParticipantStatus.PENDING && (
                  <View style={styles.participantActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => handleApproveParticipant(participant.id)}
                    >
                      <Text style={styles.actionButtonText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleRejectParticipant(participant.id)}
                    >
                      <Text style={styles.actionButtonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {user && !isCreator && !isParticipant && !user?.isAdmin && request.isActive && spotsLeft > 0 && (
          <TouchableOpacity
            style={[styles.joinButton, joining && styles.disabledButton]}
            onPress={handleJoinRequest}
            disabled={joining || user?.isAdmin}
          >
            {joining ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.joinButtonText}>Join Request</Text>
            )}
          </TouchableOpacity>
        )}

        {user && isParticipant && userParticipant?.status === ParticipantStatus.APPROVED && request.chatRoomId && (
          <TouchableOpacity
            style={styles.chatButton}
            onPress={handleNavigateToChat}
          >
            <Text style={styles.buttonText}>Go to Chat</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
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
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sport: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  spots: {
    fontSize: 16,
    color: '#009900',
    fontWeight: '500',
  },
  location: {
    fontSize: 18,
    color: '#333',
    marginBottom: 5,
  },
  dateTime: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  participant: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  participantName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  participantEmail: { // Added style for email
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  participantMessage: {
    fontSize: 14,
    color: '#666',
  },
  status: { // Added base status style
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  participantActions: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 8,
  },
  approveButton: {
    backgroundColor: '#009900',
  },
  rejectButton: {
    backgroundColor: '#cc0000',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  participantStatusPending: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  participantStatusApproved: {
    backgroundColor: '#d4edda',
    color: '#155724',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  participantStatusRejected: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  joinButton: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  chatButton: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TeammateDetailsScreen;
