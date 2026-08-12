const { Model, DataTypes } = require('sequelize');

class Message extends Model {
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
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'sender_id',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'receiver_id',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      sentAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'sent_at',
      },
    }, {
      sequelize,
      tableName: 'messages',
      timestamps: false,
    });
  }

  static associate(models) {
    this.belongsTo(models.Job, { foreignKey: 'jobId', as: 'job' });
    this.belongsTo(models.User, { foreignKey: 'senderId', as: 'sender' });
    this.belongsTo(models.User, { foreignKey: 'receiverId', as: 'receiver' });
  }
}

module.exports = Message;
