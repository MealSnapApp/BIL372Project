const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Food = require('./Food');

const MealLog = sequelize.define('MealLog', {
  meal_log_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    unique: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'user_id'
    }
  },
  food_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Food,
      key: 'food_id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  meal_time: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  portion: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'Meal_Log',
  timestamps: false
});

// Associations
User.hasMany(MealLog, { foreignKey: 'user_id' });
MealLog.belongsTo(User, { foreignKey: 'user_id' });

Food.hasMany(MealLog, { foreignKey: 'food_id' });
MealLog.belongsTo(Food, { foreignKey: 'food_id' });

module.exports = MealLog;
