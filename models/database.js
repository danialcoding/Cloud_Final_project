const { Pool } = require('pg');

// Pool for Master
const masterPool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_MASTER_HOST || 'localhost',
  database: process.env.DB_NAME || 'orders_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Pool for Slave
const slavePool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_SLAVE_HOST || 'localhost',
  database: process.env.DB_NAME || 'orders_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Query Function
const query = async (text, params, isRead = false) => {
  const client = isRead ? await slavePool.connect() : await masterPool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
};

module.exports = { query,masterPool };
