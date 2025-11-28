const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Follower = sequelize.define(
  'Follower',
  {
    follower_id: {
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
        key: 'user_id',
      },
      onDelete: 'CASCADE',
    },
    follower_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'user_id',
      },
      onDelete: 'CASCADE',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'followers',
    timestamps: false,
  }
);

// Define associations
// 'user' is the person who is following (the actor)
Follower.belongsTo(User, { foreignKey: 'user_id', as: 'followingUser' });
// 'follower' is the person being followed (the target)
Follower.belongsTo(User, { foreignKey: 'follower_user_id', as: 'followedUser' });

module.exports = Follower;
