import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { chatService } from '../services/chat.service';
import { User } from '../types';
import { AuthContext, AuthContextType } from '../context/AuthContext';

const NewChatScreen = () => {
  const navigation = useNavigation();
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.user;
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadUsers(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const loadUsers = async (searchTerm: string = '') => {
    try {
      setLoading(true);
      setError(null);
      const fetchedUsers = await chatService.getUsers(searchTerm);
      // Filter out the current user (can't chat with yourself)
      const filteredUsers = fetchedUsers.filter(user => user.id !== currentUser?.id);
      setUsers(filteredUsers);
    } catch (err) {
      setError('Failed to load users. Please try again later.');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserPress = async (user: User) => {
    try {
      // Use the correct method to create a direct chat room
      const chatRoom = await chatService.createDirectChatRoom(user.id);
      // Navigate back to chat tab first, then to the chat room
      navigation.navigate('Chat' as never);
      // Small delay to ensure navigation completes
      setTimeout(() => {
        navigation.navigate('ChatRoom', { roomId: chatRoom.id, title: `Chat with ${user.name}` });
      }, 100);
    } catch (error) {
      console.error('Error creating chat room:', error);
    }
  };

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity style={styles.userItem} onPress={() => handleUserPress(item)}>
      <Text style={styles.userName}>{item.name}</Text>
      <Text style={styles.userEmail}>{item.email}</Text>
    </TouchableOpacity>
  );

  if (loading && users.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (error && users.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search for a user..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>No users found</Text>
          </View>
        }
      />
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
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  searchInput: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  userItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default NewChatScreen;
