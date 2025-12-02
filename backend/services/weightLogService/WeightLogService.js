const WeightLog = require('../../models/WeightLog');
const { Op } = require('sequelize');

// Create a new weight log entry
exports.createWeightLog = async ({ userId, weight, created_at }) => {
  try {
    // Check if a log already exists for the given user and date
    const existingLog = await WeightLog.findOne({
      where: {
        user_id: userId,
        created_at: created_at,
      },
    });

    if (existingLog) {
      // Update the existing log
      existingLog.weight_kg = weight;
      await existingLog.save();
      return existingLog.get({ plain: true });
    } else {
      // Create a new log
      const newLog = await WeightLog.create({
        user_id: userId,
        weight_kg: weight,
        created_at: created_at,
      });
      return newLog.get({ plain: true });
    }
  } catch (error) {
    console.error('Error creating or updating weight log:', error);
    throw error;
  }
};

// Get all weight logs for a user
exports.getWeightLogsByUser = async (userId) => {
  try {
    const logs = await WeightLog.findAll({
      where: { user_id: userId },
      order: [['created_at', 'ASC']],
    });
    return logs.map((log) => log.get({ plain: true }));
  } catch (error) {
    console.error('Error fetching weight logs:', error);
    throw error;
  }
};

// Delete a weight log entry by ID
exports.deleteWeightLog = async (logId) => {
  try {
    const result = await WeightLog.destroy({
      where: { log_id: logId },
    });
    return result > 0; // Returns true if a row was deleted
  } catch (error) {
    console.error('Error deleting weight log:', error);
    throw error;
  }
};