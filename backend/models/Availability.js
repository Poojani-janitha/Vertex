const { Model, DataTypes } = require('sequelize');

class Availability extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      profileId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'profile_id',
        references: {
          model: 'profiles',
          key: 'id',
        },
      },
      dayOfWeek: {
        type: DataTypes.ENUM('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'),
        allowNull: false,
        field: 'day_of_week',
      },
      startTime: {
        type: DataTypes.TIME,
        allowNull: true,
        field: 'start_time',
      },
      endTime: {
        type: DataTypes.TIME,
        allowNull: true,
        field: 'end_time',
      },
      isAvailable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_available',
      },
    }, {
      sequelize,
      tableName: 'availability',
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ['profile_id', 'day_of_week'],
        },
      ],
    });
  }

  static associate(models) {
    this.belongsTo(models.Profile, { foreignKey: 'profileId', as: 'profile' });
  }
}

module.exports = Availability;
