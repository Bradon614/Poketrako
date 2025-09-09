// server.js
require('dotenv').config();
const express = require('express');
const sequelize = require('./config/database');
const app = express();

app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));

sequelize.sync().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));
});
