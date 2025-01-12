import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UserComponent from './components/UserComponent';
import LoginComponent from './components/LoginComponent';
import RegisterComponent from './components/RegisterComponent';
import MainScreen from './components/MainScreen';
import './App.css';

function App() {
    const [user, setUser] = useState(null);

    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* Redirect root to login if not authenticated, otherwise to dashboard */}
                    <Route 
                        path="/" 
                        element={
                            !user ? <Navigate to="/login" replace /> : <Navigate to="/dashboard" replace />
                        } 
                    />

                    {/* Login route */}
                    <Route 
                        path="/login" 
                        element={
                            !user ? (
                                <LoginComponent onLogin={setUser} />
                            ) : (
                                <Navigate to="/dashboard" replace />
                            )
                        } 
                    />

                    {/* Register route */}
                    <Route 
                        path="/register" 
                        element={
                            !user ? (
                                <RegisterComponent onRegister={setUser} />
                            ) : (
                                <Navigate to="/dashboard" replace />
                            )
                        } 
                    />

                    {/* Protected dashboard route */}
                    <Route 
                        path="/dashboard/*" 
                        element={
                            user ? (
                                <MainScreen user={user} />
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        } 
                    />

                    {/* Catch all route - redirect to login or dashboard */}
                    <Route 
                        path="*" 
                        element={
                            !user ? <Navigate to="/login" replace /> : <Navigate to="/dashboard" replace />
                        } 
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
