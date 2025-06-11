// server/api.js

const { app } = require('./app');
const { createServer } = require('@vercel/node');

module.exports = createServer(app);