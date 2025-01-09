# Project Documentation 📚

## Introduction 🎉
This project is a Node.js application with MongoDB integration, designed to handle user conversations, messaging, and subscription management. It provides a robust backend infrastructure for managing user interactions, personalization, and subscription plans.

## Project Structure 🗂️
```
src/
├── config/
├── controllers/
├── cron/
├── docs/
├── middlewares/
├── models/
├── routes/
├── services/
├── utils/
├── validations/
├── app.js
└── index.js
```

## Database Models 📦

### User Model 👤
The User model manages user information and authentication.

```javascript
const userSchema = mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    trim: true,
  },
  lastname: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Invalid email'],
  },
  // ... other fields
});
```

Key Features:
- Email validation using validator
- Password requirements (minimum 8 characters, must contain letters and numbers)
- Daily token limit tracking
- Email verification system

### Conversation Model 💬
Manages user conversations and topics.

```javascript
const conversationSchema = mongoose.Schema({
  start_date: {
    type: Date,
    default: Date.now()
  },
  conversation_title: String,
  topicid: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Topic',
    required: true,
  },
  userid: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true });
```

### Message Model 📝
Handles individual messages within conversations.

```javascript
const messageSchema = mongoose.Schema({
  conversationid: {
    type: mongoose.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  content: {
    type: String,
    default: '',
  },
  role: String,
  summary: String,
  title: String,
  type: String,
}, { timestamps: true });
```

### Subscription Plans 💳
Manages user subscription information and Stripe integration.

```javascript
const subscriptionPlans = mongoose.Schema({
  stripeCustomerId: String,
  subscriptionId: String,
  subscriptionType: {
    type: String,
    enum: ['FREE', 'PAID'],
  },
  startDate: Date,
  renewDate: Date,
  trialEnd: Date,
}, { timestamps: true });
```

### Personalization System 🎯
Handles user preferences and learning progress.

```javascript
const personalizationSchema = mongoose.Schema({
  interests: {
    type: Array,
    default: [],
  },
  wants_to_learn: {
    type: Array,
    default: [],
  },
  previous_progress: {
    type: Array,
    default: [],
  }
});
```

## Security Features 🔐

### Token Management
```javascript
const tokenSchema = mongoose.Schema({
  device_id: String,
  device_type: String,
  device_token: {
    type: String,
    required: true,
  },
  expires: {
    type: Date,
    required: true,
  },
  blacklisted: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });
```

Key Security Features:
- Token expiration
- Device tracking
- Blacklisting capability
- Timestamp tracking

## Best Practices 💡

1. **Data Validation**
   - All user inputs are validated using mongoose schemas
   - Email validation using validator library
   - Password strength requirements enforced

2. **Timestamps**
   - All models include automatic timestamp tracking
   - Helps in debugging and audit trails

3. **References**
   - Proper use of MongoDB references between models
   - Helps maintain data integrity

4. **Schema Options**
   - Appropriate use of default values
   - Required fields clearly marked
   - Proper data type definitions

## API Integration Notes 🔌

### Stripe Integration
The subscription model is designed to work with Stripe:
- Stores Stripe customer ID
- Manages subscription status
- Handles trial periods
- Tracks renewal dates

### Device Management
The token system supports multiple devices:
- Device-specific tokens
- Token expiration handling
- Blacklist capability for security

## Debugging Tips 🐛

1. Check timestamp fields for tracking changes
2. Verify referenced IDs exist before creating relationships
3. Ensure proper index usage for performance
4. Monitor token expiration and blacklist status

## Additional Resources 📚

For more information:
- Mongoose Documentation
- Node.js Best Practices
- MongoDB Atlas Documentation
- Stripe API Documentation