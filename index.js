const express = require('express');
const app = express();
const { testConnection } = require('./config/dbConfig');
const authRoutes = require('./auth/routes');

app.use(express.json());
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;

(async () => {
  const isConnected = await testConnection();
  if (isConnected) {
    console.log('DB Connection Successful');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } else {
    console.error('Failed to connect to the database. Server not started.');
  }
})();