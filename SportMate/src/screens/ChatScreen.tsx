import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { chatService } from '../services/chat.service';
import { ChatRoom, User } from '../types';

const ChatScreen = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const navigation = useNavigation();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadChatRooms(user.id);
      }
    }, [user])
  );

  const loadChatRooms = async (currentUserId: string) => {
    try {
      setLoading(true);
      setError(null);
      const rooms = await chatService.getChatRooms(currentUserId);
      setChatRooms(rooms);
    } catch (err) {
      setError('Failed to load chat rooms. Please try again later.');
      console.error('ChatScreen: Error loading chat rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (!user) {
        setRefreshing(false);
        return;
      }
      const rooms = await chatService.getChatRooms(user.id);
      setChatRooms(rooms);
    } catch (err) {
      setError('Failed to refresh chat rooms.');
    } finally {
      setRefreshing(false);
    }
  };

  const renderChatRoom = ({ item }: { item: ChatRoom }) => {
    // For direct chats, show the other participant's name
    let chatRoomTitle = item.name || 'Chat Room';
    let otherParticipantForRoom: User | undefined = item.otherParticipant; // Use the pre-processed otherParticipant

    if (item.type === 'direct' && otherParticipantForRoom) {
      chatRoomTitle = otherParticipantForRoom.name || otherParticipantForRoom.email || 'Direct Chat';
    } else if (item.type === 'teammate' && item.name) {
      chatRoomTitle = `Teammate Chat: ${item.name}`;
    } else if (item.type === 'event' && item.name) {
      chatRoomTitle = `Event Chat: ${item.name}`;
    }
    
    // Get the latest message
    const latestMessage = item.messages.length > 0
      ? item.messages.reduce((prev, current) => (new Date(prev.createdAt) > new Date(current.createdAt)) ? prev : current)
      : null;
    
    return (
      <TouchableOpacity 
        style={styles.chatItem}
        onPress={() => navigation.navigate('ChatRoom', { 
          roomId: item.id, 
          title: chatRoomTitle, // Use the derived chatRoomTitle
          otherParticipant: otherParticipantForRoom // Pass the pre-processed otherParticipant
        })}
      >
        <Image
          source={{ uri: otherParticipantForRoom?.profilePicture }}
          style={styles.chatItemImage}
        />
        <View style={styles.chatItemContent}>
          <View style={styles.chatInfo}>
            <Text style={styles.chatName}>{chatRoomTitle}</Text>
            {otherParticipantForRoom && (
              <Text style={styles.chatEmail}>{otherParticipantForRoom.email}</Text>
            )}
            {latestMessage && (
              <Text style={styles.lastMessage} numberOfLines={1}>
                {latestMessage.sender?.id === user?.id ? 'You: ' : ''}{latestMessage.content}
              </Text>
            )}
          </View>
          {latestMessage && (
            <Text style={styles.timestamp}>
              {new Date(latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading chats...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => user && loadChatRooms(user.id)}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (chatRooms.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No chat rooms yet</Text>
          <Text style={styles.emptySubtext}>Start a conversation with other users</Text>
        </View>
        <TouchableOpacity style={styles.newChatButton} onPress={() => navigation.navigate('NewChat')}>
          <Text style={styles.newChatButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={chatRooms}
        renderItem={renderChatRoom}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity style={styles.newChatButton} onPress={() => navigation.navigate('NewChat')}>
        <Text style={styles.newChatButtonText}>+</Text>
      </TouchableOpacity>
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 10,
  },
  chatItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatItemImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  chatItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  chatEmail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginLeft: 10,
  },
  newChatButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#0066cc',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  newChatButtonText: {
    color: '#fff',
    fontSize: 30,
    lineHeight: 30,
  },
});

export default ChatScreen;
