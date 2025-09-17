# Active Context

## Current Work
Implemented a feature to restrict field creation to administrators only. This involved modifying the `createField` controller function to check the `isAdmin` property of the authenticated user. Additionally, a conditional "Add New Field" button has been added to the `FieldListScreen` for administrators, which navigates to a `CreateFieldScreen`. A placeholder `CreateFieldScreen.tsx` has been created.

## Recent Changes
- Modified `backend/src/controllers/field.controller.ts` to add an `isAdmin` check before creating a new field.
- Corrected the logic to use `req.user.isAdmin` instead of a non-existent `req.user.role` property.
- Modified `SportMate/src/screens/FieldListScreen.tsx` to import `useAuth` and conditionally render an "Add New Field" button for admins, navigating to `CreateFieldScreen`.
- Updated `SportMate/src/navigation/types.ts` to include `CreateFieldScreen` in `RootStackParamList`.
- Created a placeholder `SportMate/src/screens/CreateFieldScreen.tsx` file.

## Next Steps
- The `CreateFieldScreen` component itself needs to be implemented with the actual form for creating a new field.

## Active Decisions and Considerations
- The `User` entity uses a boolean `isAdmin` property, which is now correctly utilized for authorization in both backend and frontend.
- A new screen `CreateFieldScreen` is now part of the navigation stack.

## Important Patterns and Preferences
- Role-based access control is implemented via middleware and controller checks on the backend, and context-based checks on the frontend.

## Learnings and Project Insights
- Discovered that the `User` entity uses `isAdmin` boolean for admin status, not a string `role` property. This required a correction in the authorization logic.
