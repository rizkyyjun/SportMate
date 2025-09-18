# Progress

## What Works
- User authentication is functional.
- Field creation is now restricted to administrators.
- An "Add New Field" button is conditionally displayed on the Field List screen for administrators, navigating to a `CreateFieldScreen`.
- A placeholder `CreateFieldScreen.tsx` component has been created.
- Direct chat headers in both the chat list and chat room details screen now display the recipient's username and email.
- All temporary debug logs have been removed.
- The "User" prefix has been removed from the participant list in teammate request details.
- Event creation now includes the creation of an associated chat room.
- The event organizer is no longer automatically added as an `EventParticipant` upon event creation.
- Confirmation alert has been added to the "Leave Event" button in `EventDetailsScreen.tsx`.
- The "Join Event" button visibility logic has been re-evaluated and confirmed to be correctly implemented based on the user being the organizer and their participation status.
- The "Join to Chat" button correctly redirects to the `ChatRoom` screen.
- The `ChatRoomScreen.tsx` has been reviewed and is capable of handling event-based chat rooms.
- The `Event` type has been updated to include the `organizer` object.
- The backend `getEventById` query now fetches the `organizer` relation.
- The event organizer's name and email are now displayed in `SportMate/src/screens/EventDetailsScreen.tsx`.
- The `getEvents` service now fetches the `organizer` relation.
- The event organizer's name is now displayed in `SportMate/src/screens/EventListScreen.tsx`.
- The `fetchEventDetails` function in `SportMate/src/screens/EventDetailsScreen.tsx` has been refactored with `useCallback` to fix the scope issue and ensure proper re-fetching of event details after join/leave operations.
- The backend `joinEvent` function now prevents an event organizer from joining their own event.
- The backend `createEvent` function has been updated to correctly handle time without timezone conversion.
- The `useCallback` import has been added to `SportMate/src/screens/EventDetailsScreen.tsx`.
- `useFocusEffect` has been implemented in `SportMate/src/screens/EventDetailsScreen.tsx` to ensure `isParticipating` state is refreshed on screen focus.
- The "Edit Profile" feature is now fully functional, allowing users to update their name and profile picture.
- The placeholder profile picture logic has been removed, and the app now displays the user's actual profile picture.
- Chat room integration for teammate requests is now functional. Approved users are automatically added to the chat room.
- The "Join Chat" button on the teammate request details screen is now functional and correctly displayed to approved participants.
- The `chatRoom` relation is now eagerly loaded in the `getTeammateRequestById` function, ensuring the `chatRoomId` is always available to the frontend.
- The frontend now correctly handles the nested `chatRoom` object, ensuring the "Go to Chat" button is always displayed to approved participants.
- The chat list now correctly displays chat rooms for the creator of a teammate request.
- Teammate requests and events are now sorted by creation date.
- The chat list is now correctly displayed.

## What's Left to Build
- The `CreateFieldScreen` component itself needs to be implemented with the actual form for creating a new field.
- Integrate a stable date picker solution in `EventCreationScreen.tsx` to replace the problematic `react-native-calendars`.
- Verify if the event creation crash/disconnection issue is resolved with the new date input.
- Frontend: Verify time display in `EventDetailsScreen.tsx` and `EventListScreen.tsx`.

## Current Status
- Event creation logic updated (chat room added, organizer not added as participant).
- `react-native-calendars` removed from `EventCreationScreen.tsx` and replaced with a basic `TextInput` for date.
- "Leave Event" confirmation implemented.
- `ChatRoomScreen.tsx` reviewed and appears capable of handling event chats.
- Button visibility logic for "Join Event", "Leave Event", and "Join to Chat" has been confirmed and implemented.
- Event organizer information is now displayed on both the event details and event list screens.
- Event details are now correctly refreshed after join/leave actions, resolving the button visibility issue.
- Organizer can no longer join their own event.
- Timezone issue for event creation has been addressed in the backend.
- Frontend `fetchEventDetails` scope issue resolved.
- `isParticipating` state now correctly refreshes on screen focus.
- "Edit Profile" feature implemented.
- Placeholder profile pictures removed.
- Chat room integration for teammate requests implemented.
- "Join Chat" button on teammate request details screen implemented.
- Eagerly loaded `chatRoom` relation in `getTeammateRequestById`.
- Frontend now correctly handles nested `chatRoom` object.
- Chat list now correctly displays chat rooms for the creator of a teammate request.
- Teammate requests and events are now sorted by creation date.
- The chat list is now correctly displayed.

## Known Issues
- The event creation crash/disconnection issue needs to be re-tested with the new date input.
- The frontend time display needs to be verified.

## Evolution of Project Decisions
- Role-based access control for sensitive operations like field creation has been implemented.
- UI elements for administrative actions are conditionally rendered based on user role.
- Improved chat header information for direct messages to enhance user experience.
- Refined backend data fetching for chat rooms to ensure complete participant information is always available.
- Enhanced clarity of participant display in teammate request details.
- Implemented chat room creation for events to ensure data consistency.
- Removed automatic organizer participation in events as per user request.
- Decided to replace `react-native-calendars` due to persistent native crashes on Android emulator.
- Added explicit confirmation for leaving an event to improve user experience and prevent accidental actions.
- Enhanced event details display by including organizer information for better context.
- Ensured organizer information is available and displayed in the event list for better user context.
- Refactored `fetchEventDetails` to ensure correct state updates and button visibility after user actions.
- Implemented backend validation to prevent event organizers from joining their own events.
- Corrected backend time handling to avoid timezone conversion issues during event creation.
- Fixed `useCallback` import in `EventDetailsScreen.tsx`.
- Implemented `useFocusEffect` to ensure `isParticipating` state is always up-to-date when the screen is focused.
- Implemented "Edit Profile" feature to allow users to update their profile information.
- Removed placeholder profile pictures in favor of actual user profile pictures.
- Implemented chat room integration for teammate requests to ensure seamless communication.
- Implemented "Join Chat" button on teammate request details screen to improve user experience.
- Eagerly loaded `chatRoom` relation to ensure `chatRoomId` is always available to the frontend.
- Updated frontend to correctly handle nested `chatRoom` object.
- Correctly sorted chat rooms by last message timestamp.
- Correctly sorted teammate requests and events by creation date.
