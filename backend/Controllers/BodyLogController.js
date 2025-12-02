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

const deleteHeightLogController = async (req, res) => {
  const { id } = req.params; // Silinecek kaydın ID'si
  console.log('height id: ', id)
  try {
    // Servis fonksiyonunu çağırın. 
    // ID ve userId'yi kontrol ederek kullanıcının sadece kendi kaydını silmesini sağlayın.
    const deletedLog = await HeightLogService.deleteHeightLog(id);

    if (deletedLog === 0) {
      return res.status(404).json({ message: 'There is no height record.' });
    }

    res.status(200).json({ message: 'Height record is deleted' });
  } catch (error) {
    console.error('Error deleting height log:', error);
    res.status(500).json({ message: 'Error deleting height log:' });
  }
};

const deleteWeightLogController = async (req, res) => {
  const { id } = req.params; // Silinecek kaydın ID'si
  console.log('weight id: ', id)
  try {
    // Servis fonksiyonunu çağırın. 
    // ID ve userId'yi kontrol ederek kullanıcının sadece kendi kaydını silmesini sağlayın.
    const deletedLog = await WeightLogService.deleteWeightLog(id);

    if (deletedLog === 0) {
      return res.status(404).json({ message: ' There is no weight record.' });
    }

    res.status(200).json({ message: 'Weight record is deleted' });
  } catch (error) {
    console.error('Error deleting weight log:', error);
    res.status(500).json({ message: 'Error deleting weight log.' });
  }
};

module.exports = {
  getBodyData,
  saveBodyData,
  deleteWeightLogController,
  deleteHeightLogController,
};