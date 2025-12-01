import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { checkAuth } from '../../../services/AuthServices/AuthService.export';
import { updateUser } from '../../../services/UserServices/UserService';
import { getAllUserLogs, deleteMealLog, getDailyLogs } from '../../../services/MealLogServices/MealLogService';
import { ToastMessage } from '../../../utils/ToastMessage/ToastMessage';
import { saveBodyData, getWeightLogsByUser} from '../../../services/MyBodyServices/MyBodyService';

export interface User {
    user_id: string;
    name: string;
    surname: string;
    username: string;
    email: string;
    height_cm?: number;
    weight_kg?: number;
    target_weight_kg?: number;
    activity_level?: string;
    target_calorie_amount?: number;
}

export interface MealLog {
    meal_log_id: string;
    date: string;
    meal_time: string;
    portion: string;
    Food: {
        food_name: string;
        calorie: number;
        protein_gr: number;
        carbohydrate_gr: number;
        fat_gr: number;
    }
}

export interface GroupedLog {
    logs: MealLog[];
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
}

const useProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [selectedMealType, setSelectedMealType] = useState<string>('all');
    const [isBodyModalVisible, setIsBodyModalVisible] = useState(false);
    const [weightLogs, setWeightLogs] = useState([]);
    const [heightLogs, setHeightLogs] = useState([]);
    const { contextHolder, showNotification } = ToastMessage();
    const [form] = Form.useForm();

    const fetchUser = async () => {
        try {
            const response = await checkAuth();
            if (response && (response as any).success) {
                setUser((response as any).data.data.user);
            }
        } catch (error) {
            console.error("Failed to fetch user info", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        setLogsLoading(true);
        try {
            // Fetch logs for the selected date
            const formattedDate = selectedDate.format('YYYY-MM-DD');
            const response = await getDailyLogs(formattedDate);
            if (response && response.success) {
                setMealLogs(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch meal logs", error);
        } finally {
            setLogsLoading(false);
        }
    };

    const fetchWeightLogs = async () => {
        try {
            const response = await getWeightLogsByUser();
            console.log('Weight logs response:', response); // Log the response to verify its format
            if (response && response.weightData && Array.isArray(response.weightData)) {
                setWeightLogs(response.weightData); // Extract weightData array
                setHeightLogs(response.heightData); // Extract heightData array
                console.log('Weight logs set:', response.weightData);
                console.log('Height logs set:', response.heightData);
            } else {
                console.error('Unexpected response format:', response);
            }
        } catch (error) {
            console.error('Failed to fetch weight logs', error);
        }
    };



    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [selectedDate]);

    useEffect(() => {
        if (user) {
            fetchWeightLogs();
        }
    }, [user]);

    const handleEditClick = () => {
        form.setFieldsValue({
            height_cm: user?.height_cm,
            weight_kg: user?.weight_kg,
            target_weight_kg: user?.target_weight_kg,
            activity_level: user?.activity_level,
            target_calorie_amount: user?.target_calorie_amount
        });
        setIsEditModalVisible(true);
    };

    const handleUpdate = async (values: any) => {
        try {
            const response = await updateUser(values);
            if (response && response.user) {
                setUser({ ...user!, ...response.user });
                setIsEditModalVisible(false);
                showNotification('Profile updated successfully', 'success');
            }
        } catch (error: any) {
            console.error("Failed to update profile", error);
            const errorMessage = error.response?.data?.message || 'Failed to update profile';
            showNotification(errorMessage, 'error');
        }
    };

    const handleDeleteLog = async (logId: string) => {
        try {
            await deleteMealLog(logId);
            showNotification('Meal log deleted successfully', 'success');
            fetchLogs();
        } catch (error) {
            console.error("Failed to delete meal log", error);
            showNotification('Failed to delete meal log', 'error');
        }
    };

    // Filter logs by selected date (Not needed anymore as we fetch by date)
    const dailyLogs = mealLogs;

    // Group logs by meal time
    const processLogs = (logs: MealLog[]) => {
        const groups = {
            Breakfast: { logs: [] as MealLog[], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 },
            Lunch: { logs: [] as MealLog[], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 },
            Dinner: { logs: [] as MealLog[], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 },
            Snack: { logs: [] as MealLog[], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 },
        };

        logs.forEach(log => {
            // Normalize meal_time to match keys (case-insensitive)
            const mealTimeKey = Object.keys(groups).find(
                key => key.toLowerCase() === log.meal_time.toLowerCase()
            ) as keyof typeof groups | undefined;

            if (mealTimeKey) {
                const portion = parseFloat(log.portion) || 0;
                const calculatedCalorie = Math.round((log.Food.calorie * portion) / 100);
                const calculatedProtein = Math.round((log.Food.protein_gr * portion) / 100);
                const calculatedCarbs = Math.round((log.Food.carbohydrate_gr * portion) / 100);
                const calculatedFat = Math.round((log.Food.fat_gr * portion) / 100);
                
                groups[mealTimeKey].logs.push(log);
                groups[mealTimeKey].totalCalories += calculatedCalorie;
                groups[mealTimeKey].totalProtein += calculatedProtein;
                groups[mealTimeKey].totalCarbs += calculatedCarbs;
                groups[mealTimeKey].totalFat += calculatedFat;
            }
        });
        return groups;
    };

    const groupedLogs = processLogs(dailyLogs);
    const handleSaveBodyData = async (data: { weight: number; height: number; date; }) => {
    try {
        const formattedData = {
            ...data,
            date: data.date.format('YYYY-MM-DD'), // Tarihi string formatına dönüştür
        };
        console.log('Saving body data:', formattedData);
        const response = await saveBodyData(formattedData);


        if (response) {
            showNotification('Body record added successfully', 'success');
            setIsBodyModalVisible(false);
        }
    } catch (error) {
        console.error('Failed to save body data', error);
        showNotification('Failed to save body data', 'error');
    }
};

    const filteredLogs = mealLogs.filter(log => {
        if (selectedMealType === 'all') return true;
        return log.meal_time.toLowerCase() === selectedMealType.toLowerCase();
    });

    return {
        user,
        loading,
        isEditModalVisible,
        setIsEditModalVisible,
        logsLoading,
        selectedDate,
        setSelectedDate,
        groupedLogs,
        selectedMealType,
        setSelectedMealType,
        isBodyModalVisible,
        setIsBodyModalVisible,
        handleSaveBodyData,
        contextHolder,
        form,
        handleEditClick,
        handleUpdate,
        handleDeleteLog,
        filteredLogs,
        navigate,
        weightLogs,
        heightLogs,
    };
};

export default useProfilePage;