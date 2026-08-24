const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const apiRoutes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());

// Main API Routes
app.use('/api', apiRoutes);

app.get('/', (_req, res) => {
	res.json({ message: 'Vertex API is running' });
});

app.get('/health', async (_req, res) => {
	try {
		await sequelize.authenticate();
		res.json({ status: 'ok', database: 'connected' });
	} catch (error) {
		res.status(500).json({ status: 'error', database: 'disconnected', message: error.message });
	}
});

// 404 Handler
app.use((_req, res) => {
	res.status(404).json({ error: 'Endpoint not found' });
});

// Centralized Error Handling Middleware
app.use((err, _req, res, _next) => {
	console.error('Unhandled Error:', err);
	res.status(err.status || 500).json({
		error: err.message || 'Internal Server Error'
	});
});

module.exports = app;
