import React from 'react';
import FollowerPage from '../FollowerPage/FollowerPage';
import './ProfilePage.css';
import { Modal, Form, InputNumber, Select, Button, List, Card, Popconfirm, Space, DatePicker, Collapse, Empty } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import useProfilePage, { MealLog } from './ProfilePage.logic';
import dayjs from 'dayjs';

import moment from 'moment';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';

const { Panel } = Collapse;

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
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
        handleDeleteWeightRecord,
        handleDeleteHeightRecord,
        fetchWeightLogs,
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
                borderColor: '#30d158', // Bright Green
                backgroundColor: 'rgba(48, 209, 88, 0.2)',
                borderWidth: 3,
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.3, // Smooth curves
                yAxisID: 'y',
            },
            {
                label: 'Height (cm)',
                data: uniqueDates.map(date => {
                    const log = Array.isArray(heightLogs) ? heightLogs.find(h => moment(h.created_at).format('YYYY-MM-DD') === date) : null;
                    return log ? log.height_cm : null;
                }),
                borderColor: '#FF3B30', // Bright Red
                backgroundColor: 'rgba(255, 59, 48, 0.2)',
                borderWidth: 3,
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.3, // Smooth curves
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
        plugins: {
            legend: {
                labels: {
                    color: '#fff', // White text for legend
                    font: {
                        size: 14
                    }
                }
            },
            tooltip: {
                backgroundColor: '#2c2c2e',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#3a3a3c',
                borderWidth: 1
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#8e8e93' // Light gray for dates
                },
                grid: {
                    color: '#3a3a3c' // Dark grid lines
                }
            },
            y: {
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
                title: {
                    display: true,
                    text: 'Weight (kg)',
                    color: '#30d158', // Green title
                    font: {
                        weight: 'bold' as const
                    }
                },
                ticks: {
                    color: '#8e8e93'
                },
                grid: {
                    color: '#3a3a3c'
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
                    text: 'Height (cm)',
                    color: '#FF3B30', // Red title
                    font: {
                        weight: 'bold' as const
                    }
                },
                ticks: {
                    color: '#8e8e93'
                }
            },
        },
    };

    if (loading) return <div className="profile-loading">Loading...</div>;
    if (!user) return <div className="profile-error">User not found</div>;

    // Calculate total daily macros and calories
    const totalDailyProtein = groupedLogs.Breakfast.totalProtein + groupedLogs.Lunch.totalProtein + groupedLogs.Dinner.totalProtein + groupedLogs.Snack.totalProtein;
    const totalDailyCarbs = groupedLogs.Breakfast.totalCarbs + groupedLogs.Lunch.totalCarbs + groupedLogs.Dinner.totalCarbs + groupedLogs.Snack.totalCarbs;
    const totalDailyFat = groupedLogs.Breakfast.totalFat + groupedLogs.Lunch.totalFat + groupedLogs.Dinner.totalFat + groupedLogs.Snack.totalFat;
    const totalDailyCalories = groupedLogs.Breakfast.totalCalories + groupedLogs.Lunch.totalCalories + groupedLogs.Dinner.totalCalories + groupedLogs.Snack.totalCalories;

    const targetCalories = user.target_calorie_amount;
    const hasTarget = targetCalories && targetCalories > 0;
    const remainingCalories = hasTarget ? targetCalories - totalDailyCalories : 0;

    // Macro Calories for Chart (1g Protein=4kcal, 1g Carb=4kcal, 1g Fat=9kcal)
    const proteinCals = totalDailyProtein * 4;
    const carbCals = totalDailyCarbs * 4;
    const fatCals = totalDailyFat * 9;
    const totalMacroCals = proteinCals + carbCals + fatCals;

    const proteinPct = totalMacroCals > 0 ? Math.round((proteinCals / totalMacroCals) * 100) : 0;
    const carbPct = totalMacroCals > 0 ? Math.round((carbCals / totalMacroCals) * 100) : 0;
    const fatPct = totalMacroCals > 0 ? Math.round((fatCals / totalMacroCals) * 100) : 0;

    const doughnutData = {
        labels: ['Carbohydrate', 'Fat', 'Protein'],
        datasets: [
            {
                data: [carbCals, fatCals, proteinCals],
                backgroundColor: [
                    '#5AC8FA', // Carbs - Blue
                    '#FFCC00', // Fat - Yellow
                    '#FF3B30', // Protein - Red
                ],
                borderWidth: 0,
            },
        ],
    };

    const doughnutOptions = {
        responsive: true,
        cutout: '70%',
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        return `${context.label}: ${Math.round(context.raw)} kcal`;
                    }
                }
            }
        },
    };

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
                                <Button 
                                    type="text" 
                                    danger 
                                    icon={<DeleteOutlined />} 
                                    size="small"
                                    onClick={() => handleDeleteLog(item.meal_log_id)}
                                />
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

    const handleDeleteRecord = async (recordId, type) => {
    // Burada silme işlemini gerçekleştirecek olan hazır fonksiyonunuzu çağırın.
    // 'type' değişkeni (örneğin 'weight' veya 'height') hangi API endpoint'ini 
    // veya hangi veritabanı tablosunu kullanmanız gerektiğini belirleyebilir.
    console.log('handledeleterecordID:' ,recordId ) 
    console.log('handledeleterecord type:' ,type )
    try {
        if (type === 'weight') {
            await handleDeleteWeightRecord(recordId); // Kilo kaydı silme fonksiyonunuz
        } else if (type === 'height') {
            await handleDeleteHeightRecord(recordId); // Boy kaydı silme fonksiyonunuz
        }
        
        // Silme başarılı olduktan sonra, tabloyu güncellemek için verileri yeniden çekin veya state'i güncelleyin
        fetchWeightLogs(); 
        console.log('Kayıt başarıyla silindi!');
    } catch (error) {
        console.log('Silme işlemi başarısız oldu.');
    }
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


            <div className="profile-section body-charts">
                <h3 style={{ textAlign: 'left' }}>Body Records Chart</h3>
                {weightLogs.length > 0 ? (
                    <Line data={chartData} options={chartOptions} />
                ) : (
                    <p>No data available for charts.</p>
                )}
            </div>

            <div className="profile-section">
                <Collapse ghost className="meal-collapse">
                    <Panel header="Body Records" key="1" extra={
                        <Button type="primary" size="small" onClick={(e) => {
                            e.stopPropagation();
                            setIsBodyModalVisible(true);
                        }}>
                            Add Record
                        </Button>
                    }>
                        <div className="body-records-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Height (cm)</th>
                                        <th></th>
                                        <th>Weight (kg)</th>
                                        <th></th>
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
                                                <td>
                                                    {/* Boy kaydı varsa, silme butonu göster */}
                                                 {heightLog && (
                                                     <Button 
                                                         type="text" 
                                                         danger 
                                                         size="small"
                                                         onClick={() => handleDeleteRecord(heightLog.log_id, 'height')} // heightLog'un id'sini ve tipini fonksiyona gönder
                                                         icon={<DeleteOutlined />} 
                                                     />
                                                 )}
                                                </td>
                                                <td>{weightLog?.weight_kg || "-"}</td>
                                             <td>
                                                 {/* Kilo kaydı varsa, silme butonu göster */}
                                                 {weightLog && (
                                                     <Button 
                                                         type="text" 
                                                         danger     
                                                         size="small"
                                                         onClick={() => handleDeleteRecord(weightLog.log_id, 'weight')} // weightLog'un id'sini ve tipini fonksiyona gönder
                                                         icon={<DeleteOutlined />} 
                                                     />
                                                 )}
                                                
                                             </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>

                            </table>
                        </div>
                    </Panel>
                </Collapse>
                <Modal
                    title="Add Body Record"
                    open={isBodyModalVisible}
                    onCancel={() => setIsBodyModalVisible(false)}
                    footer={null}
                    className="dark-modal"
                >
                    <Form layout="vertical" onFinish={handleSaveBodyData}>
                        <Form.Item name="weight" label="Weight (kg)" rules={[{ required: true, message: 'Please enter your weight' }]}>
                            <InputNumber min={0} max={500} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="height" label="Height (cm)" rules={[{ required: true, message: 'Please enter your height' }]}>
                            <InputNumber min={0} max={300} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="date" label="Date" initialValue={moment()} rules={[{ required: true, message: 'Please select a date' }]}>
                            <DatePicker style={{ width: '100%' }} defaultValue={moment()} popupClassName="dark-date-picker-dropdown" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" block>
                                Save Record
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
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
                            popupClassName="dark-date-picker-dropdown"
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
                    <Collapse 
                        key={selectedDate.format('YYYY-MM-DD')}
                        defaultActiveKey={[
                            groupedLogs.Breakfast.logs.length > 0 ? '1' : '',
                            groupedLogs.Lunch.logs.length > 0 ? '2' : '',
                            groupedLogs.Dinner.logs.length > 0 ? '3' : '',
                            groupedLogs.Snack.logs.length > 0 ? '4' : ''
                        ].filter(Boolean)} 
                        ghost 
                        className="meal-collapse"
                    >
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
                {/* Header Summary */}
                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ color: '#fff', margin: '0 0 15px 0', fontSize: '18px', fontWeight: 600, textAlign: 'left' }}>Daily Macro Breakdown</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                        {hasTarget && (
                            <div>
                                <div style={{ color: '#8e8e93', marginBottom: '4px' }}>Remaining Calories</div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{remainingCalories}</div>
                            </div>
                        )}
                        <div style={{ textAlign: hasTarget ? 'right' : 'left' }}>
                            <div style={{ color: '#8e8e93', marginBottom: '4px' }}>Taken Calories</div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{totalDailyCalories}</div>
                        </div>
                    </div>
                    {hasTarget && (
                        <>
                            <div style={{ marginTop: '5px', color: '#8e8e93', fontSize: '12px', textAlign: 'right' }}>
                                Target: {targetCalories} kcal
                            </div>
                            {/* Progress Bar */}
                            <div style={{ 
                                height: '10px', 
                                backgroundColor: '#3a3a3c', 
                                borderRadius: '5px', 
                                marginTop: '10px', 
                                overflow: 'hidden' 
                            }}>
                                <div style={{ 
                                    width: `${Math.min(100, (totalDailyCalories / targetCalories) * 100)}%`, 
                                    height: '100%', 
                                    backgroundColor: remainingCalories < 0 ? '#FF3B30' : '#30d158',
                                    transition: 'width 0.5s ease-in-out'
                                }} />
                            </div>
                        </>
                    )}
                </div>

                {/* Chart Section */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    {/* Legend */}
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#5AC8FA', marginRight: '10px' }}></div>
                            <span style={{ fontSize: '15px', fontWeight: 500 }}>Carbs: {carbPct}%</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#FFCC00', marginRight: '10px' }}></div>
                            <span style={{ fontSize: '15px', fontWeight: 500 }}>Fat: {fatPct}%</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#FF3B30', marginRight: '10px' }}></div>
                            <span style={{ fontSize: '15px', fontWeight: 500 }}>Protein: {proteinPct}%</span>
                        </div>
                    </div>
                    {/* Chart */}
                    <div style={{ width: '140px', height: '140px', position: 'relative' }}>
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                    </div>
                </div>

                {/* Details List */}
                <div style={{ borderTop: '1px solid #3a3a3c', paddingTop: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                        <span style={{ color: '#fff' }}>Total Fat</span>
                        <span style={{ color: '#8e8e93' }}>{totalDailyFat}g</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                        <span style={{ color: '#fff' }}>Total Carbohydrate</span>
                        <span style={{ color: '#8e8e93' }}>{totalDailyCarbs}g</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                        <span style={{ color: '#fff' }}>Protein</span>
                        <span style={{ color: '#8e8e93' }}>{totalDailyProtein}g</span>
                    </div>
                </div>
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
                className="dark-modal"
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
                        <Select popupClassName="dark-select-dropdown">
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
