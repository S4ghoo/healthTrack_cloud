
const express = require('express');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 4000;

const cors = require('cors');
const path = require('path');
const patientRouter = require('./routes/patients');
const app = express();
require('dotenv').config();



const uri = process.env.MONGODB_URI || "mongodb+srv://echarqaouiouissal:up6V2kZTP8raI1yw@cluster0.qjp9keg.mongodb.net/healthtrack?retryWrites=true&w=majority";

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials:true}));
app.use(express.json());
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Routes
app.use('/api/patients', patientRouter);

app.get('/api/appointments', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const appointments = await db.collection('appointments').find().toArray();
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});

app.post('/api/appointments', async (req, res) => {
    try {
        const newAppointment = req.body;
        const db = mongoose.connection.db;
        const result = await db.collection('appointments').insertOne(newAppointment);
        newAppointment._id = result.insertedId;
        res.json(newAppointment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add appointment' });
    }
});

app.get('/api/medicalHistory/:patientId', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const history = await db.collection('medicalHistory')
            .find({ patientId: req.params.patientId })
            .toArray();
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch medical history' });
    }
});

app.post('/api/medicalHistory', async (req, res) => {
    try {
        const newHistory = req.body;
        const db = mongoose.connection.db;
        const result = await db.collection('medicalHistory').insertOne(newHistory);
        newHistory._id = result.insertedId;
        res.json(newHistory);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add medical history' });
    }
});

app.get('/api/health', async (req, res) => {
    try {
        res.json({ status: 'OK', mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected' });
    } catch (error) {
        res.json({ status: 'OK', mongodb: 'Disconnected' });
    }
});

// Static files for frontend
app.use(express.static(path.join(__dirname, '../client/build')));

// All other routes go to index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Connect to DB
async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');
    }
}

connectDB();

module.exports = { app };