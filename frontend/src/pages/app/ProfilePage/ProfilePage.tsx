import React from 'react';
import FollowerPage from '../FollowerPage/FollowerPage';
import './ProfilePage.css';
import { Modal, Form, InputNumber, Select, Button, List, Card, Popconfirm, Space, DatePicker, Collapse, Empty } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import useProfilePage, { MealLog } from './ProfilePage.logic';
import dayjs from 'dayjs';

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

const { Panel } = Collapse;

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
        selectedDate,
        setSelectedDate,
        groupedLogs,
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

    // Get all unique dates from both logs
    const uniqueDates = Array.from(new Set([
        ...(Array.isArray(weightLogs) ? weightLogs.map(log => moment(log.created_at).format('YYYY-MM-DD')) : []),
        ...(Array.isArray(heightLogs) ? heightLogs.map(log => moment(log.created_at).format('YYYY-MM-DD')) : [])
    ])).sort((a, b) => moment(a).valueOf() - moment(b).valueOf());

    const chartData = {
        labels: uniqueDates,
        datasets: [
            {
                label: 'Weight (kg)',
                data: uniqueDates.map(date => {
                    const log = Array.isArray(weightLogs) ? weightLogs.find(w => moment(w.created_at).format('YYYY-MM-DD') === date) : null;
                    return log ? log.weight_kg : null;
                }),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                yAxisID: 'y',
            },
            {
                label: 'Height (cm)',
                data: uniqueDates.map(date => {
                    const log = Array.isArray(heightLogs) ? heightLogs.find(h => moment(h.created_at).format('YYYY-MM-DD') === date) : null;
                    return log ? log.height_cm : null;
                }),
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

    const renderMealList = (logs: MealLog[]) => {
        if (logs.length === 0) return <Empty description="No meals logged" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
        
        return (
            <div className="meal-list-container">
                {logs.map(item => {
                    const portion = parseFloat(item.portion) || 0;
                    const calculatedCalorie = Math.round((item.Food.calorie * portion) / 100);
                    const calculatedProtein = Math.round((item.Food.protein_gr * portion) / 100);
                    const calculatedCarbs = Math.round((item.Food.carbohydrate_gr * portion) / 100);
                    const calculatedFat = Math.round((item.Food.fat_gr * portion) / 100);

                    return (
                        <Card 
                            key={item.meal_log_id}
                            size="small"
                            className="meal-log-card"
                            title={
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>{item.Food.food_name}</span>
                                    <span style={{ fontSize: '12px', color: '#888', fontWeight: 'normal' }}>{item.meal_time}</span>
                                </div>
                            }
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
                                        size="small"
                                    />
                                </Popconfirm>
                            }
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <span style={{ display: 'block', marginBottom: '4px' }}>{item.portion} g</span>
                                    <span style={{ fontSize: '12px', color: '#666' }}>
                                        Protein: {calculatedProtein}g | Carbohydrate: {calculatedCarbs}g | Fat: {calculatedFat}g
                                    </span>
                                </div>
                                <span style={{ fontWeight: 'bold', color: '#19850B' }}>{calculatedCalorie} kcal</span>
                            </div>
                        </Card>
                    );
                })}
            </div>
        );
    };

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
                        <span>Weight: {user.weight_kg || '-'} kg</span>
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
                            {uniqueDates.map((date, index) => {
                                const weightLog = Array.isArray(weightLogs) ? weightLogs.find(w => moment(w.created_at).format('YYYY-MM-DD') === date) : null;
                                const heightLog = Array.isArray(heightLogs) ? heightLogs.find(h => moment(h.created_at).format('YYYY-MM-DD') === date) : null;
                                
                                return (
                                    <tr key={index}>
                                        <td>{date}</td>
                                        <td>{heightLog?.height_cm || "-"}</td>
                                        <td>{weightLog?.weight_kg || "-"}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
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
                        <DatePicker 
                            value={selectedDate} 
                            onChange={(date) => setSelectedDate(date || dayjs())}
                            allowClear={false}
                            format="YYYY-MM-DD"
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
                
                {logsLoading ? (
                    <div className="loading-spinner">Loading logs...</div>
                ) : (
                    <Collapse defaultActiveKey={['1', '2', '3', '4']} ghost className="meal-collapse">
                        <Panel header={`Breakfast (${groupedLogs.Breakfast.totalCalories} kcal - Protein:${groupedLogs.Breakfast.totalProtein}g Carbohydrate:${groupedLogs.Breakfast.totalCarbs}g Fat:${groupedLogs.Breakfast.totalFat}g)`} key="1">
                            {renderMealList(groupedLogs.Breakfast.logs)}
                        </Panel>
                        <Panel header={`Lunch (${groupedLogs.Lunch.totalCalories} kcal - Protein:${groupedLogs.Lunch.totalProtein}g Carbohydrate:${groupedLogs.Lunch.totalCarbs}g Fat:${groupedLogs.Lunch.totalFat}g)`} key="2">
                            {renderMealList(groupedLogs.Lunch.logs)}
                        </Panel>
                        <Panel header={`Dinner (${groupedLogs.Dinner.totalCalories} kcal - Protein:${groupedLogs.Dinner.totalProtein}g Carbohydrate:${groupedLogs.Dinner.totalCarbs}g Fat:${groupedLogs.Dinner.totalFat}g)`} key="3">
                            {renderMealList(groupedLogs.Dinner.logs)}
                        </Panel>
                        <Panel header={`Snack (${groupedLogs.Snack.totalCalories} kcal - Protein:${groupedLogs.Snack.totalProtein}g Carbohydrate:${groupedLogs.Snack.totalCarbs}g Fat:${groupedLogs.Snack.totalFat}g)`} key="4">
                            {renderMealList(groupedLogs.Snack.logs)}
                        </Panel>
                    </Collapse>
                )}
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
                    <Form.Item name="weight_kg" label="Weight (kg)">
                        <InputNumber min={0} max={500} style={{ width: '100%' }} />
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
