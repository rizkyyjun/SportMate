import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { TeammateRequest } from '../types';
import { teammateService } from '../services/teammate.service';

type TeammateRequestListScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Main'>;
};

const TeammateRequestListScreen: React.FC<TeammateRequestListScreenProps> = ({ navigation }) => {
  const [requests, setRequests] = useState<TeammateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTeammateRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const fetchedRequests = await teammateService.getTeammateRequests();
      setRequests(fetchedRequests);
    } catch (err) {
      setError('Failed to load teammate requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTeammateRequests();
    }, [loadTeammateRequests])
  );

  const handleCreateRequest = () => {
    navigation.navigate('TeammateRequest');
  };

  const handleRequestPress = (request: TeammateRequest) => {
    navigation.navigate('TeammateDetails', { requestId: request.id });
  };

  const renderItem = ({ item }: { item: TeammateRequest }) => (
    <TouchableOpacity
      style={styles.requestCard}
      onPress={() => handleRequestPress(item)}
    >
      <View style={styles.header}>
        <Text style={styles.sport}>{item.sport}</Text>
        <Text style={styles.participants}>
          {item.requiredParticipants - item.participants.filter(p => p.status === 'approved').length} spots left
        </Text>
      </View>

      <Text style={styles.location}>{item.location}</Text>
      <Text style={styles.dateTime}>
        {item.date} at {item.time}
      </Text>
      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>
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
            data={requests}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
          />
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateRequest}
          >
            <Text style={styles.createButtonText}>Create Request</Text>
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
  requestCard: {
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
  sport: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  participants: {
    fontSize: 14,
    color: '#009900',
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

export default TeammateRequestListScreen;
