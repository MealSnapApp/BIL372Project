const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { sequelize, initializeDatabase } = require('./config/database');

// Import models to ensure they are registered with Sequelize
require('./models/User');
require('./models/Food');
require('./models/MealLog');

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

server.use('/auth', authRoutes);
server.use('/foods', foodRoutes);
server.use('/meal-logs', mealLogRoutes);

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