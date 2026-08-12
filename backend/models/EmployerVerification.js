const { Model, DataTypes } = require('sequelize');

class EmployerVerification extends Model {
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
        unique: true,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      accountType: {
        type: DataTypes.ENUM('individual', 'company'),
        allowNull: false,
        field: 'account_type',
      },
      individualIdNo: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'individual_id_no',
      },
      companyName: {
        type: DataTypes.STRING(150),
        allowNull: true,
        field: 'company_name',
      },
      companyRegNo: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'company_reg_no',
      },
      documentUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'document_url',
      },
      verificationStatus: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
        field: 'verification_status',
      },
      verifiedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'verified_by',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      verifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'verified_at',
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
    }, {
      sequelize,
      tableName: 'employer_verification',
      timestamps: false,
    });
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    this.belongsTo(models.User, { foreignKey: 'verifiedBy', as: 'verifier' });
  }
}

module.exports = EmployerVerification;
