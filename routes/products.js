const express = require('express') ;
const router = express.Router() ;
const multer = require('multer');
const path = require('path');
// const upload = multer({ dest: 'public/images/' });

const storage = multer.diskStorage({
    destination: 'public/images/', 
    filename: (req, file, cb) => {
      const originalName = file.originalname;
      const extension = path.extname(originalName);
      cb(null, `${originalName.replace(extension, '')}-${Date.now()}${extension}`);
    }
  });
  
const upload = multer({ storage });

const productController = require('../controller/product_controller');

const auth = require ('../middleware/auth') ;
const authAdmin = require ('../middleware/admin') ;

// upload.array('photo')  multipley photo
// upload.single('video')  single video 
router.post('/:id', authAdmin, upload.single('photo') , productController.addProduct);
router.get('/:id', productController.getProductByCategory);
router.get('/', productController.getAllProduct);
router.get('/byid/:id', productController.getProductByID);
router.delete('/:id', authAdmin, productController.deleteProduct);
router.put('/:id', authAdmin,  upload.single('photo') , productController.updateProduct);

module.exports = router ;