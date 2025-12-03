const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const HeightLog = sequelize.define('HeightLog', {
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
  height_cm: {
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
  tableName: 'Height_Log',
  timestamps: false // We are defining created_at manually
});

User.hasMany(HeightLog, { foreignKey: 'user_id' });
HeightLog.belongsTo(User, { foreignKey: 'user_id' });

module.exports = HeightLog;