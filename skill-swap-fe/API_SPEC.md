# Skill Swap Platform API Spec

## Authentication
- JWT-based for all endpoints except signup, login, and email verification.
- Admin endpoints require admin role.



### POST `/api/user/profile-photo/`
Upload profile photo (form-data, key: `profile_photo`). Auth required.
**Request (form-data):**
```
profile_photo: <file>
```
**Response:**
```
{
  "profile_photo_url": "https://s3.amazonaws.com/bucket/profile_photos/uuid_filename.jpg"
}
```

### GET `/api/user/profile-photo/<user_id>/`
Get profile photo URL for a user.
**Response:**
```
{
  "profile_photo_url": "https://s3.amazonaws.com/bucket/profile_photos/uuid_filename.jpg"
}
```

### POST `/api/user/signup/`
**Request:**
```
{
  "email": "alice@example.com",
  "password": "Password123",
  "name": "Alice",
  "location": "NYC",
  "bio": "I teach Spanish",
  "availability": [
    {
      "day": "Monday",
      "start": "18:00",
      "end": "20:00"
    },
    {
      "day": "Saturday",
      "start": "10:00",
      "end": "12:00"
    }
  ],
  "is_public": true
}
```
**Response:**
```
{
  "id": "...uuid...",
  "email": "alice@example.com",
  "name": "Alice",
  ...other fields...
}
```

### POST `/api/user/verify-email/`
**Request:**
```
{
  "email": "alice@example.com",
  "otp": "123456"
}
```
**Response:**
```
{
  "message": "Email verified successfully."
}
```

### POST `/api/user/login/`
**Request:**
```
{
  "email": "alice@example.com",
  "password": "Password123"
}
```
**Response:**
```
{
  "access": "...jwt...",
  "refresh": "...jwt..."
}
```

### GET `/api/user/profile/`
**Response:**
```
{
  "id": "...uuid...",
  "email": "alice@example.com",
  "name": "Alice",
  "location": "NYC",
  "bio": "I teach Spanish",
  "availability": [
    {
      "day": "Monday",
      "start": "18:00",
      "end": "20:00"
    },
    {
      "day": "Saturday",
      "start": "10:00",
      "end": "12:00"
    }
  ],
  "is_public": true,
  "skills": [...],
  "ratings": [...]
}
```

### PUT `/api/user/profile/`
**Request:**
```
{
  "bio": "Updated bio",
  "location": "LA",
  "is_public": false
}
```
**Response:**
```
{
  "message": "Profile updated."
}
```

### GET `/api/user/:id/`
**Response:**
```
{
  "id": "...uuid...",
  "name": "Alice",
  "bio": "I teach Spanish",
  "skills": [...],
  "ratings": [...]
}
```


## Skill APIs

### GET `/api/skills/`
**Response:**
```
[
  {
    "id": "...uuid...",
    "name": "Python",
    "description": "I teach Python",
    "category": "Programming",
    "level": "Expert",
    "type": "offer",
    "status": "approved"
  },
  ...
]
```

### POST `/api/skills/`
**Request:**
```
{
  "name": "Python",
  "description": "I teach Python",
  "category": "Programming",
  "level": "Expert",
  "type": "offer"
}
```
**Response:**
```
{
  "id": "...uuid...",
  "status": "pending"
}
```

### PUT `/api/skills/:id/`
**Request:**
```
{
  "description": "Updated description"
}
```
**Response:**
```
{
  "message": "Skill updated."
}
```

### DELETE `/api/skills/:id/`
**Response:**
```
{
  "message": "Skill deleted."
}
```


## Swap APIs

### POST `/api/swaps/`
**Request:**
```
{
  "requester_skill_id": "...uuid...",
  "receiver_id": "...uuid...",
  "receiver_skill_id": "...uuid...",
  "proposed_time_slots": [
    {
      "day": "Saturday",
      "start": "10:00",
      "end": "12:00"
    }
  ]
}
```
**Response:**
```
{
  "id": "...uuid...",
  "status": "pending"
}
```

### GET `/api/swaps/`
**Response:**
```
[
  {
    "id": "...uuid...",
    "requester": "...uuid...",
    "receiver": "...uuid...",
    "status": "accepted",
    "proposed_time": "2025-07-15T10:00:00Z",
    "actual_time": "2025-07-15T11:00:00Z"
  },
  ...
]
```

### PUT `/api/swaps/:id/accept/`
**Response:**
```
{
  "message": "Swap accepted."
}
```

### PUT `/api/swaps/:id/reject/`
**Request:**
```
{
  "reason": "Not available at that time."
}
```
**Response:**
```
{
  "message": "Swap rejected."
}
```

### PUT `/api/swaps/:id/complete/`
**Response:**
```
{
  "message": "Swap marked as completed."
}
```

### POST `/api/ratings/`
**Request:**
```
{
  "swap_id": "...uuid...",
  "rater_id": "...uuid...",
  "rated_id": "...uuid...",
  "rating": 5,
  "comment": "Great experience!"
}
```
**Response:**
```
{
  "id": "...uuid..."
}
```


## Admin APIs

### GET `/api/admin/users/`
**Response:**
```
[
  {
    "id": "...uuid...",
    "email": "user@example.com",
    "name": "User",
    "is_banned": false,
    "role": "user"
  },
  ...
]
```

### PUT `/api/admin/users/:id/ban/`
**Request:**
```
{
  "is_banned": true
}
```
**Response:**
```
{
  "message": "User banned."
}
```

### GET `/api/admin/skills/pending/`
**Response:**
```
[
  {
    "id": "...uuid...",
    "name": "Python",
    "status": "pending"
  },
  ...
]
```

### PUT `/api/admin/skills/:id/approve/`
**Response:**
```
{
  "message": "Skill approved."
}
```

### PUT `/api/admin/skills/:id/reject/`
**Request:**
```
{
  "reason": "Spam content."
}
```
**Response:**
```
{
  "message": "Skill rejected."
}
```

### POST `/api/admin/messages/broadcast/`
**Request:**
```
{
  "message": "Platform update: new features added!"
}
```
**Response:**
```
{
  "message": "Broadcast sent."
}
```

## API Flow
1. **Signup:** User registers → receives OTP email → verifies email.
2. **Login:** User logs in → receives JWT tokens.
3. **Profile:** User sets up profile, uploads photo (S3), lists skills.
4. **Skill Listing:** User creates offers/requests → admin approves.
5. **Swap:** User proposes swap → other user accepts/rejects → both mark completMake availability a more structured field (e.g. list of time slots or a calendar).
In swap requests, allow users to propose specific time slots from their availability.e → rate each other.
6. **Admin:** Admin moderates users/skills, sends broadcasts, views analytics.

## Error Handling
- All errors return JSON: `{ "error": "message" }`
- 401 for unauthorized, 403 for forbidden, 404 for not found, 400 for bad request.

## Example Flow
- Alice signs up, verifies email, creates "Teach Spanish" skill.
- Bob signs up, verifies email, creates "Fix Laptop" skill.
- Alice proposes swap to Bob.
- Bob accepts, swap scheduled.
- Both mark swap complete, leave ratings.
- Admin reviews new skills, bans abusive users, sends updates.
