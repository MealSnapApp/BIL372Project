const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { sequelize, initializeDatabase } = require('./config/database');

// Import models to ensure they are registered with Sequelize
require('./models/User');
require('./models/Food');
require('./models/MealLog');
require('./models/Follower');

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
const seedRoutes = require('./Routes/Seed');

server.use('/auth', authRoutes);
server.use('/foods', foodRoutes);
server.use('/meal-logs', mealLogRoutes);
server.use('/followers', followerRoutes);
server.use('/user', userRoutes);
server.use('/seed', seedRoutes);

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
      // If foreign key constraint fails (common in SQLite with alter), try force sync
      if (err.name === 'SequelizeForeignKeyConstraintError' || err.name === 'SequelizeUniqueConstraintError') {
        console.log('Database constraint error detected. Attempting to reset database with force: true...');
        
        // Disable FK checks for SQLite before dropping tables
        sequelize.query('PRAGMA foreign_keys = OFF;')
          .then(() => {
            return sequelize.sync({ force: true });
          })
          .then(() => {
            console.log('Database reset and synced successfully (force: true).');
            // Re-enable FK checks
            return sequelize.query('PRAGMA foreign_keys = ON;');
          })
          .then(() => {
            server.listen(PORT, () => {
              console.log(`Server running on port ${PORT}`);
            });
          })
          .catch(err2 => {
            console.error('Failed to force sync database:', err2);
          });
      }
    });
});

// Start server directly (database will be skipped)
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });