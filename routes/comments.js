const express = require('express') ;
const router = express.Router() ;

const commentController = require('../controller/comment_controller');

const auth = require ('../middleware/auth') ;

router.post('/:id' , auth , commentController.createComment);

module.exports = router ;