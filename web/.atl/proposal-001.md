# SDD Proposal - Fix Firestore Permissions

**ID**: PROPOSAL-001
**Title**: Fix "Missing or insufficient permissions" for Athletes, Exercises and User Sync
**Status**: DRAFT
**Author**: Antigravity

## Intent
Resolve the `FirebaseError: Missing or insufficient permissions` occurring when adding athletes, exercises, and during user login synchronization.

## Scope
- Update `web/firestore.rules` to include missing `create` and `write` permissions.
- Add rules for the `users` collection to allow profile synchronization.

## Proposed Approach
1. **Users Collection**: Add rules to allow authenticated users to read and write their own document in `/users/{userId}`.
2. **Athletes Collection**: Add `allow create` for authenticated users. The document will include a `coachId` field matching the current user's UID.
3. **Exercises Collection**: Add `allow create`, `update`, and `delete` for authenticated users.
4. **Routines Collection**: Add `allow create`, `update`, and `delete` for authenticated users.

## Risk Assessment
- **Security**: By allowing `create` to any authenticated user, we must ensure they can only manage their own data. We will use `request.auth.uid` to enforce this where possible.
- **Data Integrity**: Ensure required fields are present (optional but recommended for future).

## Alternatives Considered
- Setting rules to `allow write: if true`: Rejected. Too dangerous, leaves the database open to anyone.
- Using a Backend API: Rejected. The project is designed as a direct Firebase integration (Client-side logic).
