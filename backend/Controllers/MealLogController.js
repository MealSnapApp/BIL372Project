const MealLog = require('../models/MealLog');
const Food = require('../models/Food');
const { Op } = require('sequelize');

exports.addMealLog = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { food_id, date, meal_time, portion } = req.body;
    
    const newLog = await MealLog.create({
      user_id,
      food_id,
      date,
      meal_time,
      portion
    });

    res.status(201).json({ success: true, data: newLog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDailyLogs = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { date } = req.query;

    const logs = await MealLog.findAll({
      where: {
        user_id,
        date
      },
      include: [{
        model: Food,
        attributes: ['food_name', 'calorie', 'portion_size', 'protein_gr', 'carbohydrate_gr', 'fat_gr']
      }]
    });

    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
