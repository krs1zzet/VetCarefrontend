import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './VaccineComponent.css';

const VaccineComponent = ({ userId }) => {
    const [pets, setPets] = useState([]);
    const [vaccines, setVaccines] = useState([]);
    const [petVaccines, setPetVaccines] = useState([]);
    const [vaccineDetails, setVaccineDetails] = useState({});
    const [selectedPet, setSelectedPet] = useState('');
    const [selectedVaccine, setSelectedVaccine] = useState('');
    const [count, setCount] = useState(1);
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        fetchPets();
        fetchVaccines();
        fetchPetVaccines();
    }, [userId]);

    useEffect(() => {
        const fetchAllVaccineDetails = async () => {
            const details = {};
            console.log('PetVaccines:', petVaccines);

            for (const petVaccine of petVaccines) {
                console.log('Processing petVaccine:', petVaccine);
                if (petVaccine.id && !details[petVaccine.id]) {
                    try {
                        const response = await axios.post(`http://localhost:8080/api/vaccines-petVaccines/${petVaccine.id}`);
                        details[petVaccine.id] = response.data;
                        console.log('Fetched vaccine details:', response.data);
                    } catch (error) {
                        console.error(`Error fetching details for petVaccine ${petVaccine.id}:`, error);
                    }
                }
            }
            console.log('Final details object:', details);
            setVaccineDetails(details);
        };

        if (petVaccines.length > 0) {
            fetchAllVaccineDetails();
        }
    }, [petVaccines]);

    const fetchPets = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/pets/${userId}`);
            setPets(response.data);
        } catch (error) {
            console.error('Error fetching pets:', error);
        }
    };

    const fetchVaccines = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/vaccines');
            setVaccines(response.data);
        } catch (error) {
            console.error('Error fetching vaccines:', error);
        }
    };

    const fetchPetVaccines = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/pet-vaccines/view');
            console.log('Pet vaccines view data:', response.data);
            setPetVaccines(response.data);
        } catch (error) {
            console.error('Error fetching pet vaccines:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const currentDate = new Date();
        
        try {
            const vaccineResponse = await axios.post(`http://localhost:8080/api/vaccines/${selectedVaccine}`);
            const vaccineDetails = vaccineResponse.data;

            const nextDate = new Date(currentDate);
            nextDate.setDate(nextDate.getDate() + vaccineDetails.periodDay);

            const formattedCurrentDate = currentDate.toISOString().split('.')[0];
            const formattedNextDate = nextDate.toISOString().split('.')[0];

            const vaccineData = {
                petId: parseInt(selectedPet),
                vaccineId: parseInt(selectedVaccine),
                date: formattedCurrentDate,
                nextDate: formattedNextDate,
                count: 1,
                vaccineName: vaccineDetails.name,
                totalDoses: vaccineDetails.count
            };

            console.log('Sending vaccine data:', vaccineData);
            const response = await axios.post('http://localhost:8080/api/pet-vaccines', vaccineData);
            console.log('Server response:', response.data);
            fetchPetVaccines();
            resetForm();
        } catch (error) {
            console.error('Error creating vaccine plan:', error.response?.data || error.message);
            alert('Failed to create vaccination plan. Please try again.');
        }
    };

    const deletePetVaccine = async (id) => {
        if (!id) {
            console.error('Invalid pet vaccine ID');
            return;
        }

        console.log('Deleting pet vaccine with ID:', id);

        if (window.confirm('Are you sure you want to delete this vaccination record?')) {
            try {
                await axios.delete(`http://localhost:8080/api/pet-vaccines/${id}`);
                console.log('Successfully deleted pet vaccine');
                fetchPetVaccines();
            } catch (error) {
                console.error('Error deleting pet vaccine:', error);
                alert('Failed to delete vaccination record. Please try again.');
            }
        }
    };

    const resetForm = () => {
        setSelectedPet('');
        setSelectedVaccine('');
        setCount(1);
        setShowAddForm(false);
    };

    const calculateRemainingDoses = (petVaccine) => {
        const vaccine = vaccines.find(v => v.id === petVaccine.vaccineId);
        if (!vaccine) return 0;
        return vaccine.count - petVaccine.count;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not scheduled';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleNextDose = async (petVaccine) => {
        try {
            await axios.post(`http://localhost:8080/api/pet-vaccines-update-count/${petVaccine.petId}`);
            console.log('Updated vaccination count');
            fetchPetVaccines();
        } catch (error) {
            console.error('Error updating vaccine dose:', error.response?.data);
            console.error('Full error object:', error);
            alert(`Failed to update vaccination: ${error.response?.data?.message || 'Please try again.'}`);
        }
    };

    return (
        <div className="vaccine-management">
            <div className="vaccine-header">
                <h2>Vaccination Management</h2>
                {!showAddForm && (
                    <button 
                        className="add-vaccine-button"
                        onClick={() => setShowAddForm(true)}
                    >
                        Add New Vaccination
                    </button>
                )}
            </div>

            {showAddForm && (
                <div className="vaccine-form-container">
                    <h3>Add New Vaccination</h3>
                    <form onSubmit={handleSubmit} className="vaccine-form">
                        <select 
                            value={selectedPet}
                            onChange={(e) => setSelectedPet(e.target.value)}
                            required
                        >
                            <option value="">Select Pet</option>
                            {pets.map(pet => (
                                <option key={pet.id} value={pet.id}>
                                    {pet.name} ({pet.species})
                                </option>
                            ))}
                        </select>

                        <select 
                            value={selectedVaccine}
                            onChange={(e) => setSelectedVaccine(e.target.value)}
                            required
                        >
                            <option value="">Select Vaccine</option>
                            {vaccines.map(vaccine => (
                                <option key={vaccine.id} value={vaccine.id}>
                                    {vaccine.name} ({vaccine.count} doses, every {vaccine.periodDay} days)
                                </option>
                            ))}
                        </select>

                        <div className="form-buttons">
                            <button type="submit" className="submit-button">
                                Start Vaccination Plan
                            </button>
                            <button 
                                type="button" 
                                className="cancel-button"
                                onClick={resetForm}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="pet-vaccines-grid">
                {petVaccines.length === 0 ? (
                    <div className="no-vaccines">
                        <p>No vaccination records found.</p>
                    </div>
                ) : (
                    petVaccines.map(petVaccine => {
                        const remainingDoses = petVaccine.vaccine.count - petVaccine.count;

                        return (
                            <div key={`${petVaccine.pet.id}-${petVaccine.vaccine.id}`} className="vaccine-card">
                                <div className="vaccine-info">
                                    <h4>{petVaccine.pet.name} - {petVaccine.vaccine.name}</h4>
                                    <p><strong>Last Dose:</strong> {formatDate(petVaccine.date)}</p>
                                    <p><strong>Next Dose:</strong> {formatDate(petVaccine.nextDate)}</p>
                                    <p><strong>Current Dose:</strong> {petVaccine.count} of {petVaccine.vaccine.count}</p>
                                    {remainingDoses > 0 ? (
                                        <p className="remaining-doses">
                                            {remainingDoses} doses remaining (every {petVaccine.vaccine.periodDay} days)
                                        </p>
                                    ) : (
                                        <p className="completed-vaccine">
                                            Vaccination completed
                                        </p>
                                    )}
                                </div>
                                <div className="vaccine-card-actions">
                                    {remainingDoses > 0 && (
                                        <button 
                                            className="next-dose-button"
                                            onClick={() => handleNextDose(petVaccine)}
                                        >
                                            Record Next Dose
                                        </button>
                                    )}
                                    <button 
                                        className="delete-button"
                                        onClick={() => deletePetVaccine(petVaccine.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default VaccineComponent; 