import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ClinicComponent.css';

const ClinicComponent = ({ userId }) => {
    const [clinics, setClinics] = useState([]);
    const [pets, setPets] = useState([]);
    const [selectedClinicForAppointment, setSelectedClinicForAppointment] = useState(null);
    const [showAppointmentForm, setShowAppointmentForm] = useState(false);
    const [appointmentData, setAppointmentData] = useState({
        date: '',
        time: '',
        petId: ''
    });
    const [showAppointments, setShowAppointments] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [appointmentPets, setAppointmentPets] = useState({});
    const [appointmentClinics, setAppointmentClinics] = useState({});

    useEffect(() => {
        fetchClinics();
        fetchPets();
        fetchAppointments();
    }, [userId]);

    const fetchClinics = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/clinics');
            setClinics(response.data);
        } catch (error) {
            console.error('Error fetching clinics:', error);
        }
    };

    const fetchPets = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/pets/${userId}`);
            setPets(response.data);
        } catch (error) {
            console.error('Error fetching pets:', error);
        }
    };

    const fetchAppointments = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/appointments/user/${userId}`);
            setAppointments(response.data);
            console.log('Fetched appointments:', response.data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };

    const fetchAppointmentPet = async (appointmentId) => {
        try {
            const response = await axios.post(`http://localhost:8080/api/appointments-pet/${appointmentId}`);
            setAppointmentPets(prev => ({
                ...prev,
                [appointmentId]: response.data
            }));
        } catch (error) {
            console.error(`Error fetching pet for appointment ${appointmentId}:`, error);
        }
    };

    const fetchAppointmentClinic = async (appointmentId) => {
        try {
            const response = await axios.post(`http://localhost:8080/api/appointments-clinic/${appointmentId}`);
            setAppointmentClinics(prev => ({
                ...prev,
                [appointmentId]: response.data
            }));
        } catch (error) {
            console.error(`Error fetching clinic for appointment ${appointmentId}:`, error);
        }
    };

    useEffect(() => {
        appointments.forEach(appointment => {
            fetchAppointmentPet(appointment.id);
            fetchAppointmentClinic(appointment.id);
        });
    }, [appointments]);

    const handleClinicSelect = (clinic) => {
        setSelectedClinicForAppointment(clinic);
        setShowAppointmentForm(true);
    };

    const handleAppointmentSubmit = async (e) => {
        e.preventDefault();
        
        const dateTime = new Date(`${appointmentData.date}T${appointmentData.time}`);
        
        const appointmentRequest = {
            date: dateTime.toISOString().split('.')[0],
            userId: userId,
            petId: parseInt(appointmentData.petId),
            clinicId: selectedClinicForAppointment.id
        };

        try {
            await axios.post('http://localhost:8080/api/appointments', appointmentRequest);
            alert('Appointment booked successfully!');
            setShowAppointmentForm(false);
            setSelectedClinicForAppointment(null);
            setAppointmentData({ date: '', time: '', petId: '' });
            fetchAppointments();
            setShowAppointments(true);
        } catch (error) {
            console.error('Error booking appointment:', error);
            alert('Failed to book appointment. Please try again.');
        }
    };

    const handleDeleteAppointment = async (id) => {
        if (window.confirm('Are you sure you want to cancel this appointment?')) {
            try {
                await axios.delete(`http://localhost:8080/api/appointments/${id}`);
                fetchAppointments();
                alert('Appointment cancelled successfully');
            } catch (error) {
                console.error('Error cancelling appointment:', error);
                alert('Failed to cancel appointment');
            }
        }
    };

    const formatDateTime = (dateTimeStr) => {
        const date = new Date(dateTimeStr);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="clinic-management">
            <div className="clinic-header">
                <h2>{showAppointmentForm ? 'Book Appointment' : 'Select Clinic'}</h2>
                <button 
                    className="view-appointments-button"
                    onClick={() => setShowAppointments(!showAppointments)}
                >
                    {showAppointments ? 'Book New Appointment' : 'View My Appointments'}
                </button>
            </div>

            {showAppointments ? (
                <div className="appointments-container">
                    <h3>My Scheduled Appointments</h3>
                    {appointments.length === 0 ? (
                        <p className="no-appointments">No scheduled appointments found.</p>
                    ) : (
                        <div className="appointments-grid">
                            {appointments
                                .sort((a, b) => new Date(a.date) - new Date(b.date))
                                .map(appointment => {
                                    const pet = appointmentPets[appointment.id];
                                    const clinic = appointmentClinics[appointment.id];
                                    
                                    return (
                                        <div key={appointment.id} className="appointment-card">
                                            <div className="appointment-info">
                                                <h4>{clinic ? clinic.name : 'Loading...'}</h4>
                                                <div className="info-row">
                                                    <i className="fas fa-paw"></i>
                                                    <p><strong>Pet:</strong> {pet ? `${pet.name} (${pet.species})` : 'Loading...'}</p>
                                                </div>
                                                <div className="info-row">
                                                    <i className="fas fa-calendar-alt"></i>
                                                    <p><strong>Date & Time:</strong> {formatDateTime(appointment.date)}</p>
                                                </div>
                                                <div className="info-row">
                                                    <i className="fas fa-map-marker-alt"></i>
                                                    <p><strong>Location:</strong> {clinic ? clinic.location : 'Loading...'}</p>
                                                </div>
                                                <div className="info-row">
                                                    <i className="fas fa-phone"></i>
                                                    <p><strong>Contact:</strong> {clinic && clinic.number ? clinic.number : 'No contact info available'}</p>
                                                </div>
                                            </div>
                                            <div className="appointment-actions">
                                                <button 
                                                    className="cancel-appointment-button"
                                                    onClick={() => handleDeleteAppointment(appointment.id)}
                                                >
                                                    Cancel Appointment
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>
            ) : showAppointmentForm && selectedClinicForAppointment ? (
                <div className="appointment-form-container">
                    <h3>Book Appointment at {selectedClinicForAppointment.name}</h3>
                    <div className="clinic-details">
                        <p><i className="fas fa-map-marker-alt"></i> {selectedClinicForAppointment.location}</p>
                        <p><i className="fas fa-phone"></i> {selectedClinicForAppointment.number}</p>
                    </div>
                    <form className="appointment-form" onSubmit={handleAppointmentSubmit}>
                        <div className="form-group">
                            <label htmlFor="pet">Select Pet</label>
                            <select
                                id="pet"
                                value={appointmentData.petId}
                                onChange={(e) => setAppointmentData({
                                    ...appointmentData,
                                    petId: e.target.value
                                })}
                                required
                            >
                                <option value="">Choose a pet</option>
                                {pets.map(pet => (
                                    <option key={pet.id} value={pet.id}>
                                        {pet.name} ({pet.species})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="appointmentDate">Date</label>
                            <input
                                type="date"
                                id="appointmentDate"
                                min={new Date().toISOString().split('T')[0]}
                                value={appointmentData.date}
                                onChange={(e) => setAppointmentData({
                                    ...appointmentData,
                                    date: e.target.value
                                })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="appointmentTime">Time</label>
                            <input
                                type="time"
                                id="appointmentTime"
                                value={appointmentData.time}
                                onChange={(e) => setAppointmentData({
                                    ...appointmentData,
                                    time: e.target.value
                                })}
                                required
                            />
                        </div>

                        <div className="form-buttons">
                            <button type="submit" className="submit-button">
                                Confirm Appointment
                            </button>
                            <button 
                                type="button" 
                                className="cancel-button"
                                onClick={() => {
                                    setShowAppointmentForm(false);
                                    setSelectedClinicForAppointment(null);
                                    setAppointmentData({ date: '', time: '', petId: '' });
                                }}
                            >
                                Back to Clinics
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="clinics-grid">
                    {clinics.length === 0 ? (
                        <div className="no-clinics">
                            <p>No clinics found.</p>
                        </div>
                    ) : (
                        clinics.map(clinic => (
                            <div key={clinic.id} className="clinic-card">
                                <div className="clinic-info">
                                    <h3>{clinic.name}</h3>
                                    <p><i className="fas fa-map-marker-alt"></i> {clinic.location}</p>
                                    <p><i className="fas fa-phone"></i> {clinic.number}</p>
                                </div>
                                <div className="clinic-actions">
                                    <button 
                                        className="select-button"
                                        onClick={() => handleClinicSelect(clinic)}
                                    >
                                        Book Appointment
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default ClinicComponent; 