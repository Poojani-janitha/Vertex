const { Model, DataTypes } = require('sequelize');

class Badge extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      badgeName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'badge_name',
      },
      earnedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'earned_at',
      },
    }, {
      sequelize,
      tableName: 'badges',
      timestamps: false,
    });
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  }
}

module.exports = Badge;
