# Project Brief: SportMate

## 1. Project Summary

SportMate is a social sports platform that allows users to book sports fields, find teammates or sparring partners, chat in real-time, and browse/join sports events. The goal is to create a user-friendly, high-performance mobile app that makes it easy for people to connect, play, and enjoy sports together.

## 2. Core Requirements

- **Field Booking:** Browse fields by sport, location, date, time; view availability; reserve/book a field; view booking history.
- **Find Teammates / Sparring Mate:** Post teammate requests; browse/join requests; approve/reject requests.
- **Chat:** Simple 1-on-1 chat linked to bookings or teammate requests; real-time communication via WebSocket (Socket.IO).
- **Events:** Browse sports events; join/leave events; view joined events in profile.
- **User Authentication:** Register and login with email & password; JWT-based authentication; passwords hashed with bcrypt.

## 3. Project Scope

- **In Scope:**
  - Mobile app development using React Native.
  - Backend development using Node.js (TypeScript, Express or NestJS).
  - Database design and implementation using PostgreSQL.
  - Real-time chat functionality using WebSocket (Socket.IO).
  - User authentication and authorization.
- **Out of Scope:**
  - Online payments & split bill.
  - Ratings & reviews for players and fields.
  - Group chats & team management.
  - Push notifications.
  - Gamification (loyalty points, badges).
  - AI-powered teammate matching.

## 4. Target Audience

- Casual players who want to play but lack teammates.
- Field owners/managers who want to manage bookings and promote their fields.
- Sports enthusiasts who want to discover and join events.
