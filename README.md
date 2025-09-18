# SportMate

SportMate is a social sports platform that allows users to book sports fields, find teammates or sparring partners, chat in real-time, and browse/join sports events. The goal is to create a user-friendly, high-performance mobile app that makes it easy for people to connect, play, and enjoy sports together.

## Key Features

-   **Field Booking:** Browse fields by sport, location, date, and time; view availability; reserve and book a field; and view your booking history.
-   **Find Teammates / Sparring Mate:** Post teammate requests, browse and join existing requests, and approve or reject requests.
-   **Chat:** Simple 1-on-1 chat linked to bookings or teammate requests, with real-time communication via WebSocket (Socket.IO).
-   **Events:** Browse sports events, join or leave events, and view your joined events in your profile.
-   **User Authentication:** Register and log in with your email and password, with JWT-based authentication and hashed passwords for security.

## Technology Stack

### Frontend

-   **Core:** React Native, TypeScript, React Navigation
-   **State Management:** React Context API, AsyncStorage
-   **Networking:** Axios, Socket.IO Client
-   **UI/UX:** React Native Paper, React Native Vector Icons, React Native Maps

### Backend

-   **Core:** Node.js, TypeScript, Express.js
-   **Database:** PostgreSQL, TypeORM
-   **Authentication:** JSON Web Tokens (jsonwebtoken), bcrypt
-   **Real-time:** Socket.IO
-   **Validation:** class-validator, class-transformer

## Getting Started

### Prerequisites

-   Node.js >= 16.0.0
-   npm >= 8.0.0
-   PostgreSQL >= 14.0
-   Android Studio (for Android development)
-   Xcode (for iOS development on macOS)

### Installation

1.  **Backend Setup:**
    ```bash
    # Navigate to the backend directory
    cd backend

    # Install dependencies
    npm install

    # Configure environment variables
    cp .env.example .env

    # Set up the database
    createdb sportmate
    npm run typeorm migration:run
    ```

2.  **Frontend Setup:**
    ```bash
    # Navigate to the frontend directory
    cd SportMate

    # Install dependencies
    npm install

    # Install pods (for iOS only)
    cd ios && pod install
    ```

### Running the Application

1.  **Backend:**
    ```bash
    # Run in development mode
    npm run dev

    # Run in production mode
    npm run build
    npm start
    ```

2.  **Frontend:**
    ```bash
    # Run on Android
    npm run android

    # Run on iOS
    npm run ios
    ```

## Project Structure

The project is organized into two main directories:

-   `backend/`: Contains the Node.js/Express server application.
-   `SportMate/`: Contains the React Native mobile application.

## API Endpoints

For a detailed list of API endpoints, please refer to the `memory-bank/techContext.md` file.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
