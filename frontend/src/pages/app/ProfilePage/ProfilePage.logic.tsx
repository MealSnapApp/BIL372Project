import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form } from 'antd';
import { checkAuth } from '../../../services/AuthServices/AuthService.export';
import { updateUser } from '../../../services/UserServices/UserService';
import { getAllUserLogs, deleteMealLog } from '../../../services/MealLogServices/MealLogService';
import { ToastMessage } from '../../../utils/ToastMessage/ToastMessage';

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
        portion_size: string;
    }
}

const useProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [selectedMealType, setSelectedMealType] = useState<string>('all');
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
            const response = await getAllUserLogs();
            if (response && response.success) {
                setMealLogs(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch meal logs", error);
        } finally {
            setLogsLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
        fetchLogs();
    }, []);

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

    const filteredLogs = mealLogs.filter(log => {
        if (selectedMealType === 'all') return true;
        return log.meal_time.toLowerCase() === selectedMealType.toLowerCase();
    });

    return {
        user,
        loading,
        isEditModalVisible,
        setIsEditModalVisible,
        mealLogs,
        logsLoading,
        selectedMealType,
        setSelectedMealType,
        contextHolder,
        form,
        handleEditClick,
        handleUpdate,
        handleDeleteLog,
        filteredLogs,
        navigate
    };
};

export default useProfilePage;