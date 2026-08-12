const { Model, DataTypes } = require('sequelize');

class Report extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      targetId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'target_id',
      },
      targetType: {
        type: DataTypes.ENUM('user', 'job'),
        allowNull: false,
        field: 'target_type',
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('open', 'reviewed', 'resolved'),
        defaultValue: 'open',
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
    }, {
      sequelize,
      tableName: 'reports',
      timestamps: false,
    });
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'fromUser', as: 'reporter' });
  }
}

module.exports = Report;
