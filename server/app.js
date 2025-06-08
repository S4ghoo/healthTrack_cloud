const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const path = require('path'); // Import the path module

const app = express();
const uri = "mongodb+srv://echarqaouiouissal:up6V2kZTP8raI1yw@cluster0.qjp9keg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with enhanced TLS and connection options
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    tls: true,
    tlsAllowInvalidCertificates: false,
    tlsAllowInvalidHostnames: false,
    minPoolSize: 1,
    maxPoolSize: 10,
    connectTimeoutMS: 30000,
    serverSelectionTimeoutMS: 30000,
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes (must come before static file serving)
app.get('/api/patients', async (req, res) => {
    try {
        console.log('Handling GET /api/patients request');
        await ensureConnected();
        const db = client.db('healthtrack');
        const patients = await db.collection('patients').find().toArray();
        console.log('Fetched patients:', patients);
        res.json(patients);
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ error: 'Failed to fetch patients' });
    }
});

app.post('/api/patients', async (req, res) => {
    try {
        console.log('Handling POST /api/patients request');
        await ensureConnected();
        const newPatient = req.body;
        const db = client.db('healthtrack');
        const result = await db.collection('patients').insertOne(newPatient);
        newPatient._id = result.insertedId;
        console.log('Added patient:', newPatient);
        res.json(newPatient);
    } catch (error) {
        console.error('Error adding patient:', error);
        res.status(500).json({ error: 'Failed to add patient' });
    }
});

app.get('/api/appointments', async (req, res) => {
    try {
        console.log('Handling GET /api/appointments request');
        await ensureConnected();
        const db = client.db('healthtrack');
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
        await ensureConnected();
        const newAppointment = req.body;
        const db = client.db('healthtrack');
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
        await ensureConnected();
        const db = client.db('healthtrack');
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
        await ensureConnected();
        const newHistory = req.body;
        const db = client.db('healthtrack');
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
        await ensureConnected();
        res.json({ status: 'OK', mongodb: 'Connected' });
    } catch (error) {
        console.error('Error in health check:', error);
        res.json({ status: 'OK', mongodb: 'Disconnected' });
    }
});

// Serve static files from the client build directory (after API routes)
app.use(express.static(path.join(__dirname, '../client/build')));

// Catch-all route for frontend routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Ensure the client is connected before handling requests
async function ensureConnected() {
    try {
        if (!client.topology || !client.topology.isConnected()) {
            console.log('MongoDB client is disconnected, attempting to reconnect...');
            await client.connect();
            console.log('Reconnected to MongoDB');
        } else {
            console.log('MongoDB client is already connected');
        }
    } catch (error) {
        console.error('Failed to reconnect to MongoDB:', error);
        throw error;
    }
}

// Start the server after connecting to MongoDB
async function startServer() {
    try {
        console.log('Starting server...');
        await client.connect();
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