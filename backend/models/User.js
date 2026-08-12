const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

class User extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('student', 'employer', 'admin'),
        allowNull: false,
        defaultValue: 'student',
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_verified',
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
    }, {
      sequelize,
      tableName: 'users',
      timestamps: false,
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
      },
    });
  }

  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  static associate(models) {
    this.hasOne(models.Profile, { foreignKey: 'userId', as: 'profile', onDelete: 'CASCADE' });
    this.hasMany(models.Job, { foreignKey: 'employerId', as: 'jobs', onDelete: 'CASCADE' });
    this.hasMany(models.Application, { foreignKey: 'studentId', as: 'applications', onDelete: 'CASCADE' });
    this.hasMany(models.Checkin, { foreignKey: 'studentId', as: 'checkins', onDelete: 'CASCADE' });
    this.hasMany(models.Review, { foreignKey: 'fromUser', as: 'sentReviews', onDelete: 'CASCADE' });
    this.hasMany(models.Review, { foreignKey: 'toUser', as: 'receivedReviews', onDelete: 'CASCADE' });
    this.hasMany(models.Report, { foreignKey: 'fromUser', as: 'sentReports', onDelete: 'CASCADE' });
    this.hasMany(models.Badge, { foreignKey: 'userId', as: 'badges', onDelete: 'CASCADE' });
    this.hasMany(models.Message, { foreignKey: 'senderId', as: 'sentMessages', onDelete: 'CASCADE' });
    this.hasMany(models.Message, { foreignKey: 'receiverId', as: 'receivedMessages', onDelete: 'CASCADE' });
    this.hasOne(models.EmployerVerification, { foreignKey: 'userId', as: 'employerVerification', onDelete: 'CASCADE' });
    this.hasMany(models.EmployerVerification, { foreignKey: 'verifiedBy', as: 'verifiedVerifications', onDelete: 'SET NULL' });
  }
}

module.exports = User;
