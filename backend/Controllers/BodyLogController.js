const WeightLogService = require('../services/weightLogService/WeightLogService');
const HeightLogService = require('../services/heightLogService/HeightLogService');

// Get user's body data (weight, height, BMI, etc.)
const getBodyData = async (req, res) => {
  const userId = req.user.id; 

  try {
    const weightData = await WeightLogService.getWeightLogsByUser(userId);
    const heightData = await HeightLogService.getHeightLogsByUser(userId);

    res.status(200).json({
      weightData,
      heightData,
    });
  } catch (error) {
    console.error('Error fetching body data:', error);
    res.status(500).json({ message: 'Error fetching body data' });
  }
};

// Save user's body data (weight, height, target weight, activity level)
const saveBodyData = async (req, res) => {
  userId = req.user.id; 
  const { date, weight, height} = req.body;
  const created_at = date;

  console.log('Gelen veri:', req.body); // Gelen veriyi kontrol etmek için log eklendi

  try {
    if (weight) {
      await WeightLogService.createWeightLog({ userId, weight, created_at });
    }

    if (height) {
      await HeightLogService.createHeightLog({ userId, height, created_at });
    }

    res.status(200).json({ message: 'Body data saved successfully' });
  } catch (error) {
    console.error('Error saving body data:', error);
    res.status(500).json({ message: 'Error saving body data' });
  }
};

module.exports = {
  getBodyData,
  saveBodyData,
};