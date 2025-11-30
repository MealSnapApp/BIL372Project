const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Weight_Log = sequelize.define('Weight_Log', {
  weight_log_id: {
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
  weight_kg: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },    
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Weight_Log',
  timestamps: false
});

// Associations
User.hasMany(Weight_Log, { foreignKey: 'user_id' });
Weight_Log.belongsTo(User, { foreignKey: 'user_id' });


module.exports = Weight_Log;
