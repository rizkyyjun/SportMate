# Tech Context: SportMate

## 1. Technologies Used

### Frontend
- **Core:**
  - React Native v0.81+
  - TypeScript v5.9+
  - React Navigation v6
- **State Management:**
  - React Context API
  - AsyncStorage for persistence
- **Networking:**
  - Axios for REST API calls
  - Socket.IO Client for real-time
- **UI/UX:**
  - React Native Paper
  - React Native Vector Icons
  - React Native Maps

### Backend
- **Core:**
  - Node.js v22+
  - TypeScript v5.9+
  - Express.js v4.18+
- **Database:**
  - PostgreSQL v14+
  - TypeORM v0.3+
- **Authentication:**
  - JSON Web Tokens (jsonwebtoken)
  - bcrypt for password hashing
- **Real-time:**
  - Socket.IO v4+
- **Validation:**
  - class-validator
  - class-transformer

## 2. Development Setup

### Prerequisites
```bash
# Required software versions
Node.js >= 16.0.0
npm >= 8.0.0
PostgreSQL >= 14.0
Android Studio (for Android)
Xcode (for iOS, Mac only)
```

### Installation Steps
1. **Backend Setup:**
   ```bash
   # Install dependencies
   cd backend
   ./install_backend_deps.bat
   
   # Configure environment
   cp .env.example .env
   
   # Database setup
   createdb sportmate
   npm run typeorm migration:run
   ```

2. **Frontend Setup:**
   ```bash
   # Install dependencies
   cd SportMate
   ./install_nav_deps.bat
   
   # Install pods (iOS only)
   cd ios && pod install
   ```

### Running the Application
1. **Backend:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

2. **Frontend:**
   ```bash
   # Android
   npm run android
   
   # iOS
   npm run ios
   ```

## 3. Technical Constraints

### Mobile App
- Minimum OS versions:
  - iOS 13+
  - Android 8+ (API level 26)
- Offline support for critical features
- Responsive design for various screen sizes
- Memory efficient image handling
- Battery-conscious location services

### Backend
- RESTful API design
- JWT expiration: 24 hours
- Rate limiting: 100 requests/minute
- File upload size: max 5MB
- WebSocket reconnection strategy
- CORS configuration for security

## 4. API Endpoints

### Authentication
```typescript
POST /api/auth/register
Body: {
  email: string
  password: string
  name: string
}
Response: {
  token: string
  user: UserDTO
}

POST /api/auth/login
Body: {
  email: string
  password: string
}
Response: {
  token: string
  user: UserDTO
}

POST /api/auth/refresh
Header: Authorization: Bearer <token>
Response: {
  token: string
}
```

### Fields
```typescript
GET /api/fields
Query: {
  sport?: string
  date?: string
  location?: string
  page?: number
  limit?: number
}
Response: {
  items: FieldDTO[]
  total: number
  page: number
}

GET /api/fields/:id
Response: FieldDTO

POST /api/fields/:id/bookings
Body: {
  startTime: string
  endTime: string
  participants?: number
}
Response: BookingDTO
```

### Bookings
```typescript
GET /api/bookings
Response: BookingDTO[]

GET /api/bookings/me
Response: BookingDTO[]

GET /api/bookings/:id
Response: BookingDTO

POST /api/bookings
Body: {
  fieldId: string
  date: string
  startTime: string
  endTime: string
}
Response: BookingDTO

PUT /api/bookings/:id
Body: {
  startTime?: string
  endTime?: string
  status?: string
}
Response: BookingDTO

PATCH /api/bookings/:id/cancel
Response: BookingDTO
```

### Teammate Requests
```typescript
GET /api/teammate-requests
Query: {
  sport?: string
  date?: string
  status?: string
  page?: number
}
Response: {
  items: TeammateRequestDTO[]
  total: number
}

POST /api/teammate-requests
Body: {
  sport: string
  dateTime: string
  location: string
  playersNeeded: number
  description: string
}
Response: TeammateRequestDTO

POST /api/teammate-requests/:id/join
Response: {
  success: boolean
  chatRoomId: string
}

PATCH /api/teammate-requests/:requestId/participants/:participantId/status
Body: {
  status: string
}
Response: TeammateParticipantDTO

DELETE /api/teammate-requests/:id/leave
Response: 204 No Content
```

### Events
```typescript
GET /api/events
Query: {
  sport?: string
  date?: string
  location?: string
  page?: number
}
Response: {
  items: EventDTO[]
  total: number
}

POST /api/events
Body: {
  title: string
  sport: string
  fieldId: string
  dateTime: string
  maxParticipants: number
  description: string
}
Response: EventDTO

POST /api/events/:id/join
Response: {
  success: boolean
  chatRoomId: string
}

DELETE /api/events/:id/leave
Response: 204 No Content
```

