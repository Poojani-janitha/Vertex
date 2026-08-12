const { Model, DataTypes } = require('sequelize');

class Application extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      jobId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'job_id',
        references: {
          model: 'jobs',
          key: 'id',
        },
      },
      studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'student_id',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
        defaultValue: 'pending',
      },
      appliedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'applied_at',
      },
    }, {
      sequelize,
      tableName: 'applications',
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ['job_id', 'student_id'],
        },
      ],
    });
  }

  static associate(models) {
    this.belongsTo(models.Job, { foreignKey: 'jobId', as: 'job' });
    this.belongsTo(models.User, { foreignKey: 'studentId', as: 'student' });
  }
}

module.exports = Application;
