const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Food = require('../models/Food');
const MealLog = require('../models/MealLog');
const Follower = require('../models/Follower');

exports.seedData = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // 1. Create Foods
    const foods = [
      { food_name: 'Green Apple', calorie: 52, portion_size: '1 medium', protein_gr: 0.3, carbohydrate_gr: 14, fat_gr: 0.2 },
      { food_name: 'Grilled Chicken Breast', calorie: 165, portion_size: '100g', protein_gr: 31, carbohydrate_gr: 0, fat_gr: 3.6 },
      { food_name: 'Brown Rice', calorie: 111, portion_size: '100g', protein_gr: 2.6, carbohydrate_gr: 23, fat_gr: 0.9 },
      { food_name: 'Greek Yogurt', calorie: 59, portion_size: '100g', protein_gr: 10, carbohydrate_gr: 3.6, fat_gr: 0.4 }
    ];

    const createdFoods = [];
    for (const food of foods) {
      const [f] = await Food.findOrCreate({
        where: { food_name: food.food_name },
        defaults: { ...food, food_id: uuidv4() }
      });
      createdFoods.push(f);
    }

    // 2. Create Dummy Users
    const dummyUsers = [
      { name: 'Alice', surname: 'Wonder', username: 'alice_w', email: 'alice@example.com' },
      { name: 'Bob', surname: 'Builder', username: 'bob_b', email: 'bob@example.com' },
      { name: 'Charlie', surname: 'Chef', username: 'chef_charlie', email: 'charlie@example.com' }
    ];

    const createdUsers = [];
    for (const u of dummyUsers) {
      const [user] = await User.findOrCreate({
        where: { email: u.email },
        defaults: {
          ...u,
          user_id: uuidv4(),
          password: 'password123', // Dummy password
          birth_date: '1990-01-01',
          sex: 'F',
          registration_date: new Date()
        }
      });
      createdUsers.push(user);
    }

    // 3. Add Meal Logs for Current User
    // Add some for today and yesterday
    const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    await MealLog.findOrCreate({
      where: {
        user_id: currentUserId,
        food_id: createdFoods[0].food_id, // Apple
        date: today,
        meal_time: 'breakfast'
      },
      defaults: {
        portion: '1'
      }
    });

    await MealLog.findOrCreate({
      where: {
        user_id: currentUserId,
        food_id: createdFoods[1].food_id, // Chicken
        date: today,
        meal_time: 'lunch'
      },
      defaults: {
        portion: '1.5'
      }
    });

    await MealLog.findOrCreate({
      where: {
        user_id: currentUserId,
        food_id: createdFoods[3].food_id, // Yogurt
        date: today, // Changed from yesterday to today for visibility
        meal_time: 'snack'
      },
      defaults: {
        portion: '1'
      }
    });

    // 4. Add Followers
    // Current User follows Alice
    await Follower.findOrCreate({
      where: { user_id: currentUserId, follower_user_id: createdUsers[0].user_id }
    });

    // Bob follows Current User
    await Follower.findOrCreate({
      where: { user_id: createdUsers[1].user_id, follower_user_id: currentUserId }
    });

    // Charlie follows Current User
    await Follower.findOrCreate({
      where: { user_id: createdUsers[2].user_id, follower_user_id: currentUserId }
    });

    res.status(200).json({ message: 'Demo data added successfully!' });

  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ message: 'Failed to seed data', error: error.message });
  }
};
