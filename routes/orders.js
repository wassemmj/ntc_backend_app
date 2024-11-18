const express = require('express') ;
const router = express.Router() ;

const ordersController = require('../controller/order_controller');

const auth = require ('../middleware/auth') ;
const admin = require ('../middleware/admin') ;

router.post('/', auth ,ordersController.makeOrder);
router.get('/', auth ,ordersController.getUserOrder);
router.post('/all', admin ,ordersController.getAllOrder);

module.exports = router ;