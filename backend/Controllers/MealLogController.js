const MealLog = require('../models/MealLog');
const Food = require('../models/Food');
const { Op } = require('sequelize');

exports.addMealLog = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { food_id, date, meal_time, portion } = req.body;
    
    // Check if a log already exists for the same date, time and food
    const existingLog = await MealLog.findOne({
      where: {
        user_id,
        date,
        meal_time,
        food_id
      }
    });

    if (existingLog) {
      return res.status(400).json({ 
        success: false, 
        message: 'This food has already been added to this meal.' 
      });
    }
    
    const newLog = await MealLog.create({
      user_id,
      food_id,
      date,
      meal_time,
      portion
    });

    res.status(201).json({ success: true, data: newLog });
  } catch (error) {
    console.error("Add Meal Log Error:", error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, message: 'This food has already been added to this meal.' });
    }
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
        attributes: ['food_name', 'calorie', 'protein_gr', 'carbohydrate_gr', 'fat_gr']
      }]
    });

    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error("Get Daily Logs Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllUserLogs = async (req, res) => {
  try {
    const user_id = req.user.id;
    
    const logs = await MealLog.findAll({
      where: { user_id },
      include: [{
        model: Food,
        attributes: ['food_name', 'calorie', 'portion_size']
      }],
      order: [['date', 'DESC'], ['created_at', 'DESC']]
    });

    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteMealLog = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params;

    const log = await MealLog.findOne({
      where: {
        meal_log_id: id,
        user_id
      }
    });

    if (!log) {
      return res.status(404).json({ success: false, message: 'Meal log not found' });
    }

    await log.destroy();

    res.status(200).json({ success: true, message: 'Meal log deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
