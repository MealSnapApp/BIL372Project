const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Food = sequelize.define('Food', {
  food_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    unique: true,
  },
  food_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  portion_size: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  calorie: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
  protein_gr: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  carbohydrate_gr: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  fat_gr: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  }
}, {
  tableName: 'Food',
  timestamps: false,
  indexes: [
    { fields: ['food_name'] } // index to support FK from Meal_Log
  ]
});

module.exports = Food;
