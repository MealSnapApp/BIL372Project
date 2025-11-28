import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchFoods, getAllFoods } from '../../../services/FoodServices/FoodService';
import { addMealLog, getDailyLogs } from '../../../services/MealLogServices/MealLogService';
import { ToastMessage } from '../../../utils/ToastMessage/ToastMessage';

export interface FoodItem {
  food_id: string;
  food_name: string;
  calorie: number;
  portion_size: string;
  protein_gr?: number;
  carbohydrate_gr?: number;
  fat_gr?: number;
}

export interface MealSection {
  id: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  title: string;
  items: FoodItem[];
  totalCalories: number;
}

const useSaveMealPage = () => {
  const navigate = useNavigate();
  const { contextHolder, showNotification } = ToastMessage();
  
  const [meals, setMeals] = useState<MealSection[]>([
    { id: 'breakfast', title: 'Breakfast', items: [], totalCalories: 0 },
    { id: 'lunch', title: 'Lunch', items: [], totalCalories: 0 },
    { id: 'dinner', title: 'Dinner', items: [], totalCalories: 0 },
    { id: 'snack', title: 'Snacks', items: [], totalCalories: 0 },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentMealType, setCurrentMealType] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);

  // Fetch daily logs on mount
  useEffect(() => {
    fetchDailyLogs();
  }, []);

  // Search foods when searchTerm changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        searchFoods(searchTerm).then(response => {
          if (response.success) {
            setSearchResults(response.data);
          }
        });
      } else {
        getAllFoods().then(response => {
            if (response.success) {
                setSearchResults(response.data);
            }
        });
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchDailyLogs = async () => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const response = await getDailyLogs(today);
      if (response.success) {
        const logs = response.data;
        const newMeals = [
            { id: 'breakfast', title: 'Breakfast', items: [], totalCalories: 0 },
            { id: 'lunch', title: 'Lunch', items: [], totalCalories: 0 },
            { id: 'dinner', title: 'Dinner', items: [], totalCalories: 0 },
            { id: 'snack', title: 'Snacks', items: [], totalCalories: 0 },
        ] as MealSection[];

        logs.forEach((log: any) => {
            // Case-insensitive matching for meal_time
            const section = newMeals.find(m => m.id.toLowerCase() === log.meal_time.toLowerCase());
            if (section && log.Food) {
                const foodItem: FoodItem = {
                    food_id: log.food_id,
                    food_name: log.Food.food_name,
                    calorie: log.Food.calorie,
                    portion_size: log.Food.portion_size,
                    protein_gr: log.Food.protein_gr,
                    carbohydrate_gr: log.Food.carbohydrate_gr,
                    fat_gr: log.Food.fat_gr
                };
                section.items.push(foodItem);
                section.totalCalories += foodItem.calorie;
            }
        });
        setMeals(newMeals);
      }
    } catch (error) {
      console.error("Error fetching daily logs:", error);
    }
  };

  const handleAddFoodClick = (mealId: string) => {
    setCurrentMealType(mealId);
    setIsModalVisible(true);
    setSearchTerm('');
    // Load initial foods
    getAllFoods().then(response => {
        if (response.success) {
            setSearchResults(response.data);
        }
    });
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setCurrentMealType(null);
  };

  const handleAddFoodItem = async (food: FoodItem) => {
    if (!currentMealType) return;

    const today = new Date().toISOString().split('T')[0];
    
    try {
        const response = await addMealLog({
            food_id: food.food_id,
            date: today,
            meal_time: currentMealType,
            portion: "1" // Default portion for now
        });

        if (response.success) {
            fetchDailyLogs(); // Refresh logs
            handleCloseModal();
            showNotification("Meal added successfully", "success");
        }
    } catch (error: any) {
        console.error("Error adding meal log:", error);
        if (error.response && error.response.data && error.response.data.message) {
            showNotification(error.response.data.message, "error");
        } else {
            showNotification("Failed to add meal log", "error");
        }
    }
  };

  const totalDailyCalories = meals.reduce((acc, meal) => acc + meal.totalCalories, 0);

  return {
    meals,
    isModalVisible,
    currentMealType,
    searchTerm,
    setSearchTerm,
    filteredFoods: searchResults,
    handleAddFoodClick,
    handleCloseModal,
    handleAddFoodItem,
    totalDailyCalories,
    contextHolder
  };
};

export default useSaveMealPage;
