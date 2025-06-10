import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [patients, setPatients] = useState([]);
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [condition, setCondition] = useState('');
    const [error, setError] = useState('');

    // Fetch patients from the backend
    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_BASE_URL}/api/patients`)
            .then((response) => {
                if (!response.ok) throw new Error('Failed to fetch patients');
                return response.json();
            })
            .then((data) => setPatients(data))
            .catch((err) => setError(err.message));
    }, []);

    // Handle form submission to add a new patient
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !age || !condition) {
            setError('All fields are required');
            return;
        }
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/patients`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, age: parseInt(age), condition }),
            });
            if (!response.ok) throw new Error('Failed to add patient');
            const newPatient = await response.json();
            setPatients([...patients, newPatient]);
            setName('');
            setAge('');
            setCondition('');
            setError('');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container">
            <h1>HealthTrack</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <h2>Add Patient</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Condition"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                />
                <button type="submit">Add Patient</button>
            </form>
            <h2>Patients List</h2>
            <ul>
                {patients.map((patient) => (
                    <li key={patient._id}>
                        {patient.name}, {patient.age}, {patient.condition}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;