import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PetComponent.css';

const PetComponent = ({ userId }) => {
    const [pets, setPets] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [name, setName] = useState('');
    const [species, setSpecies] = useState('');
    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [isSterile, setIsSterile] = useState(false);
    const [allergies, setAllergies] = useState('');
    const [editId, setEditId] = useState(null);
    const [speciesStats, setSpeciesStats] = useState([]);
    const [commonSpecies, setCommonSpecies] = useState([]);

    useEffect(() => {
        fetchPets();
        fetchSpeciesStats();
        fetchCommonSpecies();
    }, [userId]);

    const fetchPets = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/pets/${userId}`);
            setPets(response.data);
            console.log('Fetched pets:', response.data);
        } catch (error) {
            console.error('Error fetching pets:', error);
        }
    };

    const fetchSpeciesStats = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/pets/species-count/intersect');
            console.log('Species stats:', response.data);
            setSpeciesStats(response.data);
        } catch (error) {
            console.error('Error fetching species stats:', error);
        }
    };

    const fetchCommonSpecies = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/pets/species-count/intersect');
            console.log('Common species:', response.data);
            setCommonSpecies(response.data);
        } catch (error) {
            console.error('Error fetching common species:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const petData = {
            name,
            species,
            age: parseInt(age),
            weight: parseFloat(weight),
            height: parseFloat(height),
            isSterile,
            allergies,
            userId: userId
        };

        try {
            if (editId) {
                await axios.put(`http://localhost:8080/api/pets/${editId}`, petData);
            } else {
                const response = await axios.post('http://localhost:8080/api/pets', petData);
                console.log('Pet created successfully:', response.data);
            }
            fetchPets();
            resetForm();
            setShowAddForm(false);
        } catch (error) {
            console.error('Error saving pet:', error);
        }
    };

    const deletePet = async (id) => {
        if (window.confirm('Are you sure you want to delete this pet?')) {
            try {
                await axios.delete(`http://localhost:8080/api/pets/${id}`);
                fetchPets();
            } catch (error) {
                console.error('Error deleting pet:', error);
            }
        }
    };

    const editPet = (pet) => {
        setEditId(pet.id);
        setName(pet.name);
        setSpecies(pet.species);
        setAge(pet.age.toString());
        setWeight(pet.weight.toString());
        setHeight(pet.height.toString());
        setIsSterile(pet.isSterile);
        setAllergies(pet.allergies);
        setShowAddForm(true);
    };

    const resetForm = () => {
        setEditId(null);
        setName('');
        setSpecies('');
        setAge('');
        setWeight('');
        setHeight('');
        setIsSterile(false);
        setAllergies('');
    };

    return (
        <div className="pet-management">
            <div className="pet-header">
                <h2>My Pets</h2>
                {!showAddForm && (
                    <button 
                        className="add-pet-button"
                        onClick={() => {
                            resetForm();
                            setShowAddForm(true);
                        }}
                    >
                        Add New Pet
                    </button>
                )}
            </div>

            {showAddForm && (
                <div className="pet-form-container">
                    <h3>{editId ? 'Edit Pet' : 'Add New Pet'}</h3>
                    <form onSubmit={handleSubmit} className="pet-form">
                        <div className="form-grid">
                            <input
                                type="text"
                                placeholder="Pet Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Species"
                                value={species}
                                onChange={(e) => setSpecies(e.target.value)}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Age"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                required
                            />
                            <input
                                type="number"
                                step="0.1"
                                placeholder="Weight (kg)"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                required
                            />
                            <input
                                type="number"
                                step="0.1"
                                placeholder="Height (cm)"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                required
                            />
                            <div className="checkbox-container">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={isSterile}
                                        onChange={(e) => setIsSterile(e.target.checked)}
                                    />
                                    Sterile
                                </label>
                            </div>
                        </div>
                        <textarea
                            placeholder="Allergies"
                            value={allergies}
                            onChange={(e) => setAllergies(e.target.value)}
                        />
                        <div className="form-buttons">
                            <button type="submit" className="submit-button">
                                {editId ? 'Update Pet' : 'Add Pet'}
                            </button>
                            <button 
                                type="button" 
                                className="cancel-button"
                                onClick={() => {
                                    resetForm();
                                    setShowAddForm(false);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {speciesStats.length > 0 && (
                <div className="species-stats">
                    <h3>Popular Pet Species</h3>
                    <div className="stats-container">
                        {speciesStats.map((species, index) => (
                            <div key={index} className="species-stat-card">
                                <i className="fas fa-paw"></i>
                                <span>{species}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {commonSpecies.length > 0 && (
                <div className="common-species-container">
                    <div className="common-species-header">
                        <h3>Popular Dog Breeds</h3>
                        <p>Breeds with multiple pets registered</p>
                    </div>
                    <div className="common-species-list">
                        {commonSpecies.map((species, index) => (
                            <div key={index} className="species-badge">
                                <i className="fas fa-dog"></i>
                                <span>{species}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!showAddForm && (
                <div className="pets-grid">
                    {pets.length === 0 ? (
                        <div className="no-pets">
                            <p>You haven't added any pets yet.</p>
                        </div>
                    ) : (
                        pets.map(pet => (
                            <div key={pet.id} className="pet-card">
                                <h4>{pet.name}</h4>
                                <div className="pet-info">
                                    <p><strong>Species:</strong> {pet.species}</p>
                                    <p><strong>Age:</strong> {pet.age} years</p>
                                    <p><strong>Weight:</strong> {pet.weight} kg</p>
                                    <p><strong>Height:</strong> {pet.height} cm</p>
                                    <p><strong>Sterile:</strong> {pet.isSterile ? 'Yes' : 'No'}</p>
                                    {pet.allergies && (
                                        <p><strong>Allergies:</strong> {pet.allergies}</p>
                                    )}
                                </div>
                                <div className="pet-card-actions">
                                    <button 
                                        className="edit-button"
                                        onClick={() => editPet(pet)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="delete-button"
                                        onClick={() => deletePet(pet.id)}
                                    >
                                        Delete
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

export default PetComponent; 