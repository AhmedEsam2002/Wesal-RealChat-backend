# 📱 Wesal Chat App - API Documentation

## 🏗️ Project Overview

**Wesal Chat App** is a real-time messaging application built with Node.js, Express, MongoDB, and Socket.IO. It features user authentication, real-time messaging, image sharing, and online status tracking.

### 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.IO
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Cloudinary
- **Security**: Helmet, CORS, Rate Limiting

### 🌐 Base URL

```
Development: http://localhost:5000
Production: [Your Production URL]
```

---

## 🔐 Authentication

All protected routes require authentication via JWT token in one of the following ways:

- **Header**: `Authorization: Bearer <token>`
- **Cookie**: `jwt=<token>`

### 📝 Error Response Format

```json
{
  "status": "error",
  "message": "Error description",
  "statusCode": 400
}
```

### ✅ Success Response Format

```json
{
  "status": "success",
  "data": {
    // Response data
  }
}
```

---

## 🔒 Authentication Endpoints

### 1. User Registration

**POST** `/api/auth/signup`

Register a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response (201):**

```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "_id": "60d5ecb54b24a7001f5e4d2a",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "",
      "role": "user",
      "online": false,
      "createdAt": "2021-06-25T10:30:00.000Z"
    }
  }
}
```

**Validation Rules:**

- `name`: Required, string
- `email`: Required, valid email format, unique
- `password`: Required, minimum 8 characters
- `confirmPassword`: Required, must match password

---

### 2. User Login

**POST** `/api/auth/login`

Authenticate user and receive JWT token.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "_id": "60d5ecb54b24a7001f5e4d2a",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "",
      "role": "user",
      "online": true
    }
  }
}
```

---

### 3. Forgot Password

**POST** `/api/auth/forget-password`

Send password reset email to user.

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Token sent to email!"
}
```

---

### 4. Reset Password

**PATCH** `/api/auth/reset-password/:token`

Reset user password using email token.

**URL Parameters:**

- `token`: Password reset token from email

**Request Body:**

```json
{
  "newPassword": "newpassword123",
  "confirmNewPassword": "newpassword123"
}
```

**Response (200):**

```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "_id": "60d5ecb54b24a7001f5e4d2a",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

---

### 5. Update Password

**PATCH** `/api/auth/update-password`
🔒 **Requires Authentication**

Update current user's password.

**Request Body:**

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123",
  "confirmNewPassword": "newpassword123"
}
```

**Response (200):**

```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "_id": "60d5ecb54b24a7001f5e4d2a",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

---

## 👥 User Management Endpoints

### 1. Get All Users

**GET** `/api/user`
🔒 **Requires Authentication**

Get list of all users with pagination and filtering.

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)
- `sort`: Sort by field (default: createdAt)
- `fields`: Select specific fields
- `name`: Filter by name
- `email`: Filter by email

**Example:** `/api/user?page=1&limit=5&sort=name&fields=name,email,avatar`

**Response (200):**

```json
{
  "status": "success",
  "results": 2,
  "data": {
    "users": [
      {
        "_id": "60d5ecb54b24a7001f5e4d2a",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "https://res.cloudinary.com/...",
        "online": true,
        "role": "user"
      },
      {
        "_id": "60d5ecb54b24a7001f5e4d2b",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "avatar": "",
        "online": false,
        "role": "user"
      }
    ]
  }
}
```

---

### 2. Get User by ID

**GET** `/api/user/:id`

Get specific user information by ID.

**URL Parameters:**

- `id`: User ID

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "60d5ecb54b24a7001f5e4d2a",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://res.cloudinary.com/...",
      "online": true,
      "role": "user",
      "createdAt": "2021-06-25T10:30:00.000Z"
    }
  }
}
```

---

### 3. Update My Profile

**POST** `/api/user/me`
🔒 **Requires Authentication**

Update current user's profile information.

**Request Body:**

```json
{
  "name": "John Updated",
  "email": "johnupdated@example.com",
  "avatar": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "60d5ecb54b24a7001f5e4d2a",
      "name": "John Updated",
      "email": "johnupdated@example.com",
      "avatar": "https://res.cloudinary.com/...",
      "online": true
    }
  }
}
```

