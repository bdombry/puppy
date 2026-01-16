# 🐕 Dog Collaborators Feature - Implementation Guide

## Overview
This feature allows dog owners to share their dog with other users who can help track activities (walks, meals, incidents) in real-time.

## Architecture

### Database
- **Table**: `dog_collaborators`
  - One-to-many relationship: Dog → Multiple Collaborators
  - One-time use invitation tokens (UUID)
  - Status tracking: pending → accepted
  - 7-day expiration on pending invitations

### Key Components

#### 1. **collaboratorService.js** (`components/services/`)
Main business logic service with functions:
- `generateInviteLink(dogId, userId)` - Create invitation
- `acceptInvitation(token, userId)` - Accept invitation
- `getCollaborators(dogId, userId)` - List collaborators
- `removeCollaborator(dogId, collaboratorId, userId)` - Remove collaborator
- `isCollaborator(dogId, userId)` - Check if user has access

#### 2. **CollaboratorManager.js** (`components/`)
UI component for owners to:
- Generate invitation links
- Share via SMS/Email/Social
- Copy link to clipboard
- View active collaborators
- Remove collaborators

#### 3. **AcceptInvitationScreen.js** (`components/screens/`)
Screen shown when accepting invitation:
- Validates token & expiration
- Shows benefits of collaboration
- Accepts invitation
- Navigates to dog profile

### Invitation Flow

```
Owner generates link
    ↓
invitationUrl: pupytracker://invite/[TOKEN]
    ↓
Collaborator clicks/receives link
    ↓
Deep linking opens AcceptInvitationScreen
    ↓
User accepts invitation
    ↓
dog_collaborators.status: pending → accepted
dog_collaborators.user_id: NULL → [USER_ID]
    ↓
Full access to dog's activities
```

## Setup Instructions

### 1. Run Database Migrations

Execute these SQL files in Supabase SQL Editor:

**File 1**: `supabase_functions/create_dog_collaborators.sql`
- Creates table
- Sets up constraints
- Creates indexes

**File 2**: `supabase_functions/rls_dog_collaborators.sql`
- Enables RLS (Row Level Security)
- Policies for owner access
- Policies for collaborator access
- Policies for activities/outings/incidents shared access

### 2. Install Dependencies

```bash
npm install expo-clipboard expo-linking
```

Already installed:
- `@react-navigation/*` (for deep linking)
- `@supabase/supabase-js`

### 3. Integration Points

#### In Dog Profile / Settings Screen:
```javascript
import CollaboratorManager from '../components/CollaboratorManager';

// Add to your settings/profile screen:
<CollaboratorManager 
  dogId={currentDog.id} 
  userId={user.id} 
  dogName={currentDog.name}
/>
```

#### Checking Collaborator Access:
```javascript
import { isCollaborator } from '../components/services/collaboratorService';

const hasAccess = await isCollaborator(dogId, userId);
```

### 4. Deep Linking Configuration

Already configured in:
- `App.js`: Linking setup with `pupytracker://invite/[token]`
- `app.json`: Scheme definition for iOS/Android
- `AcceptInvitationScreen.js`: Screen component for route

## Usage Flow

### For Owner:
1. Open Dog Profile → Settings
2. Scroll to "Share with Collaborators" section
3. Click "Generate Invite Link"
4. Click "Share" to send via messaging app
5. Or click "Copy" to manually share
6. Link expires in 7 days
7. Can generate new links anytime
8. View and remove collaborators from list

### For Collaborator:
1. Receive link (SMS, email, etc.)
2. Click link → Opens PupyTracker app
3. App shows invitation details
4. Click "Accept Invitation"
5. Automatically joins dog's activities
6. Can now see & create walks, meals, incidents

## Security Features

### Row Level Security (RLS)
- Owner has full access (CRUD) on all dog collaborators
- Collaborators can only see themselves
- Only invite pending records are viewable to anyone (for acceptance flow)
- Activities/Outings/Incidents have RLS allowing owner + collaborators

