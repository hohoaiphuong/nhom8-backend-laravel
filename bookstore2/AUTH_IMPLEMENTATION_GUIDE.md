# Authentication System - Implementation Guide

## Overview
The bookstore authentication system uses **token-based API authentication** with random 80-character tokens stored in the database.

## Database Schema
```sql
-- users table (nguoi_dung)
- id (INT, PRIMARY KEY)
- ten (VARCHAR 100) - Full name
- email (VARCHAR 100, UNIQUE)
- mat_khau (VARCHAR 255) - Hashed password
- so_dien_thoai (VARCHAR 15) - Phone number (nullable)
- vai_tro (ENUM) - Role: 'nguoi_dung' (user) or 'admin'
- api_token (VARCHAR 80) - Generated token for API authentication
- ngay_tao (TIMESTAMP) - Created date
```

## API Endpoints

### Public Endpoints (No authentication required)

#### 1. Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "ten": "Nguyễn Văn A",
  "email": "user@gmail.com",
  "mat_khau": "password123",
  "so_dien_thoai": "0123456789" (optional)
}

Response (201):
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "ten": "Nguyễn Văn A",
    "email": "user@gmail.com",
    "api_token": "random_80_char_token",
    "vai_tro": "nguoi_dung"
  }
}
```

#### 2. Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@gmail.com",
  "mat_khau": "password123"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "ten": "Nguyễn Văn A",
    "email": "user@gmail.com",
    "api_token": "random_80_char_token",
    "vai_tro": "nguoi_dung"
  }
}

Error (401):
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Protected Endpoints (Requires Bearer Token)

#### 3. Get Current User Profile
```
GET /api/user
Authorization: Bearer {api_token}

Response (200):
{
  "success": true,
  "data": {
    "id": 1,
    "ten": "Nguyễn Văn A",
    "email": "user@gmail.com",
    "so_dien_thoai": "0123456789",
    "vai_tro": "nguoi_dung"
  }
}
```

#### 4. Change Password
```
POST /api/change-password
Authorization: Bearer {api_token}
Content-Type: application/json

{
  "mat_khau_cu": "old_password",
  "mat_khau_moi": "new_password_123",
  "mat_khau_moi_confirm": "new_password_123"
}

Response (200):
{
  "success": true,
  "message": "Password changed successfully"
}
```

#### 5. Logout
```
POST /api/auth/logout
Authorization: Bearer {api_token}

Response (200):
{
  "success": true,
  "message": "Logout successful"
}
```

#### 6. Get User Profile by ID
```
GET /api/auth/profile/{id}

Response (200):
{
  "id": 1,
  "ten": "Nguyễn Văn A",
  ...
}
```

#### 7. Update User Profile
```
PUT /api/auth/profile/{id}
Content-Type: application/json

{
  "ten": "New Name",
  "so_dien_thoai": "0987654321"
}

Response (200):
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ... }
}
```

## Frontend Usage

### Login Component
```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';

const handleLogin = async (email, password) => {
  try {
    const response = await authApi.login({
      email,
      mat_khau: password
    });
    
    if (response.data.success) {
      const { id, api_token } = response.data.data;
      localStorage.setItem('token', api_token);
      localStorage.setItem('userId', id);
      navigate('/');
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Logout Component
```jsx
import { useLogout } from '../../hooks/useLogout';

const Header = () => {
  const { logout } = useLogout();
  
  return (
    <button onClick={logout}>
      Đăng xuất
    </button>
  );
};
```

### Protected API Calls
```jsx
import client from './client';

// The token is automatically added to all requests via interceptor
const getUserProfile = async () => {
  const response = await client.get('/user');
  return response.data;
};

const changePassword = async (oldPass, newPass) => {
  const response = await client.post('/change-password', {
    mat_khau_cu: oldPass,
    mat_khau_moi: newPass,
    mat_khau_moi_confirm: newPass
  });
  return response.data;
};
```

## Authentication Flow

### Registration
1. User fills registration form (name, email, password, phone)
2. Frontend validates input locally
3. Sends POST to `/api/auth/register`
4. Backend validates and creates user with random token
5. Token returned to frontend
6. Frontend stores token in localStorage
7. Auto-login and redirect to homepage

### Login
1. User enters email and password
2. Frontend validates
3. Sends POST to `/api/auth/login`
4. Backend verifies credentials and generates new token
5. Token returned to frontend
6. Frontend stores token in localStorage
7. API client automatically adds token to all subsequent requests

### Protected Requests
1. Frontend needs to make authenticated request
2. API client reads token from localStorage
3. Token added as `Authorization: Bearer {token}` header
4. Backend middleware validates token
5. User authenticated for that request

### Logout
1. User clicks logout button
2. Frontend optionally calls POST `/api/auth/logout` to invalidate token
3. Frontend clears localStorage (token, userId, user)
4. Frontend redirects to login page

## Error Handling

### Validation Errors (422)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["The email has already been taken"],
    "mat_khau": ["The password must be at least 6 characters"]
  }
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "User not found"
}
```

## Security Notes

1. **Password Storage**: Passwords are hashed using Laravel's `Hash::make()` (bcrypt)
2. **Token Generation**: 80-character random tokens prevent brute force
3. **HTTPS**: Should use HTTPS in production for token transmission
4. **Token Rotation**: New token generated on each login
5. **CORS**: Configured to allow cross-origin requests
6. **Bearer Token**: Sent in Authorization header, not in URL

## Testing Credentials

```
Admin User:
- Email: admin@gmail.com
- Password: hashed in database

Regular User:
- Email: user@gmail.com
- Password: hashed in database
```

## Common Issues & Solutions

### Issue: "Unauthorized - Token required"
**Cause**: Token not sent in request header
**Solution**: Ensure token is in localStorage and API client interceptor is working

### Issue: "Invalid token"
**Cause**: Token has been cleared or is invalid
**Solution**: User needs to login again

### Issue: Email already taken
**Cause**: Email exists in database
**Solution**: Use unique email or implement password reset

### Issue: Non-admin user accessing admin panel
**Cause**: vai_tro !== 'admin'
**Solution**: Admin login validates vai_tro field and blocks non-admins
