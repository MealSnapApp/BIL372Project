import React from 'react';
import FollowerPage from '../FollowerPage/FollowerPage';
import './ProfilePage.css';
import { Modal, Form, InputNumber, Select, Button, List, Card, Popconfirm, Space, DatePicker } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import useProfilePage from './ProfilePage.logic';
import moment from 'moment';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const ProfilePage: React.FC = () => {
    const {
        user,
        loading,
        isEditModalVisible,
        setIsEditModalVisible,
        logsLoading,
        selectedMealType,
        setSelectedMealType,
        contextHolder,
        form,
        handleEditClick,
        handleUpdate,
        handleDeleteLog,
        filteredLogs,
        navigate,
        isBodyModalVisible,
        setIsBodyModalVisible,
        handleSaveBodyData,
        weightLogs,
        heightLogs,
    } = useProfilePage();

    const chartData = {
        labels: Array.isArray(weightLogs) ? weightLogs.map((log) => log.date) : [],
        datasets: [
            {
                label: 'Weight (kg)',
                data: Array.isArray(weightLogs) ? weightLogs.map((log) => log.weight_kg) : [],
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                yAxisID: 'y',
            },
            {
                label: 'Height (cm)',
                data: Array.isArray(weightLogs) ? weightLogs.map((log) => {
                    const h = heightLogs.find(h => h.date === log.date);
                    return h ? h.height_cm : null;
                }) : [],
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                yAxisID: 'y1',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        stacked: false,
        scales: {
            y: {
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
                title: {
                    display: true,
                    text: 'Weight (kg)'
                }
            },
            y1: {
                type: 'linear' as const,
                display: true,
                position: 'right' as const,
                grid: {
                    drawOnChartArea: false,
                },
                title: {
                    display: true,
                    text: 'Height (cm)'
                }
            },
        },
    };
    

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


            <div className="profile-section body-records">
                <div>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Height (cm)</th>
                                <th>Weight (kg)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {weightLogs.map((log, index) => (
                                <tr key={index}>
                                    <td>{log.date}</td>
                                    <td>{heightLogs.find(h => h.date === log.date)?.height_cm || "-"}</td>
                                    <td>{log.weight_kg}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Button type="primary" onClick={() => setIsBodyModalVisible(true)}>
                    Add Record
                </Button>
                <Modal
                    title="Add Body Record"
                    open={isBodyModalVisible}
                    onCancel={() => setIsBodyModalVisible(false)}
                    footer={null}
                >
                    <Form layout="vertical" onFinish={handleSaveBodyData}>
                        <Form.Item name="weight" label="Weight (kg)" rules={[{ required: true, message: 'Please enter your weight' }]}>
                            <InputNumber min={0} max={500} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="height" label="Height (cm)" rules={[{ required: true, message: 'Please enter your height' }]}>
                            <InputNumber min={0} max={300} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="date" label="Date" initialValue={moment()} rules={[{ required: true, message: 'Please select a date' }]}>
                            <DatePicker style={{ width: '100%' }} defaultValue={moment()} />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" block>
                                Save Record
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
                </div>
            </div>

            <div className="profile-section body-charts">
                <h3 style={{ textAlign: 'left' }}>Body Records Chart</h3>
                {weightLogs.length > 0 ? (
                    <Line data={chartData} options={chartOptions} />
                ) : (
                    <p>No data available for charts.</p>
                )}
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
