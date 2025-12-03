import './App.css';
import {Routes, Route, Outlet } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import WelcomePage from './pages/auth/welcomePage/welcomePage';
import HomePage from './pages/app/HomePage/HomePage';
import SaveMealPage from './pages/app/SaveMealPage/SaveMealPage';
import ProfilePage from './pages/app/ProfilePage/ProfilePage';
import TrendsPage from './pages/app/TrendsPage/TrendsPage';
import SavedPosts from './pages/app/SavedPosts/SavedPosts';
import LikedPosts from './pages/app/LikedPosts/LikedPosts';
import MyPosts from './pages/app/MyPosts/MyPosts';
import PostsPage from './pages/app/Posts/PostsPage';
import AppLayout from './utils/AppLayout/AppLayout';
import ProtectedRoute from './utils/ProtectedRoute/ProtectedRoute';

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
            <Route path="/profile" element={<ProfilePage />}/>
            <Route path="/trends" element={<TrendsPage />}/>
            <Route path="/my-posts" element={<MyPosts />}/>
            <Route path="/saved-posts" element={<SavedPosts />}/>
            <Route path="/liked-posts" element={<LikedPosts />}/>
            <Route path="/posts" element={<PostsPage />}/>
            <Route path='/*' element={<Navigate to="/home" replace/>}/>
          </Route>
        </Route> 
      </Routes> 
    </div>
  );
}

export default App;