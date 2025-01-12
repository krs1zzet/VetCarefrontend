import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './MainScreen.css';
import PetComponent from './PetComponent';
import VaccineComponent from './VaccineComponent';
import ClinicComponent from './ClinicComponent';
import ShoppingComponent from './ShoppingComponent';

const MainScreen = ({ user }) => {
    const navigate = useNavigate();

    return (
        <div className="main-screen">
            <Routes>
                <Route 
                    path="/" 
                    element={
                        <div className="dashboard">
                            <div className="feature-card">
                                <h3>Pet Management</h3>
                                <p>Register and manage your pets' information</p>
                                <ul>
                                    <li>Add new pets</li>
                                    <li>Update pet information</li>
                                    <li>Track health records</li>
                                </ul>
                                <button 
                                    className="feature-button"
                                    onClick={() => navigate('pets')}
                                >
                                    Manage Pets
                                </button>
                            </div>

                            <div className="feature-card">
                                <h3>Vaccination & Check-ups</h3>
                                <p>Track your pets' medical schedule</p>
                                <ul>
                                    <li>Vaccination schedules</li>
                                    <li>Regular check-ups</li>
                                    <li>Health history</li>
                                </ul>
                                <button 
                                    className="feature-button"
                                    onClick={() => navigate('vaccines')}
                                >
                                    View Schedule
                                </button>
                            </div>

                            <div className="feature-card">
                                <h3>Book Appointment</h3>
                                <p>Schedule veterinary appointments</p>
                                <ul>
                                    <li>Choose clinic</li>
                                    <li>Select date and time</li>
                                    <li>Book consultation</li>
                                </ul>
                                <button 
                                    className="feature-button"
                                    onClick={() => navigate('appointments')}
                                >
                                    Book Appointment
                                </button>
                            </div>

                            <div className="feature-card">
                                <h3>Pet Shop</h3>
                                <p>Browse and manage pet products</p>
                                <ul>
                                    <li>View products</li>
                                    <li>Manage inventory</li>
                                    <li>Update prices</li>
                                </ul>
                                <button 
                                    className="feature-button"
                                    onClick={() => navigate('shopping')}
                                >
                                    Go to Shop
                                </button>
                            </div>
                        </div>
                    } 
                />

                <Route 
                    path="pets" 
                    element={
                        <>
                            <button 
                                className="back-button"
                                onClick={() => navigate('/dashboard')}
                            >
                                Back to Dashboard
                            </button>
                            <PetComponent userId={user.id} />
                        </>
                    } 
                />

                <Route 
                    path="vaccines" 
                    element={
                        <>
                            <button 
                                className="back-button"
                                onClick={() => navigate('/dashboard')}
                            >
                                Back to Dashboard
                            </button>
                            <VaccineComponent userId={user.id} />
                        </>
                    } 
                />

                <Route 
                    path="appointments" 
                    element={
                        <>
                            <button 
                                className="back-button"
                                onClick={() => navigate('/dashboard')}
                            >
                                Back to Dashboard
                            </button>
                            <ClinicComponent userId={user.id} />
                        </>
                    } 
                />

                <Route 
                    path="shopping" 
                    element={
                        <>
                            <button 
                                className="back-button"
                                onClick={() => navigate('/dashboard')}
                            >
                                Back to Dashboard
                            </button>
                            <ShoppingComponent userId={user.id} />
                        </>
                    } 
                />
            </Routes>
        </div>
    );
};

export default MainScreen; 