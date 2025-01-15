const { Pool } = require('pg');

// Create separate pools for master and slave databases
const masterPool = new Pool({
  host: process.env.DB_MASTER_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

const slavePool = new Pool({
  host: process.env.DB_SLAVE_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// ایجاد جدول orders در صورت عدم وجود (برای هر دو پایگاه داده)
const createOrdersTable = async () => {
  try {

    await new Promise(resolve => setTimeout(resolve, 10000));

    // ایجاد جدول در db-master
    await masterPool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        address TEXT NOT NULL,
        status VARCHAR(50) NOT NULL
      );
    `);

    console.log('Table "orders" created or already exists in db-master.');

    // // اضافه کردن تاخیر برای اطمینان از راه‌اندازی db-slave
    // await new Promise(resolve => setTimeout(resolve, 10000)); // 10 ثانیه تاخیر

    // ایجاد جدول در db-slave
    // await slavePool.query(`
    //   CREATE TABLE IF NOT EXISTS orders (
    //     id SERIAL PRIMARY KEY,
    //     user_id INT NOT NULL,
    //     product_id INT NOT NULL,
    //     quantity INT NOT NULL,
    //     address TEXT NOT NULL,
    //     status VARCHAR(50) NOT NULL
    //   );
    // `);
    // console.log('Table "orders" created or already exists in db-slave.');
  } catch (error) {
    console.error('Error creating table "orders":', error);
  }
};

// فراخوانی تابع ایجاد جدول
createOrdersTable();

// ایجاد سفارش جدید
exports.createOrder = async (req, res) => {
  const { userId, productId, quantity, address } = req.body;

  // Validate input
  if (!userId || !productId || !quantity || !address) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const result = await masterPool.query(
      'INSERT INTO orders (user_id, product_id, quantity, address, status) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [userId, productId, quantity, address, 'Pending']
    );
    res.status(201).json({ orderId: result.rows[0].id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
};

// به‌روزرسانی وضعیت سفارش
exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!status || !['Approved', 'Rejected', 'Pending'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    await masterPool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, orderId]);
    res.status(200).json({ message: 'Order status updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
};

// دریافت وضعیت سفارش
exports.getOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  try {
    const result = await slavePool.query('SELECT status FROM orders WHERE id = $1', [orderId]);
    if (result.rows.length > 0) {
      res.status(200).json({ status: result.rows[0].status });
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
};