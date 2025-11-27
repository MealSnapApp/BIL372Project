import React from 'react';
import './SaveMealPage.css';
import useSaveMealPage from './SaveMealPage.logic';
import { FaPlus, FaTimes } from 'react-icons/fa';

const FaPlusIcon = FaPlus as any;
const FaTimesIcon = FaTimes as any;

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
    handleAddFoodItem,
    totalDailyCalories
  } = useSaveMealPage();

  return (
    <div className="save-meal-container">
      <div className="daily-summary">
        <h2>Daily Summary</h2>
        <div className="calories">{totalDailyCalories} kcal</div>
        <p>Consumed Today</p>
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
                <li key={`${item.food_id}-${index}`} className="food-item">
                  <div className="food-info">
                    <span className="food-name">{item.food_name}</span>
                    <span className="food-portion">{item.portion_size}</span>
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
              <h3>Add to {meals.find(m => m.id === currentMealType)?.title}</h3>
              <button className="close-button" onClick={handleCloseModal}>
                <FaTimesIcon />
              </button>
            </div>
            
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
                    key={food.food_id} 
                    className="search-result-item"
                    onClick={() => handleAddFoodItem(food)}
                  >
                    <div className="food-info">
                      <span className="food-name">{food.food_name}</span>
                      <span className="food-portion">{food.portion_size}</span>
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
          </div>
        </div>
      )}
    </div>
  );
};

export default SaveMealPage;
