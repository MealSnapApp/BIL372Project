import './App.css';
import {Routes, Route, Outlet } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

import WelcomePage from './pages/auth/welcomePage/welcomePage';
import HomePage from './pages/app/HomePage/HomePage';
import SaveMealPage from './pages/app/SaveMealPage/SaveMealPage';
import ProfilePage from './pages/app/ProfilePage/ProfilePage';
import TrendsPage from './pages/app/TrendsPage/TrendsPage';
import SavedRecipes from './pages/app/SavedRecipes/SavedRecipes';
import LikedRecipes from './pages/app/LikedRecipes/LikedRecipes';
import MyPosts from './pages/app/MyPosts/MyPosts';
import PostsPage from './pages/app/Posts/PostsPage';

import AppLayout from './utils/AppLayout/AppLayout';
import ProtectedRoute from './utils/ProtectedRoute/ProtectedRoute';

// import { pageTypes } from './config/constants';

function App() {

  return (
    <div className='App'>
      <Routes>
        <Route
          element={<div className='login-layout'><Outlet /></div>}
        >
          <Route path='/login' element={<WelcomePage />}/>
          <Route path='/' element={<Navigate to="/login" replace />}/>
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/home" element={<HomePage />}/>
            <Route path="/save-meal" element={<SaveMealPage />}/>
            <Route path="/user-recipes" element={<ProfilePage />}/>
            <Route path="/trends" element={<TrendsPage />}/>
            <Route path="/user-posts" element={<MyPosts />}/>
            <Route path="/saved-posts" element={<SavedRecipes />}/>
            <Route path="/liked-posts" element={<LikedRecipes />}/>
            <Route path="/posts" element={<PostsPage />}/>
            {/** Backward-compat routes */}
            <Route path="/saved-recipes" element={<SavedRecipes />}/>
            <Route path="/liked-recipes" element={<LikedRecipes />}/>
            {/* 
            <Route path="/trends" element={<ShowRecipes type={pageTypes.TRENDS}/>}/>
            <Route path="/saved-recipes" element={<ShowRecipes type={pageTypes.BOOKMARKS}/>}/>
            <Route path="/liked-recipes" element={<ShowRecipes type={pageTypes.LIKES}/>}/>
            <Route path="/send-recipe" element={<SendRecipePage />} />
            <Route path="/edit-recipe/:id" element={<SendRecipePage />} />
            <Route path="/recipe/:id" element={<ViewRecipePage />} />
            <Route path="/recipes" element={<ShowRecipes type= {pageTypes.FILTEREDS}/>}/>
            */}
            <Route path='/*' element={<Navigate to="/home" replace/>}/>
          </Route>
        </Route> 
      </Routes> 
    </div>
  );
}

export default App;


