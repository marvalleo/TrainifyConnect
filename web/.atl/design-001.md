# SDD Design - Updated Firestore Rules

**Change ID**: PROPOSAL-001
**Title**: Design for Updated Firestore Rules

## Rationale
We need to balance ease of development (MVP stage) with basic security. The current rules are blocking all creation operations. We will add specific `allow create` rules that check for authentication and ownership.

## New Rules Structure

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Auth helpers
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    // --- USERS COLLECTION ---
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }

    // --- ATHLETES COLLECTION ---
    match /athletes/{athleteId} {
      // Create: Allow if signed in and coachId matches auth.uid
      allow create: if isSignedIn() && request.resource.data.coachId == request.auth.uid;
      
      // Read: Owner (athlete) or their Coach
      allow read: if isSignedIn() && (
        isOwner(athleteId) || 
        request.auth.uid == resource.data.coachId
      );
      
      // Update: Owner or their Coach or binding email
      allow update: if isSignedIn() && (
        isOwner(athleteId) || 
        request.auth.uid == resource.data.coachId ||
        (resource.data.email == request.auth.token.email && (resource.data.uid == "" || !('uid' in resource.data)))
      );

      // Delete: Only the Coach
      allow delete: if isSignedIn() && request.auth.uid == resource.data.coachId;

      // Training Logs
      match /logs/{logId} {
        allow read: if isSignedIn() && (
          isOwner(athleteId) || 
          get(/databases/$(database)/documents/athletes/$(athleteId)).data.coachId == request.auth.uid
        );
        allow create: if isOwner(athleteId);
      }
    }

    // --- EXERCISES & ROUTINES ---
    match /exercises/{exerciseId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && request.resource.data.coachId == request.auth.uid;
      allow update, delete: if isSignedIn() && resource.data.coachId == request.auth.uid;
    }
    
    match /routines/{routineId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && request.resource.data.coachId == request.auth.uid;
      allow update, delete: if isSignedIn() && resource.data.coachId == request.auth.uid;
    }
  }
}
```

## Implementation Plan
1. Overwrite `web/firestore.rules` with the new rules.
2. Verify that `AuthContext.tsx` can now sync users.
3. Verify that `useAthletes.ts` and `useExercises.ts` can now add documents.
