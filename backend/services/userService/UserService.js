const User = require('../../models/User');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

exports.createUser = async ({ Name, Surname, Username, Email, Password, BirthDate, Sex, TargetWeight, TargetCalorie, ActivityLevel }) => {
  console.log("UserService.createUser called with:", { Name, Surname, Username, Email });
  try {
    const newUser = await User.create({
      user_id: uuidv4(), // Generate UUID manually
      name: Name,
      surname: Surname,
      username: Username,
      email: Email,
      password: Password,
      birth_date: BirthDate,
      sex: Sex,
      target_weight_kg: TargetWeight,
      target_calorie_amount: TargetCalorie,
      activity_level: ActivityLevel
    });
    console.log("User created successfully");
    return newUser.get({ plain: true });
  } catch (error) {
    console.error("UserService.createUser failed:", error);
    throw error;
  }
};

exports.getUserByEmailOrUsername = async (EmailorUsername) => {
  const user = await User.findOne({
    where: {
      [Op.or]: [
        { email: EmailorUsername },
        { username: EmailorUsername }
      ]
    }
  });
  
  return user ? user.get({ plain: true }) : null;
};

exports.getUserById = async (userId) => {
  const user = await User.findByPk(userId);
  return user ? user.get({ plain: true }) : null;
};