const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Height_Log = sequelize.define('Height_Log', {
  height_log_id: {
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
  height_cm: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Height_Log',
  timestamps: false
});

// Associations
User.hasMany(Height_Log, { foreignKey: 'user_id' });
Height_Log.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Height_Log;