import axiosInstance from '../../axios/axiosInstance';

export const updateUser = async (data: {
  height_cm?: number;
  weight_kg?: number;
  target_weight_kg?: number;
  activity_level?: string;
  target_calorie_amount?: number;
}) => {
  try {
    const response = await axiosInstance.put('/user/update', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUsersWeightandHeight = async (data: {
  height_cm?: number;
  weight_kg?: number;
}) => {
  try {
    const response = await axiosInstance.put('/user/update', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchUsers = async (query: string) => {
  try {
    const response = await axiosInstance.get(`/user/search?query=${query}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
