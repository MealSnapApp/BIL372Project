const User = require('../models/User');
const HeightLog = require('../models/HeightLog');
const WeightLog = require('../models/WeightLog');
const { Op } = require('sequelize');

exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.user.id;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const users = await User.findAll({
      where: {
        [Op.and]: [
          { user_id: { [Op.ne]: currentUserId } }, // Exclude current user
          {
            [Op.or]: [
              { username: { [Op.like]: `%${query}%` } },
              { name: { [Op.like]: `%${query}%` } },
              { surname: { [Op.like]: `%${query}%` } },
              { email: { [Op.like]: `%${query}%` } }
            ]
          }
        ]
      },
      attributes: ['user_id', 'name', 'surname', 'username', 'email'] // Return only necessary fields
    });

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ success: false, message: 'Error searching users', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user_id = req.user.id; // From auth middleware
    const { height_cm, weight_kg, target_weight_kg, activity_level, target_calorie_amount } = req.body;

    const user = await User.findByPk(user_id);

    if (!user) {
      console.log('User not found for ID:', user_id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Updating user:', user_id, 'with data:', { height_cm, weight_kg, target_weight_kg, activity_level, target_calorie_amount });

    // Update fields if provided and not null
    if (height_cm !== undefined && height_cm !== null) {
      await HeightLog.create({
        user_id: user_id,
        height_cm: height_cm
      });
    }
    if (weight_kg !== undefined && weight_kg !== null) {
      await WeightLog.create({
        user_id: user_id,
        weight_kg: weight_kg
      });
    }
    if (target_weight_kg !== undefined && target_weight_kg !== null) user.target_weight_kg = target_weight_kg;
    if (activity_level !== undefined && activity_level !== null) user.activity_level = activity_level;
    if (target_calorie_amount !== undefined && target_calorie_amount !== null) user.target_calorie_amount = target_calorie_amount;

    await user.save();
    console.log('User updated successfully');

    // Return updated user without password
    const userPlain = user.get({ plain: true });
    
    // Add latest height to response
    if (height_cm !== undefined && height_cm !== null) {
      userPlain.height_cm = height_cm;
    } else {
      const latestHeightLog = await HeightLog.findOne({
        where: { user_id: user_id },
        order: [['created_at', 'DESC']]
      });
      userPlain.height_cm = latestHeightLog ? latestHeightLog.height_cm : null;
    }

    // Add latest weight to response
    if (weight_kg !== undefined && weight_kg !== null) {
      userPlain.weight_kg = weight_kg;
    } else {
      const latestWeightLog = await WeightLog.findOne({
        where: { user_id: user_id },
        order: [['created_at', 'DESC']]
      });
      userPlain.weight_kg = latestWeightLog ? latestWeightLog.weight_kg : null;
    }

    const { password, ...userWithoutPassword } = userPlain;

    res.status(200).json({ 
      message: 'User updated successfully', 
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};