### Validation
- Invitation must not be expired
- Invitation can only be used once
- User can't be invited twice for same dog
- Only owner can invite/remove

## Real-Time Features (Future Enhancement)

Currently syncs on demand. For real-time updates add:

```javascript
// In collaboratorService.js
export const subscribeToCollaborators = (dogId, callback) => {
  return supabase
    .from('dog_collaborators')
    .on('*', payload => callback(payload))
    .subscribe();
};
```

## Files Modified/Created

### Created:
- `supabase_functions/create_dog_collaborators.sql`
- `supabase_functions/rls_dog_collaborators.sql`
- `components/services/collaboratorService.js`
- `components/CollaboratorManager.js`
- `components/screens/AcceptInvitationScreen.js`
- `hooks/useClipboard.js`

### Modified:
- `App.js` - Added deep linking config
- `app.json` - Added URI schemes

## Environment Variables
No new env vars needed. Uses existing Supabase config.

## Testing Checklist

- [ ] Generate invitation link
- [ ] Share link via messaging
- [ ] Copy link to clipboard
- [ ] Click link from another device/app
- [ ] Accept invitation on new user account
- [ ] Verify collaborator appears in list
- [ ] Verify collaborator can create activities
- [ ] Remove collaborator
- [ ] Verify removed user loses access
- [ ] Test expired link (7+ days)
- [ ] Test already-used link

## Troubleshooting

### Link not opening app
- Check `pupytracker://` scheme in `app.json`
- Ensure app is installed on device
- On iOS, might need to add URL scheme to plist

### Token not found
- Ensure SQL migration was executed
- Check Supabase connection
- Verify token is valid UUID

### RLS denied access
- Run RLS policies SQL file
- Check user auth status
- Verify dog ownership

## Future Enhancements

1. **Real-time sync**: Supabase realtime subscriptions
2. **Notifications**: Alert when collaborator adds activity
3. **Activity history**: See who did what and when
4. **Role-based permissions**: viewer, editor, admin roles
5. **Expiring access**: Auto-remove after X days
6. **QR codes**: Scan to accept invitation
7. **In-app invites**: Search and invite by email/username
8. **Analytics sharing**: Choose what data collaborators see

## API Reference

### collaboratorService Functions

#### generateInviteLink(dogId, userId)
**Params:**
- `dogId` (string): UUID of the dog
- `userId` (string): UUID of the owner

**Returns:**
```javascript
{
  success: true,
  token: "uuid-string",
  invitationUrl: "pupytracker://invite/uuid-string",
  expiresAt: "2026-01-23T10:30:00Z"
}
```

#### acceptInvitation(token, userId)
**Params:**
- `token` (string): Invitation token from link
- `userId` (string): UUID of collaborator

**Returns:**
```javascript
{
  success: true,
  dogId: "dog-uuid",
  dogName: "Buddy"
}
```

#### getCollaborators(dogId, userId)
**Params:**
- `dogId` (string): UUID of the dog
- `userId` (string): UUID of owner (verification)

**Returns:**
```javascript
{
  success: true,
  collaborators: [
    {
      id: "uuid",
      user_id: "uuid",
      status: "accepted",
      created_at: "2026-01-16T10:00:00Z",
      accepted_at: "2026-01-16T10:05:00Z",
      auth_users: { email: "collaborator@example.com" }
    }
  ]
}
```

#### removeCollaborator(dogId, collaboratorId, userId)
**Params:**
- `dogId` (string): UUID of the dog
- `collaboratorId` (string): UUID of collaborator to remove
- `userId` (string): UUID of owner (verification)

**Returns:**
```javascript
{ success: true }
```

#### isCollaborator(dogId, userId)
**Params:**
- `dogId` (string): UUID of the dog
- `userId` (string): UUID of user to check

**Returns:** `true` or `false`
