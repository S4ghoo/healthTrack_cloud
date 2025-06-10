const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Schema and model
const patientSchema = new mongoose.Schema({
    name: String,
    age: Number,
    condition: String,
});
const Patient = mongoose.model('Patient', patientSchema);

// GET all patients
router.get('/', async (req, res) => {
    try {
        const patients = await Patient.find();
        res.json(patients);
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ error: 'Failed to fetch patients' });
    }
});

// POST new patient
router.post('/', async (req, res) => {
    try {
        const patient = new Patient(req.body);
        await patient.save();
        res.json(patient);
    } catch (error) {
        console.error('Error adding patient:', error);
        res.status(500).json({ error: 'Failed to add patient' });
    }
});

module.exports = router;