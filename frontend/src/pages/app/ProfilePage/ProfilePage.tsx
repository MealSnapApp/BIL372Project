import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuth } from '../../../services/AuthServices/AuthService.export';
import { updateUser } from '../../../services/UserServices/UserService';
import { getAllUserLogs, deleteMealLog } from '../../../services/MealLogServices/MealLogService';
import FollowerPage from '../FollowerPage/FollowerPage';
import './ProfilePage.css';
import { Modal, Form, Input, InputNumber, Select, Button, List, Card, Popconfirm, Space } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { ToastMessage } from '../../../utils/ToastMessage/ToastMessage';

interface User {
    user_id: string;
    name: string;
    surname: string;
    username: string;
    email: string;
    height_cm?: number;
    target_weight_kg?: number;
    activity_level?: string;
    target_calorie_amount?: number;
}

interface MealLog {
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

const ProfilePage: React.FC = () => {
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

    if (loading) return <div className="profile-loading">Loading...</div>;
    if (!user) return <div className="profile-error">User not found</div>;

    return (
        <div className="profile-page-container">
            {contextHolder}
            <div className="profile-header">
                <div className="profile-avatar">
                    <div className="avatar-circle">
                        {user.name?.charAt(0).toUpperCase() || '?'}{user.surname?.charAt(0).toUpperCase() || '?'}
                    </div>
                </div>
                <div className="profile-info">
                    <h1>{user.name} {user.surname}</h1>
                    <p className="profile-username">@{user.username}</p>
                    <p className="profile-email">{user.email}</p>
                    <div className="profile-stats">
                        <span>Height: {user.height_cm || '-'} cm</span>
                        <span>Target Weight: {user.target_weight_kg || '-'} kg</span>
                        <span>Activity: {user.activity_level || '-'}</span>
                        <span>Target Calories: {user.target_calorie_amount || '-'} kcal</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <Button type="primary" onClick={handleEditClick}>
                            Edit Profile
                        </Button>
                    </div>
                </div>
            </div>

            <div className="profile-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3>My Meal Logs</h3>
                    <Space>
                        <Select 
                            defaultValue="all" 
                            style={{ width: 120 }} 
                            onChange={setSelectedMealType}
                            options={[
                                { value: 'all', label: 'All Meals' },
                                { value: 'breakfast', label: 'Breakfast' },
                                { value: 'lunch', label: 'Lunch' },
                                { value: 'dinner', label: 'Dinner' },
                                { value: 'snack', label: 'Snack' },
                            ]}
                        />
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />} 
                            onClick={() => navigate('/save-meal')}
                        >
                            Add Meal
                        </Button>
                    </Space>
                </div>
                <List
                    loading={logsLoading}
                    grid={{ gutter: 16, column: 1 }}
                    dataSource={filteredLogs}
                    renderItem={(item) => (
                        <List.Item>
                            <Card 
                                title={item.Food.food_name} 
                                size="small"
                                extra={
                                    <Popconfirm
                                        title="Delete meal log"
                                        description="Are you sure to delete this log?"
                                        onConfirm={() => handleDeleteLog(item.meal_log_id)}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button 
                                            type="text" 
                                            danger 
                                            icon={<DeleteOutlined />} 
                                        />
                                    </Popconfirm>
                                }
                            >
                                <p>Date: {item.date}</p>
                                <p>Time: {item.meal_time}</p>
                                <p>Calories: {item.Food.calorie} kcal</p>
                                <p>Portion: {item.portion} ({item.Food.portion_size})</p>
                            </Card>
                        </List.Item>
                    )}
                    locale={{ emptyText: 'No meal logs found' }}
                />
            </div>
            
            <div className="profile-section">
                <h3>Followers & Following</h3>
                <FollowerPage userId={user.user_id} currentUserId={user.user_id} />
            </div>

            <Modal
                title="Edit Profile"
                open={isEditModalVisible}
                onCancel={() => setIsEditModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdate}
                >
                    <Form.Item name="height_cm" label="Height (cm)">
                        <InputNumber min={0} max={300} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="target_weight_kg" label="Target Weight (kg)">
                        <InputNumber min={0} max={500} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="activity_level" label="Activity Level">
                        <Select>
                            <Select.Option value="Sedentary">Sedentary</Select.Option>
                            <Select.Option value="Lightly Active">Lightly Active</Select.Option>
                            <Select.Option value="Moderately Active">Moderately Active</Select.Option>
                            <Select.Option value="Very Active">Very Active</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="target_calorie_amount" label="Target Daily Calories">
                        <InputNumber min={0} max={10000} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Save Changes
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProfilePage;
