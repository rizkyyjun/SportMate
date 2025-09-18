import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { chatService } from '../services/chat.service';
import { socketService } from '../services/socket.service';
import { Message, ChatRoom, User } from '../types';

type RouteParams = {
  roomId: string;
  title: string;
  otherParticipant?: User;
};

const ChatRoomScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const { roomId, otherParticipant } = route.params as RouteParams;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    let headerTitle = 'Chat Room';
    let headerSubtitle = '';

    if (otherParticipant) {
      headerTitle = otherParticipant.name || 'Unknown User';
      headerSubtitle = otherParticipant.email || '';
    }

    navigation.setOptions({ 
      headerTitle: () => (
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{headerTitle}</Text>
          {headerSubtitle ? <Text style={styles.headerSubtitle}>{headerSubtitle}</Text> : null}
        </View>
      ),
    });
  }, [navigation, otherParticipant]);

  // Load initial messages and set up socket listeners
  useEffect(() => {
    loadMessages();
    setupSocketListeners();
    
    // Join the room
    socketService.joinRoom(roomId);
    
    // Clean up on unmount
    return () => {
      socketService.leaveRoom(roomId);
      socketService.removeListener('new_message', handleNewMessage);
      socketService.removeListener('message_read', handleMessageRead);
    };
  }, [roomId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const roomMessages = await chatService.getChatRoomMessages(roomId);
      setMessages(roomMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    socketService.addListener('new_message', handleNewMessage);
    socketService.addListener('message_read', handleMessageRead);
  };

  const handleNewMessage = (message: any) => { // Use 'any' temporarily for flexibility
    // Ensure message has senderId and roomId properties, extracting from objects if necessary
    const processedMessage: Message = {
      ...message,
      senderId: message.sender?.id || message.senderId,
      roomId: message.room?.id || message.roomId,
    };

    if (processedMessage.roomId === roomId) {
      setMessages(prevMessages => [...prevMessages, processedMessage]);
      scrollToBottom();
    }
  };

  const handleMessageRead = (data: { messageId: string, userId: string }) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, isRead: true } 
          : msg
      )
    );
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;
    
    try {
      setSending(true);
      
      // Send via socket
      socketService.sendMessage(roomId, newMessage, user.id);
      
      // Clear input
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderId === user?.id;
    
    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {item.content}
          </Text>
          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
            {isOwnMessage && item.isRead && (
              <Text style={styles.readIndicator}> ✓</Text>
            )}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
        />
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!newMessage.trim() || sending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  messagesContainer: {
    padding: 10,
  },
  messageContainer: {
    marginBottom: 10,
    maxWidth: '80%',
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 15,
    padding: 12,
    marginBottom: 4,
  },
  ownMessageBubble: {
    backgroundColor: '#0066cc',
    borderBottomRightRadius: 5,
  },
  otherMessageBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
  readIndicator: {
    color: '#4CAF50',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#0066cc',
    borderRadius: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666',
  },
});

export default ChatRoomScreen;
