const { Model, DataTypes } = require('sequelize');

class Transaction extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      walletId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'wallet_id',
        references: {
          model: 'wallets',
          key: 'id',
        },
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
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('deposit', 'payout', 'earnings', 'withdrawal'),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed', 'rejected'),
        defaultValue: 'completed',
        allowNull: false,
      },
      jobId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'job_id',
        references: {
          model: 'jobs',
          key: 'id',
        },
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      bankDetails: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'bank_details',
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
    }, {
      sequelize,
      tableName: 'transactions',
      timestamps: false,
    });
  }

  static associate(models) {
    this.belongsTo(models.Wallet, { foreignKey: 'walletId', as: 'wallet', onDelete: 'CASCADE' });
    this.belongsTo(models.User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' });
    this.belongsTo(models.Job, { foreignKey: 'jobId', as: 'job', onDelete: 'SET NULL' });
  }
}

module.exports = Transaction;
