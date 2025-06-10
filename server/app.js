const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const patientRouter = require('./routes/patients');

const app = express();
require('dotenv').config();

const uri = process.env.MONGODB_URI || "mongodb+srv://echarqaouiouissal:up6V2kZTP8raI1yw@cluster0.qjp9keg.mongodb.net/healthtrack?retryWrites=true&w=majority";

// Middleware
app.use(cors({ origin: 'http://localhost:3000', optionsSuccessStatus: 200 }));
app.use(express.json());

// Use Mongoose patient router
app.use('/api/patients', patientRouter);

// API Routes
app.get('/api/appointments', async (req, res) => {
    try {
        console.log('Handling GET /api/appointments request');
        const db = mongoose.connection.db;
        const appointments = await db.collection('appointments').find().toArray();
        console.log('Fetched appointments:', appointments);
        res.json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});

app.post('/api/appointments', async (req, res) => {
    try {
        console.log('Handling POST /api/appointments request');
        const newAppointment = req.body;
        const db = mongoose.connection.db;
        const result = await db.collection('appointments').insertOne(newAppointment);
        newAppointment._id = result.insertedId;
        console.log('Added appointment:', newAppointment);
        res.json(newAppointment);
    } catch (error) {
        console.error('Error adding appointment:', error);
        res.status(500).json({ error: 'Failed to add appointment' });
    }
});

app.get('/api/medicalHistory/:patientId', async (req, res) => {
    try {
        console.log('Handling GET /api/medicalHistory request for patient:', req.params.patientId);
        const db = mongoose.connection.db;
        const history = await db.collection('medicalHistory')
            .find({ patientId: req.params.patientId })
            .toArray();
        console.log('Fetched medical history:', history);
        res.json(history);
    } catch (error) {
        console.error('Error fetching medical history:', error);
        res.status(500).json({ error: 'Failed to fetch medical history' });
    }
});

app.post('/api/medicalHistory', async (req, res) => {
    try {
        console.log('Handling POST /api/medicalHistory request');
        const newHistory = req.body;
        const db = mongoose.connection.db;
        const result = await db.collection('medicalHistory').insertOne(newHistory);
        newHistory._id = result.insertedId;
        console.log('Added medical history:', newHistory);
        res.json(newHistory);
    } catch (error) {
        console.error('Error adding medical history:', error);
        res.status(500).json({ error: 'Failed to add medical history' });
    }
});

app.get('/api/health', async (req, res) => {
    try {
        console.log('Handling GET /api/health request');
        res.json({ status: 'OK', mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected' });
    } catch (error) {
        console.error('Error in health check:', error);
        res.json({ status: 'OK', mongodb: 'Disconnected' });
    }
});

// Serve static files from the client build directory
app.use(express.static(path.join(__dirname, '../client/build')));

// Catch-all route for frontend routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Start the server after connecting to MongoDB
async function startServer() {
    try {
        console.log('Starting server...');
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');
        app.listen(process.env.PORT || 5000, () => {
            console.log('Server running on port 5000');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
module.exports = app;