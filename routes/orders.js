const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');

router.post('/', ordersController.createOrder);
router.put('/:orderId', ordersController.updateOrderStatus);
router.get('/:orderId/status', ordersController.getOrderStatus);

module.exports = router;
