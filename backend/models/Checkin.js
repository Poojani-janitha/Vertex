const { Model, DataTypes } = require('sequelize');

class Checkin extends Model {
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
      checkInTime: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'check_in_time',
      },
      checkOutTime: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'check_out_time',
      },
      qrCode: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'qr_code',
      },
    }, {
      sequelize,
      tableName: 'checkins',
      timestamps: false,
    });
  }

  static associate(models) {
    this.belongsTo(models.Job, { foreignKey: 'jobId', as: 'job' });
    this.belongsTo(models.User, { foreignKey: 'studentId', as: 'student' });
  }
}

module.exports = Checkin;
