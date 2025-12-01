const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    unique: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  surname: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  birth_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  sex: {
    type: DataTypes.CHAR(1),
    allowNull: false,
  },
  target_weight_kg: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  target_calorie_amount: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  activity_level: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: false,
  indexes: [
    { unique: true, fields: ['username'] },
    { unique: true, fields: ['email'] },
  ],
});

module.exports = User;
