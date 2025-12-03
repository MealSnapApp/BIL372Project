const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const WeightLog = sequelize.define('WeightLog', {
  log_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    unique: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    references: {
      model: User,
      key: 'user_id'
    }
  },
  weight_kg: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    primaryKey: true,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'Weight_Log',
  timestamps: false // We are defining created_at manually
});

User.hasMany(WeightLog, { foreignKey: 'user_id' });
WeightLog.belongsTo(User, { foreignKey: 'user_id' });

module.exports = WeightLog;