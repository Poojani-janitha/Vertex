const { Model, DataTypes } = require('sequelize');

class Job extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      employerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'employer_id',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      title: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      skillsNeeded: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'skills_needed',
      },
      payAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'pay_amount',
      },
      locationName: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'location_name',
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true,
      },
      longitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true,
      },
      startTime: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'start_time',
      },
      endTime: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'end_time',
      },
      status: {
        type: DataTypes.ENUM('open', 'closed', 'filled'),
        defaultValue: 'open',
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
    }, {
      sequelize,
      tableName: 'jobs',
      timestamps: false,
    });
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'employerId', as: 'employer' });
    this.hasMany(models.Application, { foreignKey: 'jobId', as: 'applications', onDelete: 'CASCADE' });
    this.hasMany(models.Checkin, { foreignKey: 'jobId', as: 'checkins', onDelete: 'CASCADE' });
    this.hasMany(models.Review, { foreignKey: 'jobId', as: 'reviews', onDelete: 'CASCADE' });
    this.hasMany(models.Message, { foreignKey: 'jobId', as: 'messages', onDelete: 'CASCADE' });
  }
}

module.exports = Job;