**Notes:**

- `avatar`: Base64 encoded image data (will be uploaded to Cloudinary)
- Cannot update password through this endpoint
- Email must be unique

---

### 4. Delete My Account

**DELETE** `/api/user/me`
🔒 **Requires Authentication**

Deactivate current user's account (soft delete).

**Response (204):**

```json
{
  "status": "success",
  "data": null
}
```

---

### 5. Create User (Admin Only)

**POST** `/api/user`
🔒 **Requires Authentication + Admin Role**

Create a new user (admin only).

**Request Body:**

```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "role": "user"
}
```

**Response (201):**

```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "60d5ecb54b24a7001f5e4d2c",
      "name": "New User",
      "email": "newuser@example.com",
      "role": "user"
    }
  }
}
```

---

### 6. Update User (Admin Only)

**PATCH** `/api/user/:id`
🔒 **Requires Authentication + Admin Role**

Update any user's information (admin only).

**URL Parameters:**

- `id`: User ID to update

**Request Body:**

```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "admin"
}
```

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "60d5ecb54b24a7001f5e4d2a",
      "name": "Updated Name",
      "email": "updated@example.com",
      "role": "admin"
    }
  }
}
```

---

### 7. Delete User (Admin Only)

**DELETE** `/api/user/:id`
🔒 **Requires Authentication + Admin Role**

Delete any user (admin only).

**URL Parameters:**

- `id`: User ID to delete

**Response (204):**

```json
{
  "status": "success",
  "data": null
}
```

---

## 💬 Messaging Endpoints

### 1. Send Message

**POST** `/api/message/:receiverId`
🔒 **Requires Authentication**

Send a message to another user.

**URL Parameters:**

- `receiverId`: ID of the message recipient

**Request Body:**

```json
{
  "text": "Hello, how are you?",
  "img": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

**Response (201):**

```json
{
  "status": "success",
  "data": {
    "message": {
      "_id": "60d5ecb54b24a7001f5e4d2d",
      "sender": {
        "_id": "60d5ecb54b24a7001f5e4d2a",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "https://res.cloudinary.com/...",
        "online": true
      },
      "receiver": {
        "_id": "60d5ecb54b24a7001f5e4d2b",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "avatar": "",
        "online": false
      },
      "text": "Hello, how are you?",
      "img": "https://res.cloudinary.com/...",
      "createdAt": "2021-06-25T10:30:00.000Z",
      "updatedAt": "2021-06-25T10:30:00.000Z"
    }
  }
}
```

**Notes:**

- At least one of `text` or `img` must be provided
- `img`: Base64 encoded image data (will be uploaded to Cloudinary)
- Creates a conversation if it doesn't exist
- Sends real-time notification via Socket.IO if receiver is online

---

### 2. Get Messages

**GET** `/api/message/:receiverId`
🔒 **Requires Authentication**

Get all messages between current user and another user.

**URL Parameters:**

- `receiverId`: ID of the other user

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "messages": [
      {
        "_id": "60d5ecb54b24a7001f5e4d2d",
        "sender": {
          "_id": "60d5ecb54b24a7001f5e4d2a",
          "name": "John Doe",
          "email": "john@example.com",
          "avatar": "https://res.cloudinary.com/...",
          "online": true
        },
        "receiver": {
          "_id": "60d5ecb54b24a7001f5e4d2b",
          "name": "Jane Smith",
          "email": "jane@example.com",
          "avatar": "",
          "online": false
        },
        "text": "Hello, how are you?",
        "img": "",
        "createdAt": "2021-06-25T10:30:00.000Z"
      },
      {
        "_id": "60d5ecb54b24a7001f5e4d2e",
        "sender": {
          "_id": "60d5ecb54b24a7001f5e4d2b",
          "name": "Jane Smith",
          "email": "jane@example.com",
          "avatar": "",
          "online": false
        },
        "receiver": {
          "_id": "60d5ecb54b24a7001f5e4d2a",
          "name": "John Doe",
          "email": "john@example.com",
          "avatar": "https://res.cloudinary.com/...",
          "online": true
        },
        "text": "I'm doing well, thanks!",
        "img": "",
        "createdAt": "2021-06-25T10:31:00.000Z"
      }
    ]
  }
}
```

**Notes:**

- Messages are sorted by creation date (oldest first)
- Includes full sender and receiver information
- Returns empty array if no messages exist

---

## 💭 Conversation Endpoints

### 1. Get My Conversations

**GET** `/api/conversation`
🔒 **Requires Authentication**

Get all conversations for the current user.

**Response (200):**

```json
{
  "status": "success",
  "results": 2,
  "data": {
    "conversations": [
      {
        "_id": "60d5ecb54b24a7001f5e4d2f",
        "participants": [
          {
            "_id": "60d5ecb54b24a7001f5e4d2a",
            "name": "John Doe",
            "avatar": "https://res.cloudinary.com/..."
          },
          {
            "_id": "60d5ecb54b24a7001f5e4d2b",
            "name": "Jane Smith",
            "avatar": ""
          }
        ],
        "lastMessage": {
          "_id": "60d5ecb54b24a7001f5e4d2e",
          "text": "I'm doing well, thanks!",
          "img": "",
          "createdAt": "2021-06-25T10:31:00.000Z"
        },
        "createdAt": "2021-06-25T10:30:00.000Z",
        "updatedAt": "2021-06-25T10:31:00.000Z"
      }
    ]
  }
}
```

**Notes:**

- Conversations are sorted by most recent activity
- Includes participants' basic information
- Shows last message in each conversation

---

### 2. Get Conversation with User

**GET** `/api/conversation/:userId`
🔒 **Requires Authentication**

Get specific conversation between current user and another user.

**URL Parameters:**

- `userId`: ID of the other user

**Response (200):**

```json
{
  "status": "success",
  "data": {
    "conversation": {
      "_id": "60d5ecb54b24a7001f5e4d2f",
      "participants": [
        {
          "_id": "60d5ecb54b24a7001f5e4d2a",
          "name": "John Doe",
          "avatar": "https://res.cloudinary.com/..."
        },
        {
          "_id": "60d5ecb54b24a7001f5e4d2b",
          "name": "Jane Smith",
          "avatar": ""
        }
      ],
      "lastMessage": {
        "_id": "60d5ecb54b24a7001f5e4d2e",
        "text": "I'm doing well, thanks!",
        "img": "",
        "createdAt": "2021-06-25T10:31:00.000Z"
      },
      "createdAt": "2021-06-25T10:30:00.000Z",
      "updatedAt": "2021-06-25T10:31:00.000Z"
    }
  }
}
```

**Error Response (404):**

```json
{
  "status": "error",
  "message": "No conversation found"
}
```

---

## 🔌 Socket.IO Real-time Events

### Connection Setup

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: {
    token: "your-jwt-token-here",
  },
});
```

