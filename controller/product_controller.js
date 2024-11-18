const { product } = require('../models/product');
const Joi = require('joi').extend(require('@joi/date'));
const knex = require('../db');
const cron = require('node-cron');
const _ = require('lodash');

async function deleteExpiredProducts() {
    try {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth(); 
        const currentDay = currentDate.getDate() + 1;
    
        const deletedProducts = await knex('Products').select('expire_date')
            .whereRaw('EXTRACT(YEAR FROM expire_date) < ?', currentYear) // Compare year
            .orWhere(function () {
                this.whereRaw('EXTRACT(YEAR FROM expire_date) = ?', currentYear)  // Same year
                    .whereRaw('EXTRACT(MONTH FROM expire_date) < ?', currentMonth) // Compare month
                    .orWhere(function () {
                        this.whereRaw('EXTRACT(YEAR FROM expire_date) = ?', currentYear)  // Same year, same month
                            .whereRaw('EXTRACT(MONTH FROM expire_date) = ?', currentMonth)
                            .whereRaw('EXTRACT(DAY FROM expire_date) <= ?', currentDay); // Compare day
                        });
            })
          .delete();
    console.log('Expired products deleted successfully!');
  } catch (error) {
    console.error('Error deleting expired products:', error);
  }
}

const cronJob = cron.schedule('0 0 * * *', deleteExpiredProducts, {
  scheduled: false
});

cronJob.start();

exports.addProduct = async (req , res) => {
    const schema = Joi.object({
        name : Joi.string().min(3).required() ,
        price : Joi.number().min(3).required(),
        description : Joi.string().min(3).required(),
        brand : Joi.string().min(3).required(),
        quantity : Joi.number().min(3).required(),
        expire_date: Joi.date().format('YYYY-MM-DD').utc().required(),
        photo : Joi.string().valid('image/jpg', 'image/png'),
    });

    const { filename } = req.file;
    const newProduct = req.body ;

    const { error } = schema.validate(newProduct) ;
    if (error) return res.status(400).send({'message' : error.details[0].message}) ;

    newProduct.category_id = parseInt(req.params.id);
    newProduct.photo = filename;

    const Product = new product(newProduct) ;

    try {
        await Product.save() ;
        res.status(200).send({'message' : 'The Product created sucessfully'}) ;
    } catch (e) {
        if ('ER_NO_REFERENCED_ROW_2' === e.code) {
            return res.status(400).send({'message' : 'the category id is wrong'}) ;
        }
        return res.status(400).send({'message' : e}) ;
    }
}

exports.getProductByCategory = async (req , res) => {
    try {
        const id = req.params.id ;
        if(isNaN(id) || id <=0) {
            throw new Error('bad request!') ;
        }
        const product = await knex('Products').where('category_id' , id) ;
        product.forEach((value) => {
            value.expire_date = new Intl.DateTimeFormat('fr-CA', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).format(new Date (value.expire_date)) ;
        }) ;
        res.status(200).send({'Products' : product}) ;
    } catch (e) {
        return res.status(200).send({'message' : e.message}) ;
    }
} 

exports.getAllProduct = async (req , res) => {
    try {
        const product = await knex('Products').select('*').orderBy('id' , 'asc') ;
        product.forEach((value) => {
            value.expire_date = new Intl.DateTimeFormat('fr-CA', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).format(new Date (value.expire_date)) ;
        }) ;
        res.status(200).send({'Products' : product}) ;
    } catch (e) {
        return res.status(200).send({'message' : e.message}) ;
    }
} 

exports.getProductByID = async (req , res) => {
    try {
        const id = req.params.id ;
        if(isNaN(id) || id <=0) {
            throw new Error('bad request!') ;
        }
        const product = await knex('Products').where('id' , req.params.id).first();
        product.expire_date = new Intl.DateTimeFormat('fr-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date (product.expire_date)) ;
        res.status(200).send({'Product' : product}) ;
    } catch (e) {
        return res.status(200).send({'message' : e.message}) ;
    }
} 

exports.deleteProduct = async (req,res) => {
    try{
        const id = req.params.id ;
        if(isNaN(id) || id <=0) {
            throw new Error('bad request!') ;
        }
        const result = await knex('Products').where('id' , id).delete();
        if (result === 0){
            res.status(400).send({'message' : 'The Product not found '}) ;
            return ;
        }
        res.status(200).send({'message' : 'The Product deleted sucessfully'}) ;
    }catch(e){
        return res.status(400).send({'message' : e.message}) ;
    }
}

exports.updateProduct = async (req , res) => {
    const schema = Joi.object({
        name : Joi.string().min(3) ,
        price : Joi.number().min(3),
        description : Joi.string().min(3),
        brand : Joi.string().min(3),
        quantity : Joi.number().min(3),
        expire_date: Joi.date().format('YYYY-MM-DD').utc(),
        photo : Joi.string().valid('image/jpg', 'image/png'),
    }) ;

    const { filename } = req.file;
    const updateProduct = req.body ;

    const { error } = schema.validate(updateProduct) ;
    if (error) return res.status(400).send({'message' : error.details[0].message}) ;

    if (filename) updateProduct.photo = filename;

    try{
        const id = req.params.id ;
        if(isNaN(id) || id <=0) {
            throw new Error('bad request!') ;
        }
        const result = await knex('Products').where('id' , id).update(updateProduct);
        if (result === 0){
            res.status(400).send({'message' : 'The Products not found '}) ;
            return ;
        }
        res.status(200).send({'message' : 'The Products updated sucessfully'}) ;
    }catch(e){
        return res.status(400).send({'message' : e.message}) ;
    }
}