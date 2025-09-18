import { Server } from 'socket.io';
import { AppDataSource } from './data-source';
import { Message } from '../models/message.entity';
import { ChatRoom } from '../models/chat-room.entity';

export const setupSocketIO = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle joining a room
    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // Handle leaving a room
    socket.on('leave_room', (roomId: string) => {
      socket.leave(roomId);
      console.log(`Socket ${socket.id} left room ${roomId}`);
    });

// Handle sending a message
    socket.on('send_message', async (messageData: any) => {
      try {
        console.log('Received message data:', messageData);
        const messageRepository = AppDataSource.getRepository(Message);
        const chatRoomRepository = AppDataSource.getRepository(ChatRoom);

        // Verify the chat room exists
        const chatRoom = await chatRoomRepository.findOne({
          where: { id: messageData.roomId }
        });

        if (!chatRoom) {
          console.log('Chat room not found:', messageData.roomId); // Debug log
          socket.emit('error', { message: 'Chat room not found' });
          return;
        }

        // Create and save the message
        const message = messageRepository.create({
          content: messageData.content,
          sender: { id: messageData.senderId } as any,
          room: chatRoom,
          isRead: false,
          timestamp: new Date(messageData.timestamp), // Assign to the 'timestamp' column
          createdAt: new Date() // Let TypeORM handle createdAt or explicitly set it
        });

        const savedMessage = await messageRepository.save(message);
        console.log('Message saved to database:', savedMessage); // Debug log

        // Broadcast the message to the room
        io.to(messageData.roomId).emit('new_message', savedMessage);
        console.log('Message broadcasted to room:', messageData.roomId);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle marking message as read
    socket.on('mark_message_read', async (data: { messageId: string, userId: string }) => {
      try {
        const messageRepository = AppDataSource.getRepository(Message);
        
        const message = await messageRepository.findOne({
          where: { id: data.messageId }
        });

        if (message && message.sender.id !== data.userId) {
          message.isRead = true;
          await messageRepository.save(message);
          
          // Notify the sender that their message was read
          io.to(message.room.id).emit('message_read', {
            messageId: data.messageId,
            userId: data.userId
          });
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};
