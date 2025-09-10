# SkillSwap Learning Network

A peer-to-peer skill-sharing platform where users can learn, teach, and exchange skills in their community.

## Features

- **User Profiles**: Create detailed profiles with skills offered and wanted
- **Skill Matching**: Smart algorithm to find compatible skill exchange partners
- **Points System**: Earn points by teaching, spend them on learning
- **Exchange Management**: Track and manage skill exchange sessions
- **Rating System**: Rate and review exchange experiences
- **Real-time Messaging**: Communicate with exchange partners
- **Location-based Search**: Find teachers and learners nearby

## Technology Stack

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT Authentication
- RESTful API

### Frontend
- React.js
- Material-UI (MUI)
- React Router
- Axios for API calls

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd skillswap-learning-network
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

4. Set up environment variables:
Create a `.env` file in the root directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skillswap
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

5. Start MongoDB (if running locally):
```bash
mongod
```

6. Run the application:
```bash
# Development mode (runs both frontend and backend)
npm run dev

# Or run separately:
npm run server  # Backend only
npm run client  # Frontend only
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/search` - Search users by skills/location
- `GET /api/users/:id` - Get user by ID

### Skills
- `GET /api/skills/available` - Get all available skills
- `GET /api/skills/match/:userId` - Get skill matches for user

### Exchanges
- `POST /api/exchanges/create` - Create new exchange
- `GET /api/exchanges/my-exchanges` - Get user's exchanges
- `PUT /api/exchanges/:id/status` - Update exchange status
- `POST /api/exchanges/:id/message` - Send message
- `POST /api/exchanges/:id/rate` - Rate exchange

## Project Structure

```
skillswap-learning-network/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── App.js
│   └── package.json
├── models/                 # MongoDB models
│   ├── User.js
│   └── Exchange.js
├── routes/                 # API routes
│   ├── auth.js
│   ├── users.js
│   ├── skills.js
│   └── exchanges.js
├── server.js              # Main server file
├── package.json
└── README.md
```

## Usage

1. **Register/Login**: Create an account or login to access the platform
2. **Complete Profile**: Add your skills, location, and learning preferences
3. **Find Skills**: Search for skills you want to learn
4. **Request Exchange**: Send exchange requests to teachers
5. **Manage Exchanges**: Track and manage your skill exchange sessions
6. **Rate & Review**: Rate your exchange experiences

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Future Enhancements

- Video call integration for online learning
- Mobile app development
- AI-powered skill recommendations
- Certification system
- Community challenges and events
- Advanced analytics and insights
