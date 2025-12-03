const fs = require('fs');
const path = require('path');
const Food = require('../models/Food');

async function seedFoods() {
    try {
        const count = await Food.count();
        if (count > 0) {
            console.log('Food table already has data. Skipping seed.');
            return;
        }

        const csvPath = path.join(__dirname, '../data/food_data.csv');
        if (!fs.existsSync(csvPath)) {
            console.log('No food_data.csv found in backend/data. Skipping seed.');
            return;
        }

        console.log('Seeding Food table from CSV...');
        const data = fs.readFileSync(csvPath, 'utf8');
        const lines = data.split('\n');
        
        // Assuming first line is header
        // Expected headers: "food_id","food_name","portion_size","calorie","protein_gr","carbohydrate_gr","fat_gr"
        
        const foods = [];
        // Start from index 1 to skip header
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Simple CSV split
            // Note: This assumes no commas within the values themselves.
            const cols = line.split(',');
            
            // Map columns to model fields based on the provided format:
            // 0: food_id (Ignored, let DB generate UUID)
            // 1: food_name
            // 2: portion_size
            // 3: calorie
            // 4: protein_gr
            // 5: carbohydrate_gr
            // 6: fat_gr

            if (cols.length >= 7) {
                const clean = (str) => str ? str.trim().replace(/^"|"$/g, '') : '';

                foods.push({
                    food_name: clean(cols[1]),
                    portion_size: clean(cols[2]),
                    calorie: parseFloat(cols[3]),
                    protein_gr: parseFloat(cols[4]),
                    carbohydrate_gr: parseFloat(cols[5]),
                    fat_gr: parseFloat(cols[6])
                });
            }
        }

        if (foods.length > 0) {
            await Food.bulkCreate(foods);
            console.log(`Successfully seeded ${foods.length} food items.`);
        } else {
            console.log('No valid data found in CSV.');
        }

    } catch (error) {
        console.error('Error seeding foods:', error);
    }
}

module.exports = seedFoods;
