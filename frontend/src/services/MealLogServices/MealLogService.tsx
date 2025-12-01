import axiosInstance from '../../axios/axiosInstance';

export const addMealLog = async (data: {
  food_name: string;
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

export const getAllUserLogs = async () => {
  try {
    const response = await axiosInstance.get('/meal-logs/all');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteMealLog = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/meal-logs/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
