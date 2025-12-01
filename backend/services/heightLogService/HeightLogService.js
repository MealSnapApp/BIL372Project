const HeightLog = require('../../models/HeightLog');
const { Op } = require('sequelize');

// Create a new height log entry
exports.createHeightLog = async ({ userId, height, created_at }) => {
  try {
    // Check if a log already exists for the given user and date
    const existingLog = await HeightLog.findOne({
      where: {
        user_id: userId,
        created_at: created_at,
      },
    });

    if (existingLog) {
      // Update the existing log
      existingLog.height_cm = height;
      await existingLog.save();
      return existingLog.get({ plain: true });
    } else {
      // Create a new log
      const newLog = await HeightLog.create({
        user_id: userId,
        height_cm: height,
        created_at: created_at,
      });
      return newLog.get({ plain: true });
    }
  } catch (error) {
    console.error('Error creating or updating height log:', error);
    throw error;
  }
};

// Get all height logs for a user
exports.getHeightLogsByUser = async (userId) => {
  try {
    const logs = await HeightLog.findAll({
      where: { user_id: userId },
      order: [['created_at', 'ASC']],
    });
    return logs.map((log) => log.get({ plain: true }));
  } catch (error) {
    console.error('Error fetching height logs:', error);
    throw error;
  }
};

// Delete a height log entry by ID
exports.deleteHeightLog = async (logId) => {
  try {
    const result = await HeightLog.destroy({
      where: { height_log_id: logId },
    });
    return result > 0; // Returns true if a row was deleted
  } catch (error) {
    console.error('Error deleting height log:', error);
    throw error;
  }
};