### Chat
```typescript
WebSocket Events:
- connect: Initial connection
- join_room: Join a chat room
- message: Send/receive message
- typing: User typing indicator
- read: Message read receipt

GET /api/chat/rooms
Response: ChatRoomDTO[]

GET /api/chat/rooms/:roomId/messages
Query: {
  before?: string
  limit?: number
}
Response: {
  messages: MessageDTO[]
  hasMore: boolean
}

POST /api/chat/rooms/direct/:userId
Response: ChatRoomDTO

POST /api/chat/rooms/:roomId/participants/:userId
Response: ChatRoomDTO

DELETE /api/chat/rooms/:roomId/participants/:userId
Response: ChatRoomDTO
```

## 5. WebSocket Events

### Chat Events
```typescript
// Join Room
socket.emit('join_room', {
  roomId: string
})

// Send Message
socket.emit('message', {
  roomId: string
  content: string
  type: 'text' | 'image'
})

// Typing Indicator
socket.emit('typing', {
  roomId: string
  isTyping: boolean
})

// Read Receipt
socket.emit('read', {
  roomId: string
  messageId: string
})
```

### Event Listeners
```typescript
// New Message
socket.on('message', (data: {
  id: string
  roomId: string
  sender: UserDTO
  content: string
  type: string
  timestamp: string
}) => void)

// Typing Status
socket.on('typing_status', (data: {
  roomId: string
  userId: string
  isTyping: boolean
}) => void)

// Read Status
socket.on('read_status', (data: {
  roomId: string
  messageId: string
  userId: string
}) => void)

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.

<environment_details>
# VSCode Visible Files
memory-bank/techContext.md

# VSCode Open Tabs
SportMate_PRD.MD
SportMate/src/services/index.ts
SportMate/src/context/index.ts
SportMate/App.tsx
backend/README.md
backend/package.json
backend/tsconfig.json
backend/.env.example
SportMate/tsconfig.json
SportMate/src/hooks/index.ts
SportMate/src/utils/index.ts
SportMate/src/assets/README.md
SportMate/src/components/FieldCard.tsx
backend/src/routes/auth.routes.ts
backend/src/controllers/auth.controller.ts
install_backend_deps.bat
SportMate/src/screens/auth/LoginScreen.tsx
SportMate/src/navigation/types.ts
SportMate/src/screens/FieldDetailsScreen.tsx
SportMate/src/screens/BookingConfirmationScreen.tsx
SportMate/src/screens/TeammateRequestListScreen.tsx
SportMate/src/screens/TeammateRequestScreen.tsx
SportMate/src/screens/TeammateDetailsScreen.tsx
SportMate/src/screens/EventCreationScreen.tsx
SportMate/src/screens/EventListScreen.tsx
memory-bank/systemPatterns.md
../../../AppData/Local/npm-cache/_logs/2025-09-08T05_31_46_876Z-debug-0.log
backend/src/config/socket.ts
backend/src/services/auth.service.ts
backend/.env
backend/src/config/data-source.ts
backend/src/config/create-database.ts
backend/src/routes/field.routes.ts
backend/src/middleware/auth.middleware.ts
backend/src/controllers/booking.controller.ts
backend/src/controllers/field.controller.ts
backend/src/controllers/teammate.controller.ts
backend/src/routes/event.routes.ts
backend/src/controllers/event.controller.ts
backend/src/routes/chat.routes.ts
backend/src/controllers/chat.controller.ts
backend/src/app.ts
memory-bank/activeContext.md
memory-bank/progress.md
memory-bank/techContext.md
backend/src/routes/booking.routes.ts
SportMate/src/screens/auth/RegisterScreen.tsx
SportMate/src/navigation/AuthNavigator.tsx
install_nav_deps.bat
SportMate/src/navigation/AppNavigator.tsx
SportMate/src/types/index.ts
SportMate/src/screens/FieldListScreen.tsx
memory-bank/projectbrief.md
memory-bank/productContext.md
backend/src/middleware/error-handler.ts
backend/src/models/user.entity.ts
backend/src/routes/teammate.routes.ts
backend/src/models/field.entity.ts
backend/src/models/booking.entity.ts
backend/src/models/teammate-request.entity.ts
backend/src/models/teammate-participant.entity.ts
backend/src/models/event.entity.ts
backend/src/models/event-participant.entity.ts
backend/src/models/chat-room.entity.ts
backend/src/models/message.entity.ts
SportMate/src/README.md
server/README.md
server/package.json
temp_install.bat
server/.env
server/index.js
SportMate/src/components/ProductCard.js
SportMate/src/screens/ProductListScreen.js
SportMate/src/navigation/AppNavigator.js
install_nav.bat
install_axios.bat
start_server.bat
server/routes/products.js
server/models/product.model.js

# Current Time
9/8/2025, 4:54:51 PM (Asia/Jakarta, UTC+7:00)

# Context Window Usage
308,698 / 1,048.576K tokens used (29%)

# Current Mode
ACT MODE
</environment_details>
