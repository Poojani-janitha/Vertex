const app = require('./app');
const sequelize = require('./config/database');

const port = process.env.PORT || 3000;

sequelize.sync()
	.then(() => {
		app.listen(port, () => {
			console.log(`Server running on port ${port}`);
		});
	})
	.catch((error) => {
		console.error('Unable to connect/sync to the database:', error.message);
		process.exit(1);
	});
