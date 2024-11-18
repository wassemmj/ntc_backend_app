const { order } = require('../models/order');
const { orderItem } = require('../models/order_item');
const Joi = require('joi');
const knex = require('../db');
const _ = require('lodash');

exports.makeOrder = async (req , res) => {
    const schema = Joi.object ({
        products : Joi.array().items(Joi.object({
            product_id : Joi.number().min(1).required() ,
            quantity : Joi.number().min(1).required() , 
        })) ,
    }) ;

    const newOrder = req.body ;

    const { error } = schema.validate(newOrder) ;
    if (error) return res.status(400).send({'message' : error.details[0].message}) ;

    for (let i = 0 ; i < newOrder.products.length ; i++) {
        const productId = newOrder.products[i].product_id ;
        const quantity = newOrder.products[i].quantity ;
        const query = await knex('Products').where('id' , productId) ;
        if (query.length === 0) {
            return res.status(200).send({'message' : 'Product id is wrong'}) ;
        }
        if (query[0].quantity < quantity) {
            return res.status(200).send({'message' : `Product quantity not available of product ${query[0].name}`}) ;
        }
    }

    const userId = req.user.id ;

    const Order = new order(userId) ; 

    try {
        const orderId = await Order.save() ;
        for (let i = 0 ; i < newOrder.products.length ; i++) {
            const orderItems = newOrder.products[i] ;
            const productId = newOrder.products[i].product_id ;
            orderItems.order_id = orderId ;
            const OrderItem = new orderItem(orderItems) ;
            const query = await knex('Products').where('id' , productId) ;
            const updateQuantity =  {quantity : query[0].quantity - newOrder.products[i].quantity};
            await knex('Products').where('id' , productId).update(updateQuantity) ;
            await OrderItem.save() ;
        }
        res.status(200).send({'message' : 'The Order created sucessfully'}) ;
    } catch (e) {
        return res.status(400).send({'message' : e}) ;
    }
}

exports.getUserOrder = async (req , res) => {
    const userId = req.user.id ;
    try {
        const query = await knex('Orders as o').select('*')
        .where('user_id' , userId) ;

        for (let i = 0 ; i < query.length ; i++) {
            query[i].products = await getOrderProduct(query[i].id) ;
        }

        res.status(200).send({'Orders' : query}) ;
    } catch (e) {
        console.log(e) ;
        return res.status(400).send({'message' : e}) ;
    }
}

async function getOrderProduct(orderId) {
    return await knex('OrderItems as oi').select('*')
        .join('Products as p' , 'p.id' , 'oi.product_id').where('oi.order_id' , orderId);
}

exports.getAllOrder = async (req , res) => {
    try {
        const query = await knex('Orders as o').select('*');

        for (let i = 0 ; i < query.length ; i++) {
            query[i].products = await getOrderProduct(query[i].id) ;
        }
        res.status(200).send({'Orders' : query}) ;
    } catch (e) {
        return res.status(400).send({'message' : e}) ;
    }
}











/*
exports.makeOrder = async (req , res) => {
    const schema = Joi.object ({
        products : Joi.array().items(Joi.object({
            product_id : Joi.number().min(1).required() ,
            quantity : Joi.number().min(1).required() , 
        })) ,
    }) ;

    const newOrder = req.body ;

    const { error } = schema.validate(newOrder) ;
    if (error) return res.status(400).send({'message' : error.details[0].message}) ;

    // for (let i = 0 ; i < newOrder.products.length ; i++) {
    //     const productId = newOrder.products[i].product_id ;
    //     const quantity = newOrder.products[i].quantity ;
    //     const query = await knex('Products').where('id' , productId) ;
    //     if (query.length === 0) {
    //         return res.status(200).send({'message' : 'Product id is wrong'}) ;
    //     }
    //     if (query[0].quantity < quantity) {
    //         return res.status(200).send({'message' : `Product quantity not available of product ${query[0].name}`}) ;
    //     }
    // }

    try {
        await knex.transaction(async (trx) => {
            const userId = req.user.id ;
            const Order = new order(userId) ;

            const orderId = await trx('Orders').insert({user_id : userId}) ; 

            for (let i = 0 ; i < newOrder.products.length ; i++) {
                const orderItems = newOrder.products[i] ;
                const productId = newOrder.products[i].product_id ;
                orderItems.order_id = orderId ;
                const OrderItem = new orderItem(orderItems) ;
                const query = await knex('Products').where('id' , productId) ;
                const updateQuantity =  {quantity : query[0].quantity - newOrder.products[i].quantity};
                await knex('Products').where('id' , productId).update(updateQuantity) ;
                await OrderItem.save() ;
            }

            await trx.commit() ;

            res.status(200).send({'message' : 'The Order created sucessfully'}) ;
        }) ; 

        // const orderId = await Order.save() ;
    } catch (e) {
        await knex.transaction().rollback() ;
        return res.status(400).send({'message' : e}) ;
    }
}
*/