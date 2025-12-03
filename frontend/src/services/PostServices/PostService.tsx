import axiosInstance from "../../axios/axiosInstance";
import { makeRequest } from "../../axios/ApiService";
import { RequestMethod } from "../../enums/RequestMethod";

export async function uploadImage(file: File): Promise<{ path: string; thumb_path?: string }> {
  const formData = new FormData();
  formData.append('image', file);
  const res = await axiosInstance.post('/uploads/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return { path: res.data.path as string, thumb_path: res.data.thumb_path };
}

export async function createPost(params: { content?: string; image_path?: string; thumb_path?: string }) {
  return makeRequest(RequestMethod.POST, '/posts', {
    data: params,
  });
}

export async function updatePost(post_id: string, params: { content?: string; image_path?: string }) {
  return makeRequest(RequestMethod.PUT, `/posts/${post_id}`, {
    data: params,
  });
}

export async function getRecentPosts(limit: number = 20, period: string = 'all-time') {
  return makeRequest(RequestMethod.GET, '/posts', {
    params: { limit, period }
  });
}

export async function likePost(post_id: string) {
  return makeRequest(RequestMethod.POST, `/posts/${post_id}/like`);
}

export async function unlikePost(post_id: string) {
  return makeRequest(RequestMethod.DELETE, `/posts/${post_id}/like`);
}

export async function listPostLikes(post_id: string) {
  return makeRequest(RequestMethod.GET, `/posts/${post_id}/likes`);
}

export async function addComment(post_id: string, content: string, parent_comment_id?: string) {
  return makeRequest(RequestMethod.POST, `/posts/${post_id}/comments`, {
    data: { content, parent_comment_id }
  });
}

export async function listComments(post_id: string) {
  return makeRequest(RequestMethod.GET, `/posts/${post_id}/comments`);
}

export async function bookmarkPost(post_id: string) {
  return makeRequest(RequestMethod.POST, `/posts/${post_id}/bookmark`);
}

export async function unbookmarkPost(post_id: string) {
  return makeRequest(RequestMethod.DELETE, `/posts/${post_id}/bookmark`);
}

export async function listSavedPosts() {
  return makeRequest(RequestMethod.GET, `/posts/saved`);
}

export async function listLikedPosts() {
  return makeRequest(RequestMethod.GET, `/posts/liked`);
}

export async function listMyPosts() {
  return makeRequest(RequestMethod.GET, `/posts/mine`);
}
