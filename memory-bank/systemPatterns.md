# System Patterns: SportMate

## 1. System Architecture

The system follows a client-server architecture with clear separation of concerns:

### Frontend (React Native Mobile App)
- Presentation Layer: React Native components
- State Management: Context API or Redux
- Navigation: React Navigation
- Network Layer: Axios for REST, Socket.IO for real-time
- Type Safety: TypeScript interfaces/types

### Backend (Node.js/Express)
- API Layer: Express routes and controllers
- Business Logic: Service layer
- Data Access: TypeORM repositories
- WebSocket: Socket.IO for real-time chat
- Authentication: JWT middleware

## 2. Key Technical Decisions

### Architecture Choices
- **Monolithic Backend:** Chosen for initial development speed and simplicity
  - Easier deployment and testing
  - Simpler development workflow
  - Future possibility to split into microservices

### Database Design
- **PostgreSQL:** Selected for:
  - ACID compliance
  - Complex relationship support
  - JSON data type support
  - Full-text search capabilities
  - Robust indexing

### Authentication
- **JWT-based Authentication:**
  - Stateless authentication
  - Token expiration and refresh
  - Role-based access control
  - Secure password hashing with bcrypt

### Real-time Communication
- **WebSocket via Socket.IO:**
  - Bi-directional communication
  - Automatic reconnection
  - Room-based chat organization
  - Event-based message handling

## 3. Design Patterns

### Backend Patterns
1. **Model-View-Controller (MVC):**
   - Models: TypeORM entities
   - Views: JSON responses
   - Controllers: Request handling logic

2. **Repository Pattern:**
   - Abstract database operations
   - Centralized data access logic
   - Reusable CRUD operations

3. **Service Layer:**
   - Business logic encapsulation
   - Transaction management
   - Cross-cutting concerns

4. **Middleware Pattern:**
   - Authentication checks
   - Request validation
   - Error handling
   - Logging

### Frontend Patterns
1. **Component-Based Architecture:**
   - Reusable UI components
   - Container/Presenter pattern
   - Composition over inheritance

2. **Custom Hook Pattern:**
   - Reusable logic
   - State management
   - Side effect handling

3. **Context Provider Pattern:**
   - Global state management
   - Theme management
   - Authentication state

4. **Event-Driven Pattern:**
   - WebSocket event handling
   - UI event management
   - State updates

## 4. Database Schema

### Core Entities and Relationships

1. **User Entity:**
   ```typescript
   - id: Primary Key
   - email: Unique
   - password: Hashed
   - profile: One-to-One
   - bookings: One-to-Many
   - teammateRequests: One-to-Many
   - participations: One-to-Many
   ```

2. **Field Entity:**
   ```typescript
   - id: Primary Key
   - name: String
   - location: String
   - sportType: Enum
   - bookings: One-to-Many
   ```

3. **Booking Entity:**
   ```typescript
   - id: Primary Key
   - user: Many-to-One
   - field: Many-to-One
   - startTime: DateTime
   - endTime: DateTime
   - status: Enum
   ```

4. **TeammateRequest Entity:**
   ```typescript
   - id: Primary Key
   - creator: Many-to-One
   - sport: String
   - dateTime: DateTime
   - participants: One-to-Many
   - chatRoom: One-to-One
   ```

5. **Event Entity:**
   ```typescript
   - id: Primary Key
   - organizer: Many-to-One
   - field: Many-to-One
   - participants: One-to-Many
   - chatRoom: One-to-One
   ```

6. **ChatRoom Entity:**
   ```typescript
   - id: Primary Key
   - type: Enum
   - messages: One-to-Many
   - participants: Many-to-Many
   ```

### Relationship Rules
- Users can have multiple bookings, but each booking belongs to one user
- Fields can have multiple bookings
- TeammateRequests and Events have their own chat rooms
- Users can participate in multiple events and teammate requests
- Messages are always associated with a chat room and a sender

## 5. Critical Implementation Paths

1. **Authentication Flow:**
   - Registration with email/password → Login → JWT Token generation
   - Token storage in AsyncStorage → Access Protected Routes
   - Logout functionality with token removal

2. **Field Booking Process:**
   - Fetch fields from API → Display in list → Show details
   - Select date/time → Create booking → Show confirmation

3. **Teammate Finding:**
   - Browse requests → Create new request → Join existing requests
   - Approve/reject participants → Real-time chat integration

4. **Event Management:**
   - Browse events → Create new events → Join/leave events
   - Event details view → Participant management

5. **Chat System:**
   - Connect to WebSocket → Join Room → Send/Receive Messages
   - Real-time message updates → Typing indicators → Read receipts
   - Message persistence and history loading
