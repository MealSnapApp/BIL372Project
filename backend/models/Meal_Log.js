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
  food_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    references: {
      model: Food,
      key: 'food_name'
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

User.hasMany(MealLog, { foreignKey: 'user_id' });
MealLog.belongsTo(User, { foreignKey: 'user_id' });

Food.hasMany(MealLog, { foreignKey: 'food_name', sourceKey: 'food_name' });
MealLog.belongsTo(Food, { foreignKey: 'food_name', targetKey: 'food_name' });

module.exports = MealLog;
