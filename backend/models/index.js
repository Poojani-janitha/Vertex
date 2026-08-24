const sequelize = require('../config/database');
const User = require('./User');
const Profile = require('./Profile');
const Availability = require('./Availability');
const Job = require('./Job');
const Application = require('./Application');
const Checkin = require('./Checkin');
const Review = require('./Review');
const Report = require('./Report');
const Badge = require('./Badge');
const Message = require('./Message');
const EmployerVerification = require('./EmployerVerification');
const Skill = require('./Skill');
const Emergency = require('./Emergency');
const Wallet = require('./Wallet');
const Transaction = require('./Transaction');

const models = {
  User,
  Profile,
  Availability,
  Job,
  Application,
  Checkin,
  Review,
  Report,
  Badge,
  Message,
  EmployerVerification,
  Skill,
  Emergency,
  Wallet,
  Transaction,
};

// Initialize all models using the shared Sequelize connection instance
Object.values(models).forEach((model) => {
  if (typeof model.init === 'function') {
    model.init(sequelize);
  }
});

// Establish model associations/relations
Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  ...models,
};
