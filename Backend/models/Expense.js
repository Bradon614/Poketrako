// models/Expense.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Expense = sequelize.define('Expense', {
  title:      { type: DataTypes.STRING, allowNull: false },
  amount:     { type: DataTypes.FLOAT, allowNull: false },
  category:   { type: DataTypes.STRING },
  receiptUrl: { type: DataTypes.STRING }
});

Expense.belongsTo(User, { foreignKey: 'userId' });

module.exports = Expense;
