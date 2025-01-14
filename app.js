const express = require('express');
const bodyParser = require('body-parser');
const ordersRoutes = require('./routes/orders');
const { masterPool } = require('./models/database');

const app = express();
app.use(bodyParser.json());
app.use('/orders', ordersRoutes);

// مسیر سلامت برای Liveness و Startup Probe
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/ready', async (req, res) => {
  try {
    const result = await masterPool.query('SELECT 1');
    if (result.rowCount > 0) {
      res.status(200).send('Ready');
    } else {
      res.status(500).send('Not Ready');
    }
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).send('Not Ready');
  }
});


// Middleware برای مدیریت خطاها
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
