import axiosInstance from '../../axios/axiosInstance';

export const followUser = async (follower_user_id: string) => {
  try {
    const response = await axiosInstance.post('/followers/follow', {
      follower_user_id,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const unfollowUser = async (follower_user_id: string) => {
  try {
    const response = await axiosInstance.delete(`/followers/unfollow/${follower_user_id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getFollowers = async (user_id: string) => {
  try {
    const response = await axiosInstance.get(`/followers/followers/${user_id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getFollowing = async (user_id: string) => {
  try {
    const response = await axiosInstance.get(`/followers/following/${user_id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const isFollowing = async (follower_user_id: string) => {
  try {
    const response = await axiosInstance.get(`/followers/is-following/${follower_user_id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeFollower = async (user_id_to_remove: string) => {
  try {
    const response = await axiosInstance.delete(`/followers/remove/${user_id_to_remove}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