### ⚡ Key Features

- **REST API messaging** with real-time Socket.IO notifications
- **Real-time typing indicators**
- **Room-based conversations**
- **Online/offline status** tracking
- **Message delivery confirmations**
- **Automatic conversation management**

**Note**: Messages are sent via REST API (`POST /api/message/:receiverId`) and real-time notifications are handled automatically via Socket.IO.

### 📨 Client → Server Events

#### 1. Join Conversation Room

```javascript
socket.emit("joinRoom", {
  conversationId: "conversation_id_here",
});
```

#### 2. Leave Conversation Room

```javascript
socket.emit("leaveRoom", {
  conversationId: "conversation_id_here",
});
```

#### 3. Typing Indicators

```javascript
// User started typing
socket.emit("typing", {
  receiverId: "user_id_here",
});

// User stopped typing
socket.emit("stopTyping", {
  receiverId: "user_id_here",
});
```

#### 4. Request Online Users

```javascript
socket.emit("requestOnlineUsers");
```

#### 5. Message Received Confirmation

```javascript
socket.emit("messageReceived", {
  messageId: "message_id_here",
});
```

### 📬 Server → Client Events

#### 1. New Message Received

```javascript
socket.on("newMessage", (message) => {
  console.log("New message:", {
    _id: message._id,
    sender: {
      _id: message.sender._id,
      name: message.sender.name,
      avatar: message.sender.avatar,
      email: message.sender.email,
      online: message.sender.online,
    },
    receiver: {
      _id: message.receiver._id,
      name: message.receiver.name,
      avatar: message.receiver.avatar,
      email: message.receiver.email,
      online: message.receiver.online,
    },
    text: message.text,
    img: message.img, // Cloudinary URL or empty string
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  });
});
```

