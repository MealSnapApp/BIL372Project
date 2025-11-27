import axiosInstance from '../../axios/axiosInstance';

export const addMealLog = async (data: {
  food_id: string;
  date: string;
  meal_time: string;
  portion: string;
}) => {
  try {
    const response = await axiosInstance.post('/meal-logs', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDailyLogs = async (date: string) => {
  try {
    const response = await axiosInstance.get(`/meal-logs?date=${date}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
