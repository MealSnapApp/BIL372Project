import React, { useState, useEffect } from 'react';
import './HomePage.css';
import { Button, Collapse, Space, DatePicker, List, Popconfirm, Empty, Card } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Modal, Input, Upload, message } from 'antd';
import { UploadOutlined, HeartOutlined, HeartFilled, MessageOutlined, UserOutlined } from '@ant-design/icons';
import { createPost, uploadImage, getRecentPosts, likePost, unlikePost, listPostLikes, listComments, addComment, bookmarkPost, unbookmarkPost, listSavedPosts, updatePost } from '../../../services/PostServices/PostService';
import { followUser, unfollowUser, isFollowing } from '../../../services/FollowerServices/FollowerService';
import { checkAuth } from '../../../services/AuthServices/AuthService.export';
import { getDailyLogs, deleteMealLog } from '../../../services/MealLogServices/MealLogService';
import { ToastMessage } from '../../../utils/ToastMessage/ToastMessage';
import { useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import { Doughnut } from 'react-chartjs-2';
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

const { Panel } = Collapse;

interface User {
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

interface MealLog {
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

const HomePage = () => {
  const navigate = useNavigate();

  // Profile/Log Logic State
  const [user, setUser] = useState<User | null>(null);
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const { contextHolder, showNotification } = ToastMessage();

  const fetchUser = async () => {
      try {
          const response = await checkAuth();
          if (response && (response as any).success) {
              setUser((response as any).data.data.user);
          }
      } catch (error) {
          console.error("Failed to fetch user info", error);
      }
  };

  const fetchLogs = async () => {
      setLogsLoading(true);
      try {
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

  useEffect(() => {
      fetchUser();
  }, []);

  useEffect(() => {
      fetchLogs();
  }, [selectedDate]);

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

  const processLogs = (logs: MealLog[]) => {
      const groups = {
          Breakfast: { logs: [] as MealLog[], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 },
          Lunch: { logs: [] as MealLog[], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 },
          Dinner: { logs: [] as MealLog[], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 },
          Snack: { logs: [] as MealLog[], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 },
      };

      logs.forEach(log => {
          const mealTimeKey = Object.keys(groups).find(
              key => key.toLowerCase() === log.meal_time.toLowerCase()
          ) as keyof typeof groups | undefined;

          if (mealTimeKey) {
              groups[mealTimeKey].logs.push(log);
              groups[mealTimeKey].totalCalories += log.Food.calorie;
              groups[mealTimeKey].totalProtein += log.Food.protein_gr;
              groups[mealTimeKey].totalCarbs += log.Food.carbohydrate_gr;
              groups[mealTimeKey].totalFat += log.Food.fat_gr;
          }
      });

      // Round values
      Object.keys(groups).forEach(key => {
          const k = key as keyof typeof groups;
          groups[k].totalCalories = Math.round(groups[k].totalCalories);
          groups[k].totalProtein = Math.round(groups[k].totalProtein);
          groups[k].totalCarbs = Math.round(groups[k].totalCarbs);
          groups[k].totalFat = Math.round(groups[k].totalFat);
      });

      return groups;
  };

  const groupedLogs = processLogs(mealLogs);

  // Calculate daily totals
  const totalDailyCalories = Object.values(groupedLogs).reduce((acc, curr) => acc + curr.totalCalories, 0);
  const totalDailyProtein = Object.values(groupedLogs).reduce((acc, curr) => acc + curr.totalProtein, 0);
  const totalDailyCarbs = Object.values(groupedLogs).reduce((acc, curr) => acc + curr.totalCarbs, 0);
  const totalDailyFat = Object.values(groupedLogs).reduce((acc, curr) => acc + curr.totalFat, 0);

  // Calculate percentages
  const totalMacros = totalDailyProtein + totalDailyCarbs + totalDailyFat;
  const proteinPct = totalMacros > 0 ? Math.round((totalDailyProtein / totalMacros) * 100) : 0;
  const carbPct = totalMacros > 0 ? Math.round((totalDailyCarbs / totalMacros) * 100) : 0;
  const fatPct = totalMacros > 0 ? Math.round((totalDailyFat / totalMacros) * 100) : 0;

  const targetCalories = user?.target_calorie_amount || 2000;
  const remainingCalories = targetCalories - totalDailyCalories;
  const hasTarget = !!user?.target_calorie_amount;

  const doughnutData = {
      labels: ['Carbs', 'Fat', 'Protein'],
      datasets: [
          {
              data: [totalDailyCarbs, totalDailyFat, totalDailyProtein],
              backgroundColor: ['#5AC8FA', '#FFCC00', '#FF3B30'],
              borderWidth: 0,
          },
      ],
  };

  const doughnutOptions = {
      cutout: '75%',
      plugins: {
          legend: { display: false },
          tooltip: { enabled: true },
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
                              <Popconfirm
                                  title="Delete this meal log?"
                                  onConfirm={() => handleDeleteLog(item.meal_log_id)}
                                  okText="Yes"
                                  cancelText="No"
                              >
                                  <Button type="text" danger icon={<DeleteOutlined />} size="small" />
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
                              <span style={{ fontWeight: 'bold', color: '#fff' }}>{calculatedCalorie} kcal</span>
                          </div>
                      </Card>
                  );
              })}
          </div>
      );
  };

  return (
    <div className="home-page-container">
      {contextHolder}
      <div className="welcome-section">
        <h1>Welcome Back!</h1>
        <p>Track your meals and stay healthy.</p>
        <Button type="primary" onClick={() => navigate('/save-meal')}>Save Meal</Button>
      </div>

      {/* Meal Logs Section */}
      <div className="profile-section" style={{ marginTop: '20px' }}>
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

      {/* Daily Macro Breakdown Section */}
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
    </div>
  );
};

export default HomePage;
