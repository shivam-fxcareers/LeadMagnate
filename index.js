const express = require('express');
const app = express();
const { testConnection } = require('./config/dbConfig');
const authRoutes = require('./auth/routes');
const moduleRoutes = require('./modules/routes');
const organisationRoutes = require('./organisation/routes');
const roleRoutes = require('./role/routes');

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/organisations', organisationRoutes);
app.use('/api/roles', roleRoutes);

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