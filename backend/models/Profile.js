const { Model, DataTypes } = require('sequelize');

class Profile extends Model {
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
      skills: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      resumeUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'resume_url',
      },
    }, {
      sequelize,
      tableName: 'profiles',
      timestamps: false,
    });
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    this.hasMany(models.Availability, { foreignKey: 'profileId', as: 'availabilities', onDelete: 'CASCADE' });
  }
}

module.exports = Profile;
