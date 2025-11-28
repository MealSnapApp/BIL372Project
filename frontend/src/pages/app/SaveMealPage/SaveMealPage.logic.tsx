import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchFoods, getAllFoods } from '../../../services/FoodServices/FoodService';
import { addMealLog, getDailyLogs } from '../../../services/MealLogServices/MealLogService';

export interface FoodItem {
  food_id: string;
  food_name: string;
  calorie: number;
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
  
  // New states for food detail selection
  const [selectedFoodForDetail, setSelectedFoodForDetail] = useState<FoodItem | null>(null);
  const [portionAmount, setPortionAmount] = useState<number>(100);
  
  // Date state
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Helper to get week days
  const getWeekDays = (currentDateStr: string) => {
    const current = new Date(currentDateStr);
    const day = current.getDay(); // 0 (Sun) to 6 (Sat)
    // Calculate Monday
    // If Sunday (0), subtract 6 days. If Mon (1), subtract 0. If Tue (2), subtract 1.
    const daysToMonday = day === 0 ? 6 : day - 1;
    const monday = new Date(current);
    monday.setDate(current.getDate() - daysToMonday);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push({
        date: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: d.getDate()
      });
    }
    return days;
  };

  const weekDays = getWeekDays(selectedDate);

  // Fetch daily logs on mount and when date changes
  useEffect(() => {
    fetchDailyLogs(selectedDate);
  }, [selectedDate]);

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

  const fetchDailyLogs = async (date: string) => {
    try {
      const response = await getDailyLogs(date);
      if (response.success) {
        const logs = response.data;
        const newMeals = [
            { id: 'breakfast', title: 'Breakfast', items: [], totalCalories: 0 },
            { id: 'lunch', title: 'Lunch', items: [], totalCalories: 0 },
            { id: 'dinner', title: 'Dinner', items: [], totalCalories: 0 },
            { id: 'snack', title: 'Snacks', items: [], totalCalories: 0 },
        ] as MealSection[];

        logs.forEach((log: any) => {
            const section = newMeals.find(m => m.id === log.meal_time);
            if (section && log.Food) {
                // Calculate calories based on portion
                const logPortion = parseFloat(log.portion) || 0;
                const basePortion = 100;
                const calculatedCalories = (log.Food.calorie * logPortion) / basePortion;

                const foodItem: FoodItem = {
                    food_id: log.food_id,
                    food_name: log.Food.food_name,
                    calorie: Math.round(calculatedCalories), // Show calculated calories
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
    setSelectedFoodForDetail(null); // Reset selection
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
    setSelectedFoodForDetail(null);
  };

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFoodForDetail(food);
    setPortionAmount(100); // Default to 100g
  };

  const handleBackToSearch = () => {
    setSelectedFoodForDetail(null);
  };

  const handleConfirmAddFood = async () => {
    if (!currentMealType || !selectedFoodForDetail) return;

    try {
        const response = await addMealLog({
            food_id: selectedFoodForDetail.food_id,
            date: selectedDate,
            meal_time: currentMealType,
            portion: portionAmount.toString()
        });

        if (response.success) {
            fetchDailyLogs(selectedDate); // Refresh logs
            handleCloseModal();
        }
    } catch (error) {
        console.error("Error adding meal log:", error);
    }
  };

  const handlePrevWeek = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() - 7);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + 7);
    setSelectedDate(current.toISOString().split('T')[0]);
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
    totalDailyCalories,
    // New exports
    selectedFoodForDetail,
    portionAmount,
    setPortionAmount,
    handleSelectFood,
    handleBackToSearch,
    handleConfirmAddFood,
    selectedDate,
    setSelectedDate,
    weekDays,
    handlePrevWeek,
    handleNextWeek
  };
};

export default useSaveMealPage;
