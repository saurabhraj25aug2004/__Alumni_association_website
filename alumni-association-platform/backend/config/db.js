const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/alumni_association';
  const options = {
    // Use modern URL parser and topology engine
    autoIndex: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000
  };

  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    try {
      const conn = await mongoose.connect(uri, options);
      console.log(`MongoDB Connected: ${conn.connection.host}`);

      const replSet = conn.connection.client && conn.connection.client.topology && conn.connection.client.topology.s && conn.connection.client.topology.s.options && conn.connection.client.topology.s.options.replicaSet;
      if (!replSet) {
        console.warn('[MongoDB] For change streams, connect to a replica set (MONGODB_REPLICA_SET).');
      }

      return;
    } catch (error) {
      attempts += 1;
      console.error(`MongoDB connection attempt ${attempts} failed:`, error.message);
      if (attempts >= maxAttempts) {
        console.error('Exceeded max MongoDB connection attempts. Exiting.');
        process.exit(1);
      }
      await new Promise((r) => setTimeout(r, 2000 * attempts));
    }
  }
};

module.exports = connectDB;
