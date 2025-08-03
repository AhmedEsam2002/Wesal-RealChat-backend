# 💬 Chat Application Backend

A real-time chat application backend built with Node.js, Express, MongoDB, and Socket.IO. This API provides authentication, user management, messaging, and conversation features with real-time capabilities.

## 🚀 Features

- **🔐 Authentication & Authorization**
  - JWT-based authentication
  - Password reset via email
  - Role-based access control (User/Admin)
  - Secure password hashing with bcrypt

- **👥 User Management**
  - User registration and login
  - Profile management with avatar upload
  - Online/offline status tracking
  - User search and pagination

- **💬 Real-time Messaging**
  - Instant message delivery via Socket.IO
  - Text and image message support
  - Message history and conversation management
  - Real-time online status updates

- **💭 Conversation Management**
  - Automatic conversation creation
  - Conversation history with last message
  - Participant management

- **🛡️ Security Features**
  - Rate limiting
  - Input validation and sanitization
  - CORS configuration
  - Helmet security headers
  - Error handling middleware

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Real-time:** Socket.IO
- **Authentication:** JWT (JSON Web Tokens)
- **File Upload:** Cloudinary
- **Email:** Nodemailer
- **Security:** bcrypt, helmet, rate-limit
- **Development:** Nodemon, cross-env

## 📁 Project Structure

```
backend/
├── controllers/          # Route controllers
│   ├── authController.js
│   ├── userController.js
│   ├── messageController.js
│   ├── conversationController.js
│   └── errorController.js
├── models/              # Database models
│   ├── userModel.js
│   ├── messageModel.js
│   └── conversationModel.js
├── routes/              # API routes
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── messageRoutes.js
│   └── conversationRoutes.js
├── sockets/             # Socket.IO configuration
│   └── socket.js
├── utils/               # Utility functions
│   ├── db.js
│   ├── catchAsync.js
│   ├── appError.js
│   ├── apifeatures.js
│   ├── cloudinary.js
│   └── email.js
├── docs/                # Documentation
│   └── socket-events.md
├── server.js            # Server entry point
├── app.js              # Express app configuration
├── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB database
- Cloudinary account (for image uploads)
- Email service (for password reset)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb://localhost:27017/chat-app

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=90d
   JWT_COOKIE_EXPIRES_IN=90

   # Email Configuration (for password reset)
   EMAIL_FROM=noreply@yourapp.com
   EMAIL_PASSWORD=your_email_password
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587

   # Cloudinary Configuration (for image uploads)
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Test the API:**
   - Import the Postman collection: `Chat-App-API-Collection.postman_collection.json`
   - Set the `baseUrl` variable to `http://localhost:5000`
   - Start testing the endpoints!

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/forget-password` - Send password reset email
- `PATCH /api/auth/reset-password/:token` - Reset password
- `PATCH /api/auth/update-password` - Update password

### Users
- `GET /api/user` - Get all users (paginated)
- `GET /api/user/:id` - Get user by ID
- `POST /api/user/me` - Update my profile
- `DELETE /api/user/me` - Delete my account
- `POST /api/user` - Create user (admin only)
- `PATCH /api/user/:id` - Update user (admin only)
- `DELETE /api/user/:id` - Delete user (admin only)

### Messages
- `POST /api/messages/:receiverId` - Send message
- `GET /api/messages/:receiverId` - Get messages with user

### Conversations
- `GET /api/conversations` - Get my conversations
- `GET /api/conversations/:userId` - Get conversation with user

## 🔌 Socket.IO Events

### Connection
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events
- `sendMessage` - Send a message
- `newMessage` - Receive new message
- `userOnline` - User connected
- `userOffline` - User disconnected

## 📊 Database Models

### User
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String,
  avatar: String,
  role: String, // "user" | "admin"
  online: Boolean,
  active: Boolean,
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Message
```javascript
{
  _id: ObjectId,
  sender: ObjectId, // ref: User
  receiver: ObjectId, // ref: User
  text: String,
  img: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Conversation
```javascript
{
  _id: ObjectId,
  participants: [ObjectId], // ref: User
  lastMessage: ObjectId, // ref: Message
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Testing

### Using Postman

1. Import the collection: `Chat-App-API-Collection.postman_collection.json`
2. Set environment variables:
   - `baseUrl`: `http://localhost:5000`
   - `authToken`: (will be set after login)
   - `userId`: (will be set after user creation)
   - `receiverId`: (will be set after user creation)

### Testing Flow

1. **Sign Up** - Create a new user account
2. **Login** - Get authentication token
3. **Update Profile** - Modify user information
4. **Get All Users** - View available users
5. **Send Message** - Send a message to another user
6. **Get Messages** - Retrieve conversation history
7. **Get Conversations** - View all conversations

## 🔧 Scripts

```bash
# Development
npm run dev          # Start development server with nodemon

# Production
npm start            # Start production server

# Environment
NODE_ENV=development # Development mode
NODE_ENV=production  # Production mode
```

## 🛡️ Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for password security
- **Rate Limiting** - Prevent API abuse
- **Input Validation** - Sanitize and validate all inputs
- **CORS Configuration** - Control cross-origin requests
- **Helmet Headers** - Security headers
- **Error Handling** - Centralized error management

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_EXPIRES_IN` | JWT expiration time | No |
| `EMAIL_FROM` | Email sender address | Yes |
| `EMAIL_PASSWORD` | Email password | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📚 Documentation

- [API Documentation](./API-Documentation.md) - Complete API reference
- [Socket.IO Events](./docs/socket-events.md) - Real-time events documentation
- [Postman Collection](./Chat-App-API-Collection.postman_collection.json) - API testing collection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [API Documentation](./API-Documentation.md)
2. Review the [Socket.IO Events](./docs/socket-events.md)
3. Test with the [Postman Collection](./Chat-App-API-Collection.postman_collection.json)
4. Create an issue in the repository

## 🎯 Roadmap

- [ ] Message read receipts
- [ ] File sharing
- [ ] Group conversations
- [ ] Message reactions
- [ ] Voice messages
- [ ] Video calls
- [ ] Push notifications
- [ ] Message encryption
- [ ] User blocking
- [ ] Message search

---

**Made with ❤️ using Node.js, Express, MongoDB, and Socket.IO** 