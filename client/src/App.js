import React, { useState, useEffect, useCallback } from 'react';
import Calendar from 'react-calendar';
import './App.css';

function App() {
    const [patients, setPatients] = useState([]);
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [condition, setCondition] = useState('');
    const [appointments, setAppointments] = useState([]);
    const [appointmentDate, setAppointmentDate] = useState(new Date());
    const [medicalHistory, setMedicalHistory] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [note, setNote] = useState('');
    const [error, setError] = useState(null);

    // Simulated list of doctors
    const doctors = [
        { id: 'doc1', name: 'Dr. Smith' },
        { id: 'doc2', name: 'Dr. Johnson' },
        { id: 'doc3', name: 'Dr. Lee' },
    ];

    const fetchPatients = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:5000/api/patients');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            setPatients(data);
            if (data.length > 0) {
                setSelectedPatientId(data[0]._id);
                fetchMedicalHistory(data[0]._id);
            }
        } catch (error) {
            console.error('Detailed error fetching patients:', error.message);
            setError(error.message);
        }
    }, []); // Empty dependency array since fetchPatients is stable

    const fetchAppointments = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:5000/api/appointments');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            setAppointments(data);
        } catch (error) {
            console.error('Detailed error fetching appointments:', error.message);
            setError(error.message);
        }
    }, []);

    const fetchMedicalHistory = useCallback(async (patientId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/medicalHistory/${patientId}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            setMedicalHistory(data);
        } catch (error) {
            console.error('Detailed error fetching medical history:', error.message);
            setError(error.message);
        }
    }, []);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]); // Safe to use fetchPatients here since it's memoized

    const addPatient = async (e) => {
        e.preventDefault();
        const newPatient = { name, age: parseInt(age), condition };
        try {
            const response = await fetch('http://localhost:5000/api/patients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPatient),
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            console.log('Patient added:', data);
            setName('');
            setAge('');
            setCondition('');
            fetchPatients();
            setError(null);
        } catch (error) {
            console.error('Detailed error adding patient:', error.message);
            setError(error.message);
        }
    };

    const addAppointment = async (e) => {
        e.preventDefault();
        if (!selectedPatientId || !selectedDoctor) {
            setError('Please select a patient and a doctor.');
            return;
        }
        const newAppointment = { patientId: selectedPatientId, doctorId: selectedDoctor, date: appointmentDate.toISOString() };
        try {
            const response = await fetch('http://localhost:5000/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAppointment),
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            console.log('Appointment added:', data);
            fetchAppointments();
            setError(null);
        } catch (error) {
            console.error('Detailed error adding appointment:', error.message);
            setError(error.message);
        }
    };

    const addMedicalHistory = async (e) => {
        e.preventDefault();
        if (!selectedPatientId || !note) {
            setError('Please select a patient and enter a note.');
            return;
        }
        const newHistory = { patientId: selectedPatientId, notes: note, date: new Date().toISOString() };
        try {
            const response = await fetch('http://localhost:5000/api/medicalHistory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newHistory),
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            console.log('Medical history added:', data);
            setNote('');
            fetchMedicalHistory(selectedPatientId);
            setError(null);
        } catch (error) {
            console.error('Detailed error adding medical history:', error.message);
            setError(error.message);
        }
    };

    return (
        <div className="container">
            <h1>HealthTrack - Gestion des Patients</h1>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            <form onSubmit={addPatient} className="mb-4">
                <input
                    type="text"
                    placeholder="Nom du patient"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border p-2 mr-2"
                />
                <input
                    type="number"
                    placeholder="Âge"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="border p-2 mr-2"
                />
                <input
                    type="text"
                    placeholder="Condition médicale"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="border p-2 mr-2"
                />
                <button type="submit">Ajouter Patient</button>
            </form>
            <h2>Liste des patients</h2>
            <select
                value={selectedPatientId}
                onChange={(e) => { setSelectedPatientId(e.target.value); fetchMedicalHistory(e.target.value); }}
                className="border p-2 mb-4 w-full"
            >
                <option value="">Sélectionner un patient</option>
                {patients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                        {patient.name} - {patient.age} ans - {patient.condition}
                    </option>
                ))}
            </select>
            <h2>Ajouter un Rendez-vous</h2>
            <form onSubmit={addAppointment} className="mb-4">
                <Calendar
                    onChange={setAppointmentDate}
                    value={appointmentDate}
                    className="react-calendar"
                />
                <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="border p-2 mb-4 w-full"
                    required
                >
                    <option value="">Sélectionner un docteur</option>
                    {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                            {doctor.name}
                        </option>
                    ))}
                </select>
                <button type="submit">Ajouter Rendez-vous</button>
            </form>
            <h2>Rendez-vous</h2>
            <ul>
                {appointments.length > 0 ? (
                    appointments.map((appointment) => {
                        const patient = patients.find(p => p._id === appointment.patientId);
                        const doctor = doctors.find(d => d.id === appointment.doctorId);
                        return (
                            <li key={appointment._id}>
                                Patient: {patient ? patient.name : 'Inconnu'} - Docteur: {doctor ? doctor.name : 'Inconnu'} - Date: {new Date(appointment.date).toLocaleDateString()}
                            </li>
                        );
                    })
                ) : (
                    <li>Aucun rendez-vous pour le moment.</li>
                )}
            </ul>
            <h2>Historique Médical</h2>
            <form onSubmit={addMedicalHistory} className="mb-4">
                <input
                    type="text"
                    placeholder="Note personnalisée"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="border p-2 mr-2"
                />
                <button type="submit">Ajouter Note Médicale</button>
            </form>
            <ul>
                {medicalHistory.length > 0 ? (
                    medicalHistory.map((history) => (
                        <li key={history._id}>
                            Notes: {history.notes} - Date: {new Date(history.date).toLocaleDateString()}
                        </li>
                    ))
                ) : (
                    <li>Aucun historique médical pour ce patient.</li>
                )}
            </ul>
        </div>
    );
}

export default App;