#### 2. User Status Changes

```javascript
// User comes online
socket.on("userOnline", ({ userId }) => {
  console.log("User online:", userId);
});

// User goes offline
socket.on("userOffline", ({ userId }) => {
  console.log("User offline:", userId);
});
```

#### 3. Typing Indicators

```javascript
// User started typing
socket.on("userTyping", ({ userId }) => {
  console.log("User typing:", userId);
});

// User stopped typing
socket.on("userStoppedTyping", ({ userId }) => {
  console.log("User stopped typing:", userId);
});
```

#### 4. Online Users List

```javascript
socket.on("onlineUsers", ({ users }) => {
  console.log("Online users:", users); // Array of user IDs
});
```

#### 5. Message Confirmations

```javascript
// Message sent successfully (with full message data)
socket.on("messageSent", ({ messageId, timestamp, message }) => {
  console.log("Message sent successfully:", {
    messageId: messageId,
    timestamp: timestamp,
    fullMessage: message, // Complete message object with populated sender/receiver
  });
});

// Message error
socket.on("messageError", ({ error, details }) => {
  console.error("Message error:", error);
  console.error("Error details:", details);
});
```

#### 6. Message Received Confirmation

```javascript
socket.on("messageReceived", ({ messageId }) => {
  console.log("Message received confirmation:", messageId);
});
```

---

## 🛡️ Security Features

### 1. Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Scope**: All `/api/*` routes
- **Response**: `429 Too Many Requests`

### 2. CORS Configuration

```javascript
{
  origin: "*", // Allow all origins (configure for production)
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}
```

### 3. Security Headers (Helmet)

- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- And more...

### 4. Input Validation

- Email format validation
- Password strength requirements
- Required field validation
- Data sanitization

---

## 📊 Data Models

### User Model

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  avatar: String (Cloudinary URL),
  role: String (enum: ['user', 'admin'], default: 'user'),
  online: Boolean (default: false),
  active: Boolean (default: true),
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model

```javascript
{
  _id: ObjectId,
  sender: ObjectId (ref: 'User'),
  receiver: ObjectId (ref: 'User'),
  text: String (optional),
  img: String (Cloudinary URL, optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Conversation Model

```javascript
{
  _id: ObjectId,
  participants: [ObjectId] (ref: 'User', exactly 2),
  lastMessage: ObjectId (ref: 'Message'),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚨 Error Codes

| Status Code | Description           |
| ----------- | --------------------- |
| 200         | Success               |
| 201         | Created               |
| 204         | No Content            |
| 400         | Bad Request           |
| 401         | Unauthorized          |
| 403         | Forbidden             |
| 404         | Not Found             |
| 429         | Too Many Requests     |
| 500         | Internal Server Error |

---

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/wesal-chat

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## 🚀 Getting Started

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd backend

# Install dependencies
npm install
# or
pnpm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 3. Database Setup

```bash
# Make sure MongoDB is running
mongod

# The app will create collections automatically
```

### 4. Run the Application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 5. Testing

Import the Postman collection: `Chat-App-API-Collection.postman_collection.json`

---

## 📋 API Testing Examples

### Using curl

#### 1. Register a new user

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

#### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### 3. Get all users (with token)

```bash
curl -X GET http://localhost:5000/api/user \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 4. Send a message

```bash
curl -X POST http://localhost:5000/api/message/RECEIVER_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello from API!"
  }'
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support

For support and questions:

- Create an issue in the repository
- Contact the development team

---

## 📄 License

This project is licensed under the ISC License.

---

**Last Updated**: August 3, 2025
**API Version**: 1.0.0
