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
    type: DataTypes.TEXT,
    allowNull: false,
  },
  portion_size: {
    type: DataTypes.TEXT,
    allowNull: true,
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
  timestamps: false 
});

module.exports = Food;
