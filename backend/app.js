const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

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

module.exports = app;
