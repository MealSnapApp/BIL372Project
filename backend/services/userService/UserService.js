const User = require('../../models/User');
const { Op } = require('sequelize');

exports.createUser = async ({ Name, Surname, Username, Email, Password, BirthDate, Sex, TargetWeight, TargetCalorie, ActivityLevel }) => {
  const newUser = await User.create({
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
  
  return newUser.get({ plain: true });
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