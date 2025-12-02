import axiosInstance from '../../axios/axiosInstance';

// Kullanıcıdan alınan verileri backend'e kaydetmek için servis fonksiyonu
export const saveBodyData = async (data: {
  date: string;
  weight: number;
  height: number;
}) => {
  try {
    const response = await axiosInstance.post('/my-body/data', data); // Endpoint düzeltildi
    return response.data; // Başarılı yanıtı döndür
  } catch (error) {
    console.error('Veri kaydedilirken bir hata oluştu:', error);
    throw error; // Hata durumunda hatayı fırlat
  }
};

export const getWeightLogsByUser = async () => {
  try {
    const data = {}
    const response = await axiosInstance.get('/my-body/data', data); // Endpoint düzeltildi
    return response.data; // Başarılı yanıtı döndür
  } catch (error) {
    console.error('Veri kaydedilirken bir hata oluştu:', error);
    throw error; // Hata durumunda hatayı fırlat
  }
};

export const deleteHeightLog = async (id: string) => {
  try {
    console.log('iste bu height iddir:' , id)
    const response = await axiosInstance.delete(`/my-body/height/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteWeightLog = async (id: string) => {
  try {
    console.log('iste bu weight iddir:' , id)
    const response = await axiosInstance.delete(`/my-body/weight/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
