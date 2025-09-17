# SportMate Backend

This is the backend server for the SportMate application. It provides a RESTful API for the mobile app and handles real-time chat functionality using WebSockets.

## Tech Stack

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- TypeORM
- Socket.IO
- JWT Authentication

## Project Structure

```
backend/
├── src/
│   ├── controllers/    # Request handlers
│   ├── services/       # Business logic
│   ├── models/         # Data models
│   ├── middleware/     # Middleware functions
│   ├── routes/         # API route definitions
│   ├── config/         # Configuration files
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript type definitions
│   └── app.ts          # Express app setup
├── dist/               # Compiled JavaScript files
├── node_modules/       # Dependencies
├── .env                # Environment variables
├── .env.example        # Example environment variables
├── package.json        # Project metadata and dependencies
├── tsconfig.json       # TypeScript configuration
└── README.md           # Project documentation
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and update the values
4. Start the development server: `npm run dev`

## API Endpoints

- **Auth:**
  - `POST /auth/register` - Register a new user
  - `POST /auth/login` - Login a user

- **Fields:**
  - `GET /fields` - Get all fields
  - `GET /fields/:id` - Get a specific field
  - `POST /fields` - Create a new field (admin only)
  - `PUT /fields/:id` - Update a field (admin only)
  - `DELETE /fields/:id` - Delete a field (admin only)

- **Bookings:**
  - `GET /bookings` - Get all bookings (admin only)
  - `GET /bookings/me` - Get user's bookings
  - `POST /bookings` - Create a new booking
  - `GET /bookings/:id` - Get a specific booking
  - `PUT /bookings/:id` - Update a booking
  - `DELETE /bookings/:id` - Cancel a booking

- **Teammates:**
  - `GET /teammates` - Get all teammate requests
  - `POST /teammates` - Create a new teammate request
  - `GET /teammates/:id` - Get a specific teammate request
  - `POST /teammates/:id/join` - Join a teammate request
  - `PUT /teammates/:id/approve/:userId` - Approve a join request
  - `PUT /teammates/:id/reject/:userId` - Reject a join request

- **Events:**
  - `GET /events` - Get all events
  - `POST /events` - Create a new event (admin only)
  - `GET /events/:id` - Get a specific event
  - `POST /events/:id/join` - Join an event
  - `DELETE /events/:id/leave` - Leave an event

- **Chat:**
  - WebSocket connection at `/chat`
  - `GET /chat/rooms/:id/messages` - Get chat history for a room
