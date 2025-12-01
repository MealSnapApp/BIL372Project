const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { sequelize, initializeDatabase } = require('./config/database');

// Import models to ensure they are registered with Sequelize
require('./models/User');
require('./models/Food');
require('./models/Meal_Log');
require('./models/Follower');
require('./models/Post');
require('./models/Post_Likes');
require('./models/Comment');
require('./models/Comment_Likes');

const server = express();

// Middleware
server.use(express.json()); // To parse JSON. If it's not included, req.body will be undefined.
server.use(cookieParser());

// CORS setting: Accept requests from the React development server
server.use(cors({
  origin: /*'https://furkanyahsi.github.io',*/ 'http://localhost:3000', // React dev server address
  credentials: true                // Allow cookies to be sent
}));

// Routes
const authRoutes = require('./Routes/Auth');
const foodRoutes = require('./Routes/Food');
const mealLogRoutes = require('./Routes/MealLog');
const followerRoutes = require('./Routes/Follower');
const userRoutes = require('./Routes/User');
const postRoutes = require('./Routes/Post');
const commentLikeRoutes = require('./Routes/CommentLikes');
server.use('/posts', postRoutes);
server.use('/api', commentLikeRoutes);
const uploadRoutes = require('./Routes/Upload');

server.use('/auth', authRoutes);
server.use('/foods', foodRoutes);
server.use('/meal-logs', mealLogRoutes);
server.use('/followers', followerRoutes);
server.use('/user', userRoutes);
server.use('/posts', postRoutes);
// static serving for uploaded files and upload endpoints
// Upload dizini (OneDrive dışı varsayılan C:\snapmeal_uploads)
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join('C:\\', 'snapmeal_uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  try { fs.mkdirSync(UPLOAD_DIR, { recursive: true }); } catch (e) { console.error('Upload dir create error:', e); }
}
server.use('/uploads', express.static(UPLOAD_DIR));
server.use('/uploads', uploadRoutes);

const PORT = 3001;

// Initialize DB, Sync models, then start server
initializeDatabase().then(() => {
  sequelize.sync({ alter: true })
    .then(() => {
      console.log('Database & tables synced successfully.');
      server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch(err => {
      console.error('Failed to sync database:', err);
    });
});