# SDD Spec - Firestore Security Rules

**Change ID**: PROPOSAL-001
**Title**: Firestore Security Rules Specification

## Requirements
- Authenticated users MUST be able to create and update their own user profile in the `users` collection.
- Authenticated users (Coaches) MUST be able to create athletes in the `athletes` collection.
- Coaches MUST be able to read, update, and delete athletes where they are the assigned coach (`coachId == auth.uid`).
- Athletes MUST be able to read their own data.
- Coaches MUST be able to create, read, update, and delete exercises and routines where they are the owner.

## Scenarios

### Scenario 1: User Login Sync
- **GIVEN** a user is authenticated via Google.
- **WHEN** the app tries to create/update their document in `/users/{uid}`.
- **THEN** Firestore MUST allow the operation if the `uid` matches the `auth.uid`.

### Scenario 2: Adding an Athlete
- **GIVEN** a Coach is authenticated.
- **WHEN** they call `addDoc(collection(db, "athletes"), { coachId: auth.uid, ... })`.
- **THEN** Firestore MUST allow the creation.

### Scenario 3: Managing Exercises
- **GIVEN** a Coach is authenticated.
- **WHEN** they create an exercise with `coachId` matching their UID.
- **THEN** Firestore MUST allow the operation.

### Scenario 4: Unauthorized Access
- **GIVEN** a user is NOT authenticated.
- **WHEN** they try to read or write any collection.
- **THEN** Firestore MUST deny the operation.
