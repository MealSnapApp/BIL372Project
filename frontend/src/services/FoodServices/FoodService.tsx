import axiosInstance from '../../axios/axiosInstance';

export const searchFoods = async (query: string) => {
  try {
    const response = await axiosInstance.get(`/foods/search?query=${query}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllFoods = async () => {
  try {
    const response = await axiosInstance.get('/foods');
    return response.data;
  } catch (error) {
    throw error;
  }
};
