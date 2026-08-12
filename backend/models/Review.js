const { Model, DataTypes } = require('sequelize');

class Review extends Model {
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
      fromUser: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'from_user',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      toUser: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'to_user',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
          max: 5,
        },
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
    }, {
      sequelize,
      tableName: 'reviews',
      timestamps: false,
    });
  }

  static associate(models) {
    this.belongsTo(models.Job, { foreignKey: 'jobId', as: 'job' });
    this.belongsTo(models.User, { foreignKey: 'fromUser', as: 'sender' });
    this.belongsTo(models.User, { foreignKey: 'toUser', as: 'receiver' });
  }
}

module.exports = Review;
