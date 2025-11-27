const Food = require('../models/Food');
const { Op } = require('sequelize');

exports.getAllFoods = async (req, res) => {
  try {
    const foods = await Food.findAll();
    res.status(200).json({ success: true, data: foods });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchFoods = async (req, res) => {
  try {
    const { query } = req.query;
    const foods = await Food.findAll({
      where: {
        food_name: {
          [Op.iLike]: `%${query}%`
        }
      }
    });
    res.status(200).json({ success: true, data: foods });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createFood = async (req, res) => {
  try {
    const { food_name, portion_size, calorie, protein_gr, carbohydrate_gr, fat_gr } = req.body;
    const newFood = await Food.create({
      food_name,
      portion_size,
      calorie,
      protein_gr,
      carbohydrate_gr,
      fat_gr
    });
    res.status(201).json({ success: true, data: newFood });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
