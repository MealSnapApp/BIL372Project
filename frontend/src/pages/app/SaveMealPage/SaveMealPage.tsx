import React from 'react';
import './SaveMealPage.css';
import useSaveMealPage from './SaveMealPage.logic';
import { FaPlus, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const FaPlusIcon = FaPlus as any;
const FaTimesIcon = FaTimes as any;
const FaChevronLeftIcon = FaChevronLeft as any;
const FaChevronRightIcon = FaChevronRight as any;

const SaveMealPage: React.FC = () => {
  const {
    meals,
    isModalVisible,
    currentMealType,
    searchTerm,
    setSearchTerm,
    filteredFoods,
    handleAddFoodClick,
    handleCloseModal,
    totalDailyCalories,
    selectedFoodForDetail,
    portionAmount,
    setPortionAmount,
    handleSelectFood,
    handleBackToSearch,
    handleConfirmAddFood,
    selectedDate,
    setSelectedDate,
    weekDays,
    handlePrevWeek,
    handleNextWeek,
    contextHolder
  } = useSaveMealPage();

  return (
    <div className="save-meal-container">
      {contextHolder}
      <div className="daily-summary">
        <h2>Daily Summary</h2>
        
        <div className="calendar-container">
          <button className="nav-button" onClick={handlePrevWeek}>
            <FaChevronLeftIcon />
          </button>
          
          <div className="week-calendar">
            {weekDays.map((day) => (
              <div 
                key={day.date} 
                className={`calendar-day ${day.date === selectedDate ? 'active' : ''}`}
                onClick={() => setSelectedDate(day.date)}
              >
                <span className="day-name">{day.dayName}</span>
                <span className="day-number">{day.dayNumber}</span>
              </div>
            ))}
          </div>

          <button className="nav-button" onClick={handleNextWeek}>
            <FaChevronRightIcon />
          </button>
        </div>

        <div className="calories">{totalDailyCalories} kcal</div>
        <p>Consumed on {new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {meals.map((meal) => (
        <div key={meal.id} className="meal-section">
          <div className="meal-header">
            <h3>{meal.title}</h3>
            <span className="meal-calories">{meal.totalCalories} kcal</span>
          </div>
          
          {meal.items.length > 0 && (
            <ul className="food-list">
              {meal.items.map((item, index) => (
                <li key={`${item.food_name}-${index}`} className="food-item">
                  <div className="food-info">
                    <span className="food-name">{item.food_name}</span>
                    {/* <span className="food-portion">{item.portion_size} g</span> */}
                  </div>
                  <span className="food-calories">{item.calorie} kcal</span>
                </li>
              ))}
            </ul>
          )}

          <button 
            className="add-button"
            onClick={() => handleAddFoodClick(meal.id)}
          >
            <FaPlusIcon /> Add Food
          </button>
        </div>
      ))}

      {isModalVisible && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {selectedFoodForDetail 
                  ? selectedFoodForDetail.food_name 
                  : `Add to ${meals.find(m => m.id === currentMealType)?.title}`
                }
              </h3>
              <button className="close-button" onClick={handleCloseModal}>
                <FaTimesIcon />
              </button>
            </div>
            
            {!selectedFoodForDetail ? (
              <>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search for food (e.g., Egg, Apple)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />

                <div className="search-results">
                  {filteredFoods.length > 0 ? (
                    filteredFoods.map((food) => (
                      <div 
                        key={food.food_name} 
                        className="search-result-item"
                        onClick={() => handleSelectFood(food)}
                      >
                        <div className="food-info">
                          <span className="food-name">{food.food_name}</span>
                          <span className="food-portion">100 g</span>
                        </div>
                        <div className="food-calories">
                          {food.calorie} kcal
                          <span className="add-icon" style={{marginLeft: '10px'}}>+</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{textAlign: 'center', color: '#888', padding: '2rem'}}>
                      No foods found matching "{searchTerm}"
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="food-detail-view">
                <div className="food-detail-info">
                  <p>Base Calories: <strong>{selectedFoodForDetail.calorie} kcal</strong> per 100g</p>
                </div>
                
                <div className="portion-input-container">
                  <label>Amount (grams):</label>
                  <input 
                    type="number" 
                    className="portion-input"
                    value={portionAmount}
                    onChange={(e) => setPortionAmount(Number(e.target.value))}
                    min="1"
                  />
                </div>

                <div className="calculated-calories">
                  Calculated: <strong>{Math.round((selectedFoodForDetail.calorie * portionAmount) / 100)} kcal</strong>
                </div>

                <div className="detail-actions">
                  <button className="back-button" onClick={handleBackToSearch}>Back</button>
                  <button className="confirm-button" onClick={handleConfirmAddFood}>Add to Meal</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SaveMealPage;
