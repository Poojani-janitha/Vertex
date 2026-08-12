const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

app.get('/', (_req, res) =>>,StartLine:11,TargetContent: {
